import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { confirmOrderPaymentByCode } from "@/lib/order-workflow";
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

function getWebhookSecret(request: Request) {
  const configured = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!configured) return null;

  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const direct = request.headers.get("x-zion-webhook-secret")?.trim();
  const received = bearer || direct || "";

  return secureHeaderEquals(received, configured);
}

function stringValue(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
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

export async function POST(request: Request) {
  if (isRateLimited(request, "payment-webhook", 120, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas." }, { status: 429 });
  }

  if (!process.env.PAYMENT_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook não configurado." }, { status: 503 });
  }

  if (!getWebhookSecret(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const parsed = await parseJson(request, schema, 64_000);
  if (!parsed.ok) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const orderCode = normalizeOrderCode(parsed.data);
  const signal = normalizePaymentSignal(parsed.data);

  if (!orderCode) {
    return NextResponse.json({ error: "Pedido não informado." }, { status: 400 });
  }

  if (!approvedSignals.has(signal)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    await confirmOrderPaymentByCode(orderCode, "aprovado");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Pedido não localizado ou sem estoque disponível." }, { status: 409 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "/api/webhooks/payment" });
}
