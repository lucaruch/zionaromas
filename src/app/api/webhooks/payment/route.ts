import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { confirmOrderPayment } from "@/lib/order-workflow";
import { isRateLimited, parseJson } from "@/lib/security";

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
  "2",
  "6"
]);

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

// A Cielo não envia header de autenticação — identifica pelo formato do payload
function isCieloPayload(payload: Record<string, unknown>): boolean {
  return (
    typeof payload["PaymentId"] === "string" ||
    typeof payload["MerchantOrderId"] === "string" ||
    typeof payload["ChangeType"] === "number" ||
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
    "event",
    "type"
  ]).toLowerCase();
}

function normalizeOrderCode(payload: Record<string, unknown>) {
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
    "payment_id",
    "transactionId",
    "transaction_id",
    "tid",
    "TID",
    "nsu",
    "NSU"
  ]);
}

export async function POST(request: Request) {
  if (isRateLimited(request, "payment-webhook", 120, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas." }, { status: 429 });
  }

  const parsed = await parseJson(request, schema, 64_000);
  if (!parsed.ok) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  // Aceita sem autenticação se o payload for da Cielo (não envia secret)
  // Para outros gateways, exige PAYMENT_WEBHOOK_SECRET
  const fromCielo = isCieloPayload(parsed.data);
  if (!fromCielo) {
    if (!process.env.PAYMENT_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Webhook não configurado." }, { status: 503 });
    }
    if (!isAuthenticatedRequest(request)) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
  }

  const orderCode = normalizeOrderCode(parsed.data);
  const paymentReference = normalizePaymentReference(parsed.data);
  const signal = normalizePaymentSignal(parsed.data);

  if (!orderCode && !paymentReference) {
    return NextResponse.json({ error: "Pedido não informado." }, { status: 400 });
  }

  if (!approvedSignals.has(signal)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    await confirmOrderPayment({ code: orderCode, paymentReference }, "aprovado");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Pedido não localizado ou sem estoque disponível." }, { status: 409 });
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
