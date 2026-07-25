import type { Order, PaymentMethod } from "@prisma/client";
import { createQrCodeImage } from "@/lib/pix";
import { getPaymentSettings } from "@/lib/payment-store";
import { providerLabels, type PaymentSettings } from "@/lib/payments";
import { confirmOrderPayment, confirmOrderPaymentByCode, normalizeOrderCode } from "@/lib/order-workflow";
import { prisma } from "@/lib/prisma";
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

function cieloApiUrls(settings: PaymentSettings) {
  const production = "https://api.cieloecommerce.cielo.com.br";
  const sandbox = "https://apisandbox.cieloecommerce.cielo.com.br";
  return settings.environment === "PRODUCAO" ? [production, sandbox] : [sandbox, production];
}

function cieloQueryUrls(settings: PaymentSettings) {
  const production = "https://apiquery.cieloecommerce.cielo.com.br";
  const sandbox = "https://apiquerysandbox.cieloecommerce.cielo.com.br";
  return settings.environment === "PRODUCAO" ? [production, sandbox] : [sandbox, production];
}

const cieloApprovedStatuses = new Set([1, 2]);

function cieloCredentials() {
  const merchantId = process.env.CIELO_MERCHANT_ID?.trim();
  const merchantKey = process.env.CIELO_MERCHANT_KEY?.trim();
  if (!merchantId || !merchantKey) return null;
  return { merchantId, merchantKey };
}

export function isCieloPaymentApproved(status: unknown) {
  const numeric = Number(status);
  return Number.isFinite(numeric) && cieloApprovedStatuses.has(numeric);
}

function looksLikeCieloPaymentId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim());
}

export async function fetchCieloPaymentById(paymentId: string, settings: PaymentSettings) {
  const credentials = cieloCredentials();
  if (!credentials || !paymentId.trim()) return null;

  for (const baseUrl of cieloQueryUrls(settings)) {
    try {
      const response = await fetch(`${baseUrl}/1/sales/${encodeURIComponent(paymentId.trim())}`, {
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
        console.error(`[Cielo Query] ${baseUrl} falhou ${response.status} | Body: ${JSON.stringify(data)}`);
        continue;
      }

      return data as { Payment?: Record<string, unknown>; MerchantOrderId?: string };
    } catch (error) {
      console.error(`[Cielo Query] Erro em ${baseUrl}:`, error);
    }
  }

  return null;
}

export async function fetchCieloSalesByMerchantOrderId(merchantOrderId: string, settings: PaymentSettings) {
  const credentials = cieloCredentials();
  const cleanId = merchantOrderId.replace(/[^A-Za-z0-9]/g, "").trim().toUpperCase();
  if (!credentials || !cleanId) return [];

  for (const baseUrl of cieloQueryUrls(settings)) {
    try {
      const response = await fetch(`${baseUrl}/1/sales?merchantOrderId=${encodeURIComponent(cleanId)}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          MerchantId: credentials.merchantId,
          MerchantKey: credentials.merchantKey
        },
        signal: AbortSignal.timeout(12_000)
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        console.error(`[Cielo Query MerchantOrder] ${baseUrl} falhou ${response.status} | Body: ${JSON.stringify(data)}`);
        continue;
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
          (typeof nestedPayment?.Paymentid === "string" && nestedPayment.Paymentid) ||
          (typeof item.PaymentId === "string" && item.PaymentId) ||
          (typeof item.Paymentid === "string" && item.Paymentid) ||
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

      if (parsedRows.length) return parsedRows;
    } catch (error) {
      console.error(`[Cielo Query MerchantOrder] Erro em ${baseUrl}:`, error);
    }
  }

  return [];
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
  console.log(
    `[Cielo Confirm] PaymentId=${sale.PaymentId || payment.PaymentId || "-"} MerchantOrderId=${sale.MerchantOrderId || fallbackCode || "-"} Status=${payment.Status}`
  );
  if (!isCieloPaymentApproved(statusNumber)) {
    return { synced: true as const, approved: false as const, status: statusNumber };
  }

  const paymentId =
    (typeof payment.PaymentId === "string" && payment.PaymentId) ||
    (typeof payment.Paymentid === "string" && payment.Paymentid) ||
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
      sale.PaymentId ||
      (typeof sale.Payment?.PaymentId === "string" ? sale.Payment.PaymentId : undefined) ||
      (typeof sale.Payment?.Paymentid === "string" ? sale.Payment.Paymentid : undefined);

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

/** Confere na Cielo os pedidos PIX/cartão ainda pendentes e aprova os que já foram pagos. */
export async function syncPendingCieloOrders(limit = 40) {
  const settings = await getPaymentSettings();
  if (!cieloCredentials()) return { checked: 0, approved: 0 };

  const pending = await prisma.order.findMany({
    where: {
      paymentStatus: { not: "aprovado" },
      status: { not: "CANCELADO" },
      createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 72) }
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      code: true,
      paymentReference: true,
      paymentMethod: true,
      paymentProvider: true
    }
  });

  let approved = 0;

  for (const order of pending) {
    try {
      const result = await syncOrderPaymentFromCielo(
        { code: order.code, paymentReference: order.paymentReference },
        settings
      );
      if (result.approved) approved += 1;
    } catch (error) {
      console.error(`[syncPendingCieloOrders] Falha no pedido ${order.code}:`, error);
    }
  }

  return { checked: pending.length, approved };
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

function extractCieloErrorMessage(data: unknown) {
  if (Array.isArray(data)) {
    const parts = data
      .map((item) => {
        if (!item || typeof item !== "object") return "";
        const row = item as Record<string, unknown>;
        const code = row.Code ?? row.code;
        const message = row.Message ?? row.message;
        if (typeof message === "string" && message.trim()) {
          return code != null ? `${code}: ${message.trim()}` : message.trim();
        }
        return "";
      })
      .filter(Boolean);
    if (parts.length) return parts.join(" | ");
  }

  if (data && typeof data === "object") {
    const row = data as Record<string, unknown>;
    if (typeof row.Message === "string" && row.Message.trim()) return row.Message.trim();
    if (typeof row.message === "string" && row.message.trim()) return row.message.trim();
    const payment = row.Payment;
    if (payment && typeof payment === "object") {
      const paymentRow = payment as Record<string, unknown>;
      if (typeof paymentRow.ReturnMessage === "string" && paymentRow.ReturnMessage.trim()) {
        return paymentRow.ReturnMessage.trim();
      }
    }
  }

  return "";
}

function extractPixFromPayment(payment: Record<string, unknown>) {
  const pixQrCode =
    (typeof payment.QrCodeString === "string" && payment.QrCodeString) ||
    (typeof payment.QrcodeString === "string" && payment.QrcodeString) ||
    (typeof payment.qrCodeString === "string" && payment.qrCodeString) ||
    (typeof payment.QrCode === "string" && payment.QrCode.startsWith("000201") ? payment.QrCode : undefined) ||
    undefined;

  const rawImage =
    payment.QrcodeBase64Image ??
    payment.QrCodeBase64Image ??
    payment.qrCodeBase64Image ??
    (typeof payment.QrCode === "string" && !payment.QrCode.startsWith("000201") ? payment.QrCode : undefined);

  const paymentId =
    (typeof payment.PaymentId === "string" && payment.PaymentId) ||
    (typeof payment.Paymentid === "string" && payment.Paymentid) ||
    undefined;

  return {
    pixQrCode,
    cieloPixImage: base64Image(rawImage),
    paymentId,
    returnMessage: typeof payment.ReturnMessage === "string" ? payment.ReturnMessage : ""
  };
}

async function createCieloPixCharge(
  order: Order,
  customer: { name: string; email: string; document?: string },
  settings: PaymentSettings
) {
  const credentials = cieloCredentials();
  if (!credentials) {
    console.error("[Cielo] Credenciais ausentes: CIELO_MERCHANT_ID ou CIELO_MERCHANT_KEY não configurados.");
    return {
      method: "PIX" as const,
      provider: providerLabels.CIELO,
      status: "manual" as const,
      message: "Credenciais da Cielo ausentes no servidor (CIELO_MERCHANT_ID / CIELO_MERCHANT_KEY)."
    };
  }

  const amount = cents(Number(order.total));
  if (!Number.isFinite(amount) || amount < 1) {
    return {
      method: "PIX" as const,
      provider: providerLabels.CIELO,
      status: "manual" as const,
      message: "Valor do pedido inválido para gerar PIX."
    };
  }

  const merchantOrderId = sanitizeMerchantOrderId(order.code);
  const documentDigits = (customer.document || "").replace(/\D/g, "");
  const identityType = documentDigits.length === 14 ? "CNPJ" : documentDigits.length === 11 ? "CPF" : undefined;

  if (!identityType) {
    return {
      method: "PIX" as const,
      provider: providerLabels.CIELO,
      status: "manual" as const,
      message: "Informe um CPF ou CNPJ válido para gerar o PIX na Cielo."
    };
  }

  const customerPayload: Record<string, string> = {
    Name: sanitizeHolderName(customer.name) || customer.name,
    Identity: documentDigits,
    IdentityType: identityType,
    Email: customer.email
  };

  const paymentVariants: Array<Record<string, unknown>> = [
    { Type: "Pix", Amount: amount },
    { Type: "Pix", Amount: amount, QrCodeExpiration: 86400 }
  ];

  let lastError = "Não foi possível gerar o PIX na Cielo.";
  let lastRaw: unknown;

  for (const apiUrl of cieloApiUrls(settings)) {
    for (const paymentBody of paymentVariants) {
      try {
        console.log(
          `[Cielo] PIX POST ${apiUrl}/1/sales | MerchantOrderId=${merchantOrderId} | Amount=${amount} | Env=${settings.environment}`
        );

        const response = await fetch(`${apiUrl}/1/sales`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            MerchantId: credentials.merchantId,
            MerchantKey: credentials.merchantKey
          },
          body: JSON.stringify({
            MerchantOrderId: merchantOrderId,
            Customer: customerPayload,
            Payment: paymentBody
          }),
          signal: AbortSignal.timeout(20_000)
        });

        const data = await response.json().catch(() => ({}));
        lastRaw = data;
        console.log(`[Cielo] PIX HTTP ${response.status} | Body: ${JSON.stringify(data)}`);

        const errorMessage = extractCieloErrorMessage(data);
        if (!response.ok) {
          lastError = errorMessage
            ? `Cielo recusou o PIX: ${errorMessage}`
            : `Cielo recusou o PIX (HTTP ${response.status}). Confira se o PIX está habilitado em Meu Cadastro > Autorizações.`;
          continue;
        }

        const payment =
          data && typeof data === "object" && !Array.isArray(data)
            ? ((data as { Payment?: Record<string, unknown> }).Payment || {})
            : {};
        const extracted = extractPixFromPayment(payment);
        const pixQrCodeImage = extracted.pixQrCode
          ? await createQrCodeImage(extracted.pixQrCode).catch(() => extracted.cieloPixImage)
          : extracted.cieloPixImage;

        if (extracted.pixQrCode || pixQrCodeImage) {
          return {
            method: "PIX" as const,
            provider: providerLabels.CIELO,
            status: "ready" as const,
            message: "PIX gerado pela Cielo. Escaneie o QR Code ou use o copia e cola.",
            reference: extracted.paymentId,
            pixQrCode: extracted.pixQrCode,
            pixQrCodeImage,
            raw: data
          };
        }

        lastError =
          extracted.returnMessage ||
          errorMessage ||
          "A Cielo respondeu sem QR Code. Verifique se o PIX está habilitado na conta Cielo.";
      } catch (error) {
        console.error(`[Cielo] PIX falhou em ${apiUrl}:`, error);
        lastError = "Falha de conexão com a Cielo ao gerar o PIX.";
      }
    }
  }

  return {
    method: "PIX" as const,
    provider: providerLabels.CIELO,
    status: "manual" as const,
    message: lastError,
    raw: lastRaw
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
    const hasCieloCredentials = Boolean(process.env.CIELO_MERCHANT_ID?.trim() && process.env.CIELO_MERCHANT_KEY?.trim());

    // PIX deve cair na Cielo — não usa PIX_KEY (chave de outro banco/CNPJ).
    if (settings.activeProvider === "CIELO" && hasCieloCredentials) {
      return (
        (await createCieloPixCharge(order, customer, settings).catch((error) => {
          console.error("[Cielo PIX] Falha ao gerar cobrança:", error);
          return {
            method: "PIX" as const,
            provider: providerLabels.CIELO,
            status: "manual" as const,
            message: "Falha ao gerar PIX na Cielo. Tente novamente em instantes."
          };
        })) || {
          method: "PIX",
          provider: providerLabels.CIELO,
          status: "manual",
          message:
            "Não foi possível gerar o PIX na Cielo. Verifique se o PIX está habilitado em Meu Cadastro > Autorizações."
        }
      );
    }

    return {
      method: "PIX",
      provider: providerLabels[settings.activeProvider],
      status: "manual",
      message:
        "Configure CIELO_MERCHANT_ID e CIELO_MERCHANT_KEY no servidor para gerar PIX pela Cielo. A chave PIX_KEY não é usada para não cair em outro banco."
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
