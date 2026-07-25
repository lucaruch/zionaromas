import type { Order, PaymentMethod } from "@prisma/client";
import { createPixPayload, createQrCodeImage } from "@/lib/pix";
import { getPaymentSettings } from "@/lib/payment-store";
import { providerLabels, type PaymentSettings } from "@/lib/payments";
import { confirmOrderPayment, confirmOrderPaymentByCode, normalizeOrderCode } from "@/lib/order-workflow";
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

function cieloQueryUrl(settings: PaymentSettings) {
  return settings.environment === "PRODUCAO"
    ? "https://apiquery.cieloecommerce.cielo.com.br"
    : "https://apiquerysandbox.cieloecommerce.cielo.com.br";
}

const cieloApprovedStatuses = new Set([1, 2]);

function cieloCredentials() {
  const merchantId = process.env.CIELO_MERCHANT_ID?.trim();
  const merchantKey = process.env.CIELO_MERCHANT_KEY?.trim();
  if (!merchantId || !merchantKey) return null;
  return { merchantId, merchantKey };
}

export function isCieloPaymentApproved(status: unknown) {
  return cieloApprovedStatuses.has(Number(status));
}

function looksLikeCieloPaymentId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim());
}

export async function fetchCieloPaymentById(paymentId: string, settings: PaymentSettings) {
  const credentials = cieloCredentials();
  if (!credentials || !paymentId.trim()) return null;

  const response = await fetch(`${cieloQueryUrl(settings)}/1/sales/${encodeURIComponent(paymentId.trim())}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      MerchantId: credentials.merchantId,
      MerchantKey: credentials.merchantKey
    },
    signal: AbortSignal.timeout(12_000)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error(`[Cielo Query] Falha ${response.status} | Body: ${JSON.stringify(data)}`);
    return null;
  }

  return data as { Payment?: Record<string, unknown>; MerchantOrderId?: string };
}

export async function fetchCieloSalesByMerchantOrderId(merchantOrderId: string, settings: PaymentSettings) {
  const credentials = cieloCredentials();
  const cleanId = merchantOrderId.replace(/[^A-Za-z0-9]/g, "").trim().toUpperCase();
  if (!credentials || !cleanId) return [];

  const response = await fetch(
    `${cieloQueryUrl(settings)}/1/sales?merchantOrderId=${encodeURIComponent(cleanId)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        MerchantId: credentials.merchantId,
        MerchantKey: credentials.merchantKey
      },
      signal: AbortSignal.timeout(12_000)
    }
  );

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    console.error(`[Cielo Query MerchantOrder] Falha ${response.status} | Body: ${JSON.stringify(data)}`);
    return [];
  }

  type CieloSaleRow = {
    PaymentId?: string;
    MerchantOrderId: string;
    Payment?: Record<string, unknown>;
  };

  const rows: unknown[] = Array.isArray(data)
    ? data
    : data && typeof data === "object" && Array.isArray((data as { Payments?: unknown }).Payments)
      ? (data as { Payments: unknown[] }).Payments
      : data && typeof data === "object" && (data as { Payment?: unknown }).Payment
        ? [data]
        : [];

  const parsedRows: CieloSaleRow[] = [];

  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const item = row as Record<string, unknown>;
    const nestedPayment =
      item.Payment && typeof item.Payment === "object"
        ? (item.Payment as Record<string, unknown>)
        : undefined;
    const paymentId =
      (typeof nestedPayment?.PaymentId === "string" && nestedPayment.PaymentId) ||
      (typeof item.PaymentId === "string" && item.PaymentId) ||
      undefined;
    const merchantOrder =
      (typeof item.MerchantOrderId === "string" && item.MerchantOrderId) ||
      (typeof nestedPayment?.MerchantOrderId === "string" && nestedPayment.MerchantOrderId) ||
      cleanId;

    parsedRows.push({
      PaymentId: paymentId,
      MerchantOrderId: merchantOrder,
      Payment: nestedPayment || (paymentId || item.Status !== undefined ? item : undefined)
    });
  }

  return parsedRows;
}

async function confirmApprovedCieloSale(
  sale: {
    Payment?: Record<string, unknown>;
    MerchantOrderId?: string;
    PaymentId?: string;
  },
  fallbackCode?: string
) {
  const payment = sale.Payment || {};
  const statusNumber = Number(payment.Status);
  if (!isCieloPaymentApproved(statusNumber)) {
    return { synced: true as const, approved: false as const, status: statusNumber };
  }

  const paymentId =
    (typeof payment.PaymentId === "string" && payment.PaymentId) ||
    (typeof sale.PaymentId === "string" && sale.PaymentId) ||
    undefined;
  const merchantOrderId =
    typeof sale.MerchantOrderId === "string"
      ? sale.MerchantOrderId
      : typeof payment.MerchantOrderId === "string"
        ? payment.MerchantOrderId
        : undefined;
  const orderCode = normalizeOrderCode(merchantOrderId || fallbackCode || "");

  await confirmOrderPayment(
    { code: orderCode || undefined, paymentReference: paymentId },
    "aprovado",
    { paymentReference: paymentId }
  );

  return {
    synced: true as const,
    approved: true as const,
    status: statusNumber,
    merchantOrderId,
    paymentId
  };
}

export async function syncCieloPaymentStatus(paymentId: string, settings?: PaymentSettings) {
  const paymentSettings = settings || (await getPaymentSettings());
  const sale = await fetchCieloPaymentById(paymentId, paymentSettings);
  if (!sale) return { synced: false as const, approved: false as const, status: undefined as number | undefined };
  return confirmApprovedCieloSale({ ...sale, PaymentId: paymentId });
}

export async function syncOrderPaymentFromCielo(
  order: { code: string; paymentReference?: string | null },
  settings?: PaymentSettings
) {
  const paymentSettings = settings || (await getPaymentSettings());

  if (order.paymentReference && looksLikeCieloPaymentId(order.paymentReference)) {
    const byPaymentId = await syncCieloPaymentStatus(order.paymentReference, paymentSettings);
    if (byPaymentId.approved) return byPaymentId;
  }

  const sales = await fetchCieloSalesByMerchantOrderId(order.code, paymentSettings);
  if (!sales.length) {
    return { synced: false as const, approved: false as const, status: undefined as number | undefined };
  }

  let lastStatus: number | undefined;

  for (const sale of sales) {
    const paymentId =
      sale.PaymentId || (typeof sale.Payment?.PaymentId === "string" ? sale.Payment.PaymentId : undefined);

    // A consulta por MerchantOrderId costuma devolver só o PaymentId — busca o status completo.
    if (paymentId) {
      const detailed = await syncCieloPaymentStatus(paymentId, paymentSettings);
      if (detailed.approved) return detailed;
      if (typeof detailed.status === "number" && !Number.isNaN(detailed.status)) lastStatus = detailed.status;
      continue;
    }

    const result = await confirmApprovedCieloSale(sale, order.code);
    if (result.approved) return result;
    if (typeof result.status === "number" && !Number.isNaN(result.status)) lastStatus = result.status;
  }

  return {
    synced: true as const,
    approved: false as const,
    status: lastStatus
  };
}

function base64Image(value: unknown) {
  if (typeof value !== "string" || !value) return undefined;
  if (value.startsWith("data:image")) return value;
  return `data:image/png;base64,${value}`;
}

function cieloCardProvider() {
  return "Simulado" as const;
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
  return clean.slice(0, 50) || "ZIONAROMAS";
}

async function createCieloPixCharge(
  order: Order,
  customer: { name: string; email: string; document?: string },
  settings: PaymentSettings
) {
  const merchantId = process.env.CIELO_MERCHANT_ID?.trim();
  const merchantKey = process.env.CIELO_MERCHANT_KEY?.trim();
  if (!merchantId || !merchantKey) {
    console.error("[Cielo] Credenciais ausentes: CIELO_MERCHANT_ID ou CIELO_MERCHANT_KEY não configurados.");
    return null;
  }

  const apiUrl = cieloApiUrl(settings);
  const merchantOrderId = sanitizeMerchantOrderId(order.code);
  const documentDigits = (customer.document || "").replace(/\D/g, "");
  const identityType = documentDigits.length === 14 ? "CNPJ" : documentDigits.length === 11 ? "CPF" : undefined;

  // Payload mínimo oficial da Cielo (Type + Amount). Provider/QrCode extras costumam quebrar a geração.
  const customerPayload: Record<string, string> = {
    Name: customer.name,
    Email: customer.email
  };
  if (identityType && documentDigits) {
    customerPayload.Identity = documentDigits;
    customerPayload.IdentityType = identityType;
  }

  console.log(`[Cielo] Iniciando cobrança PIX | URL: ${apiUrl}/1/sales | MerchantOrderId: ${merchantOrderId}`);

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
      Customer: customerPayload,
      Payment: {
        Type: "Pix",
        Amount: cents(Number(order.total))
      }
    }),
    signal: AbortSignal.timeout(15_000)
  });

  const data = await response.json().catch(() => ({}));
  console.log(`[Cielo] Resposta HTTP ${response.status} | Body: ${JSON.stringify(data)}`);

  const payment = (data as { Payment?: Record<string, unknown> }).Payment || {};
  const returnMessage =
    typeof payment.ReturnMessage === "string"
      ? payment.ReturnMessage
      : typeof (data as { Message?: unknown }).Message === "string"
        ? String((data as { Message: string }).Message)
        : "";

  if (!response.ok) {
    return {
      method: "PIX" as const,
      provider: providerLabels.CIELO,
      status: "manual" as const,
      message: returnMessage
        ? `Não foi possível gerar o PIX na Cielo: ${returnMessage}`
        : "Pedido recebido. Nossa equipe enviará as instruções de pagamento em instantes.",
      raw: data
    };
  }

  const pixQrCode =
    typeof payment.QrCodeString === "string"
      ? payment.QrCodeString
      : typeof payment.QrCode === "string"
        ? payment.QrCode
        : undefined;
  const cieloPixImage = base64Image(payment.QrcodeBase64Image ?? payment.QrCodeBase64Image);
  const pixQrCodeImage = pixQrCode
    ? await createQrCodeImage(pixQrCode).catch(() => cieloPixImage)
    : cieloPixImage;
  const paymentId =
    typeof payment.PaymentId === "string"
      ? payment.PaymentId
      : typeof payment.Paymentid === "string"
        ? payment.Paymentid
        : undefined;

  if (!pixQrCode && !pixQrCodeImage) {
    return {
      method: "PIX" as const,
      provider: providerLabels.CIELO,
      status: "manual" as const,
      message: returnMessage || "A Cielo não retornou o QR Code do PIX.",
      reference: paymentId,
      raw: data
    };
  }

  return {
    method: "PIX" as const,
    provider: providerLabels.CIELO,
    status: "ready" as const,
    message: "PIX gerado com segurança. Escaneie o QR Code ou use o copia e cola.",
    reference: paymentId,
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
    Amount: cents(Number(order.total)),
    SoftDescriptor: "ZION AROMAS",
    ...(settings.environment === "HOMOLOGACAO" ? { Provider: cieloCardProvider() } : {}),
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
    try {
      await confirmOrderPaymentByCode(order.code, "aprovado");
      return {
        method: "CARTAO" as const,
        provider: providerLabels.CIELO,
        status: "ready" as const,
        message: "Pagamento com cartão APROVADO com sucesso!",
        reference: paymentId,
        raw: data
      };
    } catch (error) {
      console.error(`[Cielo Card] Pagamento autorizado, mas pedido não confirmado:`, error);
      return {
        method: "CARTAO" as const,
        provider: providerLabels.CIELO,
        status: "manual" as const,
        message: "Pagamento autorizado. Nossa equipe confirmará o pedido em instantes.",
        reference: paymentId,
        raw: data
      };
    }
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
  customer: { name: string; email: string; document?: string };
  settings: PaymentSettings;
  card?: CardDetails;
}): Promise<PaymentInstruction> {
  if (order.paymentMethod === "PIX") {
    if (settings.activeProvider === "CIELO") {
      const cieloPix = await createCieloPixCharge(order, customer, settings).catch((error) => {
        console.error("[Cielo PIX] Falha ao gerar cobrança:", error);
        return null;
      });
      if (cieloPix?.status === "ready" && (cieloPix.pixQrCode || cieloPix.pixQrCodeImage)) {
        return cieloPix;
      }

      // Se a Cielo falhar, usa PIX estático para o cliente sempre ver o QR.
      const staticPix = await createStaticPixCharge(order).catch((error) => {
        console.error("[PIX estático] Falha ao gerar QR:", error);
        return null;
      });
      if (staticPix) return staticPix;
      if (cieloPix) return cieloPix;
    } else {
      const staticPix = await createStaticPixCharge(order).catch(() => null);
      if (staticPix) return staticPix;
    }

    return {
      method: "PIX",
      provider: providerLabels[settings.activeProvider],
      status: "manual",
      message: "Não foi possível gerar o PIX agora. Confira as credenciais da Cielo ou a PIX_KEY no servidor."
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
