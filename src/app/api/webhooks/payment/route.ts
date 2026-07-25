import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { confirmOrderPayment, findOrderForPayment, normalizeOrderCode } from "@/lib/order-workflow";
import { getPaymentSettings } from "@/lib/payment-store";
import {
  fetchCieloPaymentById,
  syncCieloPaymentStatus,
  syncOrderPaymentFromCielo
} from "@/lib/payment-processing";
import { isRateLimited } from "@/lib/security";

const schema = z.record(z.unknown());

const approvedSignals = new Set([
  "approved",
  "aprovado",
  "paid",
  "pago",
  "captured",
  "confirmado",
  "authorized",
  "autorizado",
  "1",
  "2",
  "6"
]);

const cieloStatusChangeTypes = new Set(["1", "5"]);

function secureHeaderEquals(value: string, expected: string) {
  const left = Buffer.from(value);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

function isAuthenticatedRequest(request: Request): boolean {
  const configured = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!configured) return false;

  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const direct = request.headers.get("x-zion-webhook-secret")?.trim();
  const received = bearer || direct || "";

  return secureHeaderEquals(received, configured);
}

function isCieloPayload(payload: Record<string, unknown>): boolean {
  return (
    typeof payload["PaymentId"] === "string" ||
    typeof payload["paymentId"] === "string" ||
    typeof payload["MerchantOrderId"] === "string" ||
    typeof payload["ChangeType"] === "number" ||
    typeof payload["ChangeType"] === "string" ||
    (typeof payload["Payment"] === "object" && payload["Payment"] !== null)
  );
}

function stringValue(payload: unknown, keys: string[], depth = 0): string {
  if (!payload || depth > 4) return "";

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const nested = stringValue(item, keys, depth + 1);
      if (nested) return nested;
    }
    return "";
  }

  if (typeof payload === "object") {
    const acceptedKeys = new Set(keys.map((key) => key.toLowerCase()));

    for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
      if (acceptedKeys.has(key.toLowerCase())) {
        if (typeof value === "string" && value.trim()) return value.trim();
        if (typeof value === "number") return String(value);
      }
    }

    for (const value of Object.values(payload as Record<string, unknown>)) {
      const nested = stringValue(value, keys, depth + 1);
      if (nested) return nested;
    }
  }

  return "";
}

function normalizePaymentSignal(payload: Record<string, unknown>) {
  return stringValue(payload, [
    "paymentStatus",
    "status",
    "Status",
    "payment_status",
    "PaymentStatus",
    "event"
  ]).toLowerCase();
}

function normalizeOrderCodeRaw(payload: Record<string, unknown>) {
  return stringValue(payload, [
    "orderCode",
    "order_code",
    "merchantOrderId",
    "MerchantOrderId",
    "merchant_order_id",
    "reference",
    "referenceId"
  ]).toUpperCase();
}

function normalizePaymentReference(payload: Record<string, unknown>) {
  return stringValue(payload, [
    "paymentReference",
    "payment_reference",
    "paymentId",
    "PaymentId",
    "Paymentid",
    "payment_id",
    "transactionId",
    "transaction_id",
    "tid",
    "TID",
    "nsu",
    "NSU"
  ]);
}

/** A Cielo às vezes envia JSON sem Content-Type, ou form-urlencoded. */
async function parseWebhookPayload(request: Request): Promise<Record<string, unknown> | null> {
  const contentType = (request.headers.get("content-type") || "").toLowerCase();

  try {
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      const data: Record<string, unknown> = {};
      for (const [key, value] of params.entries()) {
        const asNumber = Number(value);
        data[key] = value !== "" && Number.isFinite(asNumber) && String(asNumber) === value ? asNumber : value;
      }
      return data;
    }

    const text = await request.text();
    if (!text.trim()) return null;

    try {
      const json = JSON.parse(text) as unknown;
      const parsed = schema.safeParse(json);
      return parsed.success ? parsed.data : null;
    } catch {
      const params = new URLSearchParams(text);
      if ([...params.keys()].length) {
        const data: Record<string, unknown> = {};
        for (const [key, value] of params.entries()) data[key] = value;
        return data;
      }
      return null;
    }
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (isRateLimited(request, "payment-webhook", 120, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas." }, { status: 429 });
  }

  const payload = await parseWebhookPayload(request);
  if (!payload) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  let orderCode = normalizeOrderCode(normalizeOrderCodeRaw(payload));
  const paymentReference = normalizePaymentReference(payload);
  const signal = normalizePaymentSignal(payload);
  const changeType = stringValue(payload, ["ChangeType", "changeType", "change_type"]);

  if (!orderCode && !paymentReference) {
    return NextResponse.json({ error: "Pedido não informado." }, { status: 400 });
  }

  const fromCielo = isCieloPayload(payload);
  const authenticated = isAuthenticatedRequest(request);

  if (!fromCielo) {
    if (!process.env.PAYMENT_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Webhook não configurado." }, { status: 503 });
    }

    if (!authenticated) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
  }

  // Notificação típica da Cielo: { PaymentId, ChangeType } — consulta a venda e localiza o pedido.
  if (fromCielo && paymentReference) {
    try {
      const settings = await getPaymentSettings();
      const sale = await fetchCieloPaymentById(paymentReference, settings);
      const merchantOrderId =
        (typeof sale?.MerchantOrderId === "string" && sale.MerchantOrderId) ||
        (typeof sale?.Payment?.MerchantOrderId === "string" && String(sale.Payment.MerchantOrderId)) ||
        "";
      if (merchantOrderId && !orderCode) {
        orderCode = normalizeOrderCode(merchantOrderId);
      }

      const knownOrder = await findOrderForPayment({
        code: orderCode || undefined,
        paymentReference
      });

      if (!authenticated && !knownOrder && !sale) {
        return NextResponse.json({ error: "Referência de pagamento não reconhecida." }, { status: 401 });
      }

      if (!authenticated && !knownOrder && sale && orderCode) {
        const matched = await findOrderForPayment({ code: orderCode });
        if (!matched) {
          return NextResponse.json({ error: "Pedido não reconhecido." }, { status: 401 });
        }
      }

      const shouldQuery =
        !approvedSignals.has(signal) || cieloStatusChangeTypes.has(changeType) || Boolean(changeType);

      if (shouldQuery) {
        const synced = await syncCieloPaymentStatus(paymentReference, settings);
        if (synced.approved) {
          return NextResponse.json({ ok: true, synced: true });
        }

        if (orderCode) {
          const order = await findOrderForPayment({ code: orderCode, paymentReference });
          if (order) {
            const byOrder = await syncOrderPaymentFromCielo(
              { code: order.code, paymentReference: order.paymentReference || paymentReference },
              settings
            );
            if (byOrder.approved) {
              return NextResponse.json({ ok: true, synced: true });
            }
            return NextResponse.json({ ok: true, ignored: !byOrder.synced, status: byOrder.status ?? null });
          }
        }

        return NextResponse.json({ ok: true, ignored: !synced.synced, status: synced.status ?? null });
      }
    } catch (error) {
      console.error("[payment-webhook] Falha ao sincronizar Cielo:", error);
      return NextResponse.json({ error: "Falha ao confirmar pagamento." }, { status: 409 });
    }
  }

  if (!approvedSignals.has(signal)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    await confirmOrderPayment(
      { code: orderCode || undefined, paymentReference: paymentReference || undefined },
      "aprovado",
      { paymentReference: paymentReference || undefined }
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[payment-webhook] Falha ao confirmar pedido:", error);
    return NextResponse.json({ error: "Pedido não localizado." }, { status: 409 });
  }
}

export async function GET() {
  const configured = Boolean(process.env.PAYMENT_WEBHOOK_SECRET);
  return NextResponse.json(
    {
      ok: configured,
      endpoint: "/api/webhooks/payment",
      method: "POST",
      authentication: "Authorization: Bearer ... ou x-zion-webhook-secret",
      configured
    },
    { status: configured ? 200 : 503 }
  );
}
