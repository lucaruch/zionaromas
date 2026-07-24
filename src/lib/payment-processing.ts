import type { Order, PaymentMethod } from "@prisma/client";
import { createPixPayload } from "@/lib/pix";
import { providerLabels, type PaymentSettings } from "@/lib/payments";

export type PaymentInstruction = {
  method: PaymentMethod;
  provider: string;
  status: "pending" | "ready" | "manual";
  message: string;
  reference?: string;
  pixQrCode?: string;
  pixQrCodeImage?: string;
  boletoUrl?: string;
  boletoBarcode?: string;
  raw?: unknown;
};

function cents(value: number) {
  return Math.round(value * 100);
}

const CIELO_API_URL = "https://api.cieloecommerce.cielo.com.br";

function base64Image(value: unknown) {
  if (typeof value !== "string" || !value) return undefined;
  if (value.startsWith("data:image")) return value;
  return `data:image/png;base64,${value}`;
}

async function createCieloPixCharge(order: Order, customer: { name: string; email: string }, settings: PaymentSettings) {
  const merchantId = process.env.CIELO_MERCHANT_ID?.trim();
  const merchantKey = process.env.CIELO_MERCHANT_KEY?.trim();
  if (!merchantId || !merchantKey) {
    console.error("[Cielo] Credenciais ausentes: CIELO_MERCHANT_ID ou CIELO_MERCHANT_KEY não configurados.");
    return null;
  }

  console.log(`[Cielo] Iniciando cobrança PIX | URL: ${CIELO_API_URL}/1/sales | MerchantId tamanho: ${merchantId.length} | MerchantKey tamanho: ${merchantKey.length}`);

  const response = await fetch(`${CIELO_API_URL}/1/sales`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      MerchantId: merchantId,
      MerchantKey: merchantKey
    },
    body: JSON.stringify({
      MerchantOrderId: order.code,
      Customer: {
        Name: customer.name,
        Email: customer.email
      },
      Payment: {
        Type: "Pix",
        Amount: cents(Number(order.total))
      }
    }),
    signal: AbortSignal.timeout(12_000)
  });

  const data = await response.json().catch(() => ({}));
  console.log(`[Cielo] Resposta HTTP ${response.status} | Body: ${JSON.stringify(data)}`);

  if (!response.ok) {
    return {
      method: "PIX" as const,
      provider: providerLabels.CIELO,
      status: "manual" as const,
      message: "Pedido recebido. Nossa equipe enviará as instruções de pagamento em instantes.",
      raw: data
    };
  }

  const payment = (data as { Payment?: Record<string, unknown> }).Payment || {};
  const pixQrCode =
    typeof payment.QrCodeString === "string"
      ? payment.QrCodeString
      : typeof payment.QrCode === "string"
        ? payment.QrCode
        : undefined;
  const pixQrCodeImage = base64Image(payment.QrCodeBase64Image);

  return {
    method: "PIX" as const,
    provider: providerLabels.CIELO,
    status: pixQrCode || pixQrCodeImage ? "ready" as const : "pending" as const,
    message: pixQrCode || pixQrCodeImage
      ? "PIX gerado com segurança. Escaneie o QR Code ou use o copia e cola."
      : "Pedido recebido. Aguarde a confirmação de pagamento.",
    reference: typeof payment.PaymentId === "string" ? payment.PaymentId : undefined,
    pixQrCode,
    pixQrCodeImage,
    raw: data
  };
}

async function createStaticPixCharge(order: Order) {
  const key = process.env.PIX_KEY;
  if (!key) return null;

  const pix = await createPixPayload({
    key,
    merchantName: process.env.PIX_MERCHANT_NAME || "ZION AROMAS",
    merchantCity: process.env.PIX_MERCHANT_CITY || "PRAIA GRANDE",
    amount: Number(order.total),
    txid: order.code.replace(/[^A-Za-z0-9]/g, ""),
    description: `Pedido ${order.code}`
  });

  return {
    method: "PIX" as const,
    provider: "PIX ZION AROMAS",
    status: "ready" as const,
    message: "PIX gerado. Escaneie o QR Code ou use o copia e cola.",
    reference: order.code,
    pixQrCode: pix.code,
    pixQrCodeImage: pix.image
  };
}

export async function createPaymentInstruction({
  order,
  customer,
  settings
}: {
  order: Order;
  customer: { name: string; email: string };
  settings: PaymentSettings;
}): Promise<PaymentInstruction> {
  if (order.paymentMethod === "PIX") {
    const cieloPix = settings.activeProvider === "CIELO"
      ? await createCieloPixCharge(order, customer, settings).catch(() => null)
      : null;
    if (cieloPix?.status === "ready") return cieloPix;

    const staticPix = await createStaticPixCharge(order).catch(() => null);
    if (staticPix) return staticPix;
    if (cieloPix) return cieloPix;

    return {
      method: "PIX",
      provider: providerLabels[settings.activeProvider],
      status: "manual",
      message: "Pedido recebido. Nossa equipe enviará as instruções de pagamento em instantes."
    };
  }

  if (order.paymentMethod === "BOLETO") {
    return {
      method: "BOLETO",
      provider: providerLabels[settings.activeProvider],
      status: "pending",
      message: "Pedido recebido. O boleto será emitido pelo ambiente seguro da operadora."
    };
  }

  return {
    method: "CARTAO",
    provider: providerLabels[settings.activeProvider],
    status: "pending",
    message: "Pedido recebido. A confirmação do cartão será processada pelo ambiente seguro da operadora."
  };
}
