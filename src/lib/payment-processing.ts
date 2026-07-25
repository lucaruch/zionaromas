import type { Order, PaymentMethod } from "@prisma/client";
import { createPixPayload } from "@/lib/pix";
import { providerLabels, type PaymentSettings } from "@/lib/payments";
import { confirmOrderPaymentByCode } from "@/lib/order-workflow";
import { getPublicSiteUrl } from "@/lib/site-url";

export type CardDetails = {
  cardType: "CreditCard" | "DebitCard";
  cardNumber: string;
  holder: string;
  expirationDate: string;
  securityCode: string;
  brand: string;
  installments?: number;
};

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
  redirectUrl?: string;
  raw?: unknown;
};

function cents(value: number) {
  return Math.round(value * 100);
}

function cieloApiUrl(settings: PaymentSettings) {
  return settings.environment === "PRODUCAO"
    ? "https://api.cieloecommerce.cielo.com.br"
    : "https://apisandbox.cieloecommerce.cielo.com.br";
}

function base64Image(value: unknown) {
  if (typeof value !== "string" || !value) return undefined;
  if (value.startsWith("data:image")) return value;
  return `data:image/png;base64,${value}`;
}

function cieloCardProvider() {
  return "Cielo30" as const;
}

function cieloPixProvider() {
  return "Cielo2" as const;
}

function sanitizeHolderName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function normalizeExpirationDate(value: string) {
  const clean = value.replace(/\D/g, "");
  const month = clean.slice(0, 2).padStart(2, "0");
  const year = clean.length >= 4 ? clean.slice(2, 6) : clean.length === 2 ? `20${clean}` : "";
  return `${month}/${year || "0000"}`;
}

function sanitizeMerchantOrderId(value: string) {
  const clean = value.replace(/[^A-Za-z0-9]/g, "").trim().toUpperCase();
  return clean.slice(0, 50) || "ZIONAORAMS";
}

async function createCieloPixCharge(order: Order, customer: { name: string; email: string }, settings: PaymentSettings) {
  const merchantId = process.env.CIELO_MERCHANT_ID?.trim();
  const merchantKey = process.env.CIELO_MERCHANT_KEY?.trim();
  if (!merchantId || !merchantKey) {
    console.error("[Cielo] Credenciais ausentes: CIELO_MERCHANT_ID ou CIELO_MERCHANT_KEY não configurados.");
    return null;
  }

  const apiUrl = cieloApiUrl(settings);
  console.log(`[Cielo] Iniciando cobrança PIX | URL: ${apiUrl}/1/sales | MerchantId tamanho: ${merchantId.length} | MerchantKey tamanho: ${merchantKey.length}`);

  const response = await fetch(`${apiUrl}/1/sales`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      MerchantId: merchantId,
      MerchantKey: merchantKey
    },
    body: JSON.stringify({
      MerchantOrderId: merchantOrderId,
      Customer: {
        Name: customer.name,
        Email: customer.email
      },
      Payment: {
        Type: "Pix",
        Provider: cieloPixProvider(),
        Amount: cents(Number(order.total)),
        QrCode: {
          Expiration: 86400
        }
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
  const pixQrCodeImage = base64Image(payment.QrcodeBase64Image ?? payment.QrCodeBase64Image);

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

async function createCieloCardCharge(
  order: Order,
  customer: { name: string; email: string },
  settings: PaymentSettings,
  card: CardDetails
) {
  const merchantId = process.env.CIELO_MERCHANT_ID?.trim();
  const merchantKey = process.env.CIELO_MERCHANT_KEY?.trim();
  if (!merchantId || !merchantKey) {
    console.error("[Cielo Card] Credenciais ausentes no ambiente.");
    return {
      method: "CARTAO" as const,
      provider: providerLabels.CIELO,
      status: "manual" as const,
      message: "Erro na operadora de cartão: Credenciais da loja não configuradas no servidor."
    };
  }

  const cleanCardNumber = card.cardNumber.replace(/\D/g, "");
  const formattedExpiration = normalizeExpirationDate(card.expirationDate);
  const isDebit = card.cardType === "DebitCard";
  const siteUrl = getPublicSiteUrl();
  const returnUrl = `${siteUrl}/api/checkout/callback`;
  const holder = sanitizeHolderName(card.holder);
  const merchantOrderId = sanitizeMerchantOrderId(order.code);

  const paymentPayload: Record<string, unknown> = {
    Type: isDebit ? "DebitCard" : "CreditCard",
    Provider: cieloCardProvider(),
    Amount: cents(Number(order.total)),
    SoftDescriptor: "ZION AROMAS",
    ...(isDebit
      ? {
          ReturnUrl: returnUrl,
          Authenticate: true,
          DebitCard: {
            CardNumber: cleanCardNumber,
            Holder: holder,
            ExpirationDate: formattedExpiration,
            SecurityCode: card.securityCode.trim(),
            Brand: card.brand || "Visa"
          }
        }
      : {
          Installments: Math.max(1, Math.min(12, card.installments || 1)),
          Capture: true,
          CreditCard: {
            CardNumber: cleanCardNumber,
            Holder: holder,
            ExpirationDate: formattedExpiration,
            SecurityCode: card.securityCode.trim(),
            Brand: card.brand || "Visa"
          }
        })
  };

  console.log(`[Cielo Card] Enviando requisição de Cartão de ${isDebit ? "Débito" : "Crédito"} para pedido ${merchantOrderId}`);

  const apiUrl = cieloApiUrl(settings);
  const response = await fetch(`${apiUrl}/1/sales`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      MerchantId: merchantId,
      MerchantKey: merchantKey
    },
    body: JSON.stringify({
      MerchantOrderId: merchantOrderId,
      Customer: {
        Name: customer.name,
        Email: customer.email
      },
      Payment: paymentPayload
    }),
    signal: AbortSignal.timeout(15_000)
  });

  const data = await response.json().catch(() => ({}));
  console.log(`[Cielo Card] Resposta ${response.status} | Body: ${JSON.stringify(data)}`);

  const payment = (data as { Payment?: Record<string, unknown> }).Payment || {};
  const statusNumber = Number(payment.Status);
  const returnMessage = String(payment.ReturnMessage || "Transação não autorizada");
  const authenticationUrl = typeof payment.AuthenticationUrl === "string" ? payment.AuthenticationUrl : undefined;
  const paymentId = typeof payment.PaymentId === "string" ? payment.PaymentId : undefined;

  // Status 1 = Authorized, 2 = Payment Confirmed (Captured)
  if (response.ok && (statusNumber === 2 || statusNumber === 1)) {
    await confirmOrderPaymentByCode(order.code, "aprovado").catch(() => null);

    return {
      method: "CARTAO" as const,
      provider: providerLabels.CIELO,
      status: "ready" as const,
      message: "Pagamento com cartão APROVADO com sucesso!",
      reference: paymentId,
      raw: data
    };
  }

  // 3DS Redirect (DebitCard or 3DS CreditCard)
  if (response.ok && (statusNumber === 12 || authenticationUrl)) {
    return {
      method: "CARTAO" as const,
      provider: providerLabels.CIELO,
      status: "pending" as const,
      message: "Aguardando autenticação 3DS do seu banco.",
      reference: paymentId,
      redirectUrl: authenticationUrl,
      raw: data
    };
  }

  return {
    method: "CARTAO" as const,
    provider: providerLabels.CIELO,
    status: "manual" as const,
    message: `Cartão recusado pela Cielo: ${returnMessage}`,
    reference: paymentId,
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
  settings,
  card
}: {
  order: Order;
  customer: { name: string; email: string };
  settings: PaymentSettings;
  card?: CardDetails;
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

  if (card && settings.activeProvider === "CIELO") {
    return createCieloCardCharge(order, customer, settings, card);
  }

  return {
    method: "CARTAO",
    provider: providerLabels[settings.activeProvider],
    status: "pending",
    message: "Pedido recebido. A confirmação do cartão será processada pelo ambiente seguro da operadora."
  };
}
