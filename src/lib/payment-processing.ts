import type { Order, PaymentMethod } from "@prisma/client";
import { createQrCodeImage } from "@/lib/pix";
import { getPaymentSettings } from "@/lib/payment-store";
import { providerLabels, type PaymentSettings } from "@/lib/payments";
import { confirmOrderPayment, confirmOrderPaymentByCode, normalizeOrderCode } from "@/lib/order-workflow";
import { prisma } from "@/lib/prisma";
import { getPublicSiteUrl } from "@/lib/site-url";

export type CardExternalAuthentication = {
  cavv?: string;
  xid?: string;
  eci: string;
  version?: string;
  referenceId?: string;
};

export type CardDetails = {
  cardType: "CreditCard" | "DebitCard";
  cardNumber: string;
  holder: string;
  expirationDate: string;
  securityCode: string;
  brand: string;
  installments?: number;
  externalAuthentication?: CardExternalAuthentication;
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

function softDescriptor() {
  return "ZIONAROMAS";
}

function detectCardBrand(cardNumber: string, fallback = "Visa") {
  const digits = cardNumber.replace(/\D/g, "");
  if (/^3[47]/.test(digits)) return "Amex";
  if (/^(606282|3841|6370|6371|6372)/.test(digits) || /^(606282|384100|384140|384160)/.test(digits)) return "Hipercard";
  if (
    /^(4011|4312|4389|4514|4576|5041|5066|5067|5090|6277|6362|6363|6500|6504|6505|6516|6550)/.test(digits) ||
    /^(506699|5067|4576|4011)/.test(digits)
  ) {
    return "Elo";
  }
  if (/^5[1-5]/.test(digits) || /^2(2[2-9]|[3-6]|7[01]|720)/.test(digits)) return "Master";
  if (/^4/.test(digits)) return "Visa";
  return fallback || "Visa";
}

function sanitizeHolderName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase()
    .slice(0, 25);
}

function normalizeExpirationDate(value: string) {
  const clean = value.replace(/\D/g, "");
  const month = clean.slice(0, 2).padStart(2, "0");
  let year = "";
  if (clean.length >= 6) year = clean.slice(2, 6);
  else if (clean.length === 4) year = `20${clean.slice(2, 4)}`;
  else if (clean.length === 2) year = "0000";
  else year = clean.slice(2) || "0000";
  return `${month}/${year}`;
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

function extractCieloErrorCode(data: unknown): string {
  if (Array.isArray(data)) {
    for (const item of data) {
      if (!item || typeof item !== "object") continue;
      const code = (item as Record<string, unknown>).Code ?? (item as Record<string, unknown>).code;
      if (code != null && String(code).trim()) return String(code).trim();
    }
  }
  if (data && typeof data === "object") {
    const row = data as Record<string, unknown>;
    if (row.Code != null) return String(row.Code);
    const payment = row.Payment;
    if (payment && typeof payment === "object") {
      const returnCode = (payment as Record<string, unknown>).ReturnCode;
      if (returnCode != null) return String(returnCode);
    }
  }
  return "";
}

function formatCieloCardError(data: unknown, httpStatus: number, environmentLabel: string) {
  const code = extractCieloErrorCode(data);
  const message = extractCieloErrorMessage(data);

  if (code === "129" || /affiliation not found/i.test(message)) {
    return (
      `Cielo não reconheceu a afiliação neste ambiente (${environmentLabel}). ` +
      `Confira CIELO_MERCHANT_ID/CIELO_MERCHANT_KEY e o ambiente em /admin/configuracoes ` +
      `(Homologação usa chaves sandbox; Produção usa chaves reais).`
    );
  }

  if (httpStatus === 403) {
    return (
      "Cielo bloqueou a cobrança autenticada (HTTP 403). " +
      "Confira se o 3DS está ativo e se CIELO_ESTABLISHMENT_CODE / CIELO_3DS_* estão corretos."
    );
  }

  if (message) return `Cielo recusou o cartão: ${message}`;
  return `Cielo recusou o cartão (HTTP ${httpStatus}).`;
}

function isSandboxApiUrl(apiUrl: string) {
  return apiUrl.includes("sandbox");
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
  customer: { name: string; email: string; document?: string },
  settings: PaymentSettings,
  card: CardDetails
) {
  const credentials = cieloCredentials();
  if (!credentials) {
    console.error("[Cielo Card] Credenciais ausentes no ambiente.");
    return {
      method: "CARTAO" as const,
      provider: providerLabels.CIELO,
      status: "manual" as const,
      message: "Erro na operadora de cartão: Credenciais da loja não configuradas no servidor."
    };
  }

  const amount = cents(Number(order.total));
  if (!Number.isFinite(amount) || amount < 1) {
    return {
      method: "CARTAO" as const,
      provider: providerLabels.CIELO,
      status: "manual" as const,
      message: "Valor do pedido inválido para cobrança no cartão."
    };
  }

  const cleanCardNumber = card.cardNumber.replace(/\D/g, "");
  if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
    return {
      method: "CARTAO" as const,
      provider: providerLabels.CIELO,
      status: "manual" as const,
      message: "Número do cartão inválido."
    };
  }

  const formattedExpiration = normalizeExpirationDate(card.expirationDate);
  if (!/^\d{2}\/\d{4}$/.test(formattedExpiration) || formattedExpiration.endsWith("/0000")) {
    return {
      method: "CARTAO" as const,
      provider: providerLabels.CIELO,
      status: "manual" as const,
      message: "Validade do cartão inválida. Use o formato MM/AAAA."
    };
  }

  const isDebit = card.cardType === "DebitCard";
  const siteUrl = getPublicSiteUrl();
  const returnUrl = `${siteUrl}/api/checkout/callback?orderCode=${encodeURIComponent(order.code)}`;
  const holder = sanitizeHolderName(card.holder);
  if (holder.length < 2) {
    return {
      method: "CARTAO" as const,
      provider: providerLabels.CIELO,
      status: "manual" as const,
      message: "Nome impresso no cartão inválido."
    };
  }

  const brand = detectCardBrand(cleanCardNumber, card.brand || "Visa");
  const merchantOrderId = sanitizeMerchantOrderId(order.code);
  const documentDigits = (customer.document || "").replace(/\D/g, "");
  const identityType = documentDigits.length === 14 ? "CNPJ" : documentDigits.length === 11 ? "CPF" : undefined;
  const installments = Math.max(1, Math.min(12, card.installments || 1));
  const securityCode = card.securityCode.replace(/\D/g, "").slice(0, 4);

  const customerPayload: Record<string, string> = {
    Name: sanitizeHolderName(customer.name) || customer.name,
    Email: customer.email
  };
  if (identityType && documentDigits) {
    customerPayload.Identity = documentDigits;
    customerPayload.IdentityType = identityType;
  }

  const cardNode = {
    CardNumber: cleanCardNumber,
    Holder: holder,
    ExpirationDate: formattedExpiration,
    SecurityCode: securityCode,
    Brand: brand
  };

  const externalAuth = card.externalAuthentication;
  const hasExternalAuth = Boolean(externalAuth?.eci);

  const buildPaymentPayload = (sandbox: boolean, mode: "external" | "plain"): Record<string, unknown> => {
    const baseCard = isDebit
      ? {
          Type: "DebitCard",
          Amount: amount,
          SoftDescriptor: softDescriptor(),
          Tip: false,
          DebitCard: cardNode,
          ...(sandbox ? { Provider: cieloCardProvider() } : {})
        }
      : {
          Type: "CreditCard",
          Amount: amount,
          SoftDescriptor: softDescriptor(),
          Installments: installments,
          Capture: true,
          CreditCard: cardNode,
          ...(sandbox ? { Provider: cieloCardProvider() } : {})
        };

    if (mode === "external" && externalAuth?.eci) {
      const externalAuthentication: Record<string, unknown> = {
        Eci: externalAuth.eci,
        ...(externalAuth.cavv ? { Cavv: externalAuth.cavv } : {}),
        ...(externalAuth.xid ? { Xid: externalAuth.xid } : {}),
        ...(externalAuth.version ? { Version: externalAuth.version } : { Version: "2" }),
        ...(externalAuth.referenceId ? { ReferenceID: externalAuth.referenceId } : {})
      };

      return {
        ...baseCard,
        Authenticate: true,
        ReturnUrl: returnUrl,
        ExternalAuthentication: externalAuthentication
      };
    }

    // Authenticate:true sem ExternalAuthentication costuma retornar HTTP 403.
    return {
      ...baseCard,
      Authenticate: false
    };
  };

  let lastError = "Não foi possível processar o cartão na Cielo.";
  let lastRaw: unknown;

  // Com 3DS no browser: autoriza com ExternalAuthentication. Sem 3DS: cobrança plain.
  const modes: Array<"external" | "plain"> = hasExternalAuth
    ? ["external"]
    : isDebit
      ? ["plain"]
      : ["plain"];

  for (const apiUrl of cieloApiUrls(settings)) {
    const sandbox = isSandboxApiUrl(apiUrl);
    const environmentLabel = sandbox ? "Homologação/Sandbox" : "Produção";

    for (const mode of modes) {
      const paymentPayload = buildPaymentPayload(sandbox, mode);

      try {
        console.log(
          `[Cielo Card] POST ${apiUrl}/1/sales | ${isDebit ? "DebitCard" : "CreditCard"} | pedido ${merchantOrderId} | brand=${brand} | env=${environmentLabel} | mode=${mode}`
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
            Payment: paymentPayload
          }),
          signal: AbortSignal.timeout(20_000)
        });

        const data = await response.json().catch(() => ({}));
        lastRaw = data;
        console.log(`[Cielo Card] HTTP ${response.status} | Body: ${JSON.stringify(data)}`);

        if (!response.ok) {
          lastError = formatCieloCardError(data, response.status, environmentLabel);
          const code = extractCieloErrorCode(data);

          if (
            response.status === 401 ||
            code === "129" ||
            /affiliation not found/i.test(lastError) ||
            /unauthorized/i.test(extractCieloErrorMessage(data))
          ) {
            break; // troca de ambiente
          }

          // Erro de negócio: não adianta mudar auth/ambiente
          return {
            method: "CARTAO" as const,
            provider: providerLabels.CIELO,
            status: "manual" as const,
            message: lastError,
            raw: lastRaw
          };
        }

        const payment =
          data && typeof data === "object" && !Array.isArray(data)
            ? ((data as { Payment?: Record<string, unknown> }).Payment || {})
            : {};
        const statusNumber = Number(payment.Status);
        const returnMessage =
          (typeof payment.ReturnMessage === "string" && payment.ReturnMessage) ||
          extractCieloErrorMessage(data) ||
          "Transação não autorizada";
        const authenticationUrl =
          typeof payment.AuthenticationUrl === "string" ? payment.AuthenticationUrl : undefined;
        const paymentId =
          (typeof payment.PaymentId === "string" && payment.PaymentId) ||
          (typeof payment.Paymentid === "string" && payment.Paymentid) ||
          undefined;

        // Status 1 = Authorized, 2 = Payment Confirmed (Captured)
        if (statusNumber === 2 || statusNumber === 1) {
          try {
            await confirmOrderPaymentByCode(order.code, "aprovado");
            if (paymentId) {
              await prisma.order.update({
                where: { code: order.code },
                data: { paymentReference: paymentId }
              });
            }
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
              message: "Pagamento autorizado na Cielo. Nossa equipe confirmará o pedido em instantes.",
              reference: paymentId,
              raw: data
            };
          }
        }

        // Redirecionamento de autenticação (quando a Cielo devolver URL)
        if (statusNumber === 12 || authenticationUrl) {
          return {
            method: "CARTAO" as const,
            provider: providerLabels.CIELO,
            status: "pending" as const,
            message: "Aguardando autenticação do seu banco. Você será redirecionado.",
            reference: paymentId,
            redirectUrl: authenticationUrl || returnUrl,
            raw: data
          };
        }

        const returnCode = String(payment.ReturnCode ?? "").toUpperCase();
        if (returnCode === "AI") {
          lastError =
            "Cartão não autorizado: a autenticação do banco não foi concluída. " +
            "Tente novamente e finalize a verificação na janela/app do seu banco (3DS). " +
            "Se a janela não abrir, desative bloqueador de anúncios e recarregue a página.";
        } else if (returnCode === "AH") {
          lastError =
            "Este cartão é de crédito. Selecione a opção Cartão de Crédito no checkout e tente novamente.";
        } else {
          lastError = `Cartão não autorizado pela Cielo: ${returnMessage}${
            payment.ReturnCode != null ? ` (código ${payment.ReturnCode})` : ""
          }`;
        }

        return {
          method: "CARTAO" as const,
          provider: providerLabels.CIELO,
          status: "manual" as const,
          message: lastError,
          reference: paymentId,
          raw: data
        };
      } catch (error) {
        console.error(`[Cielo Card] Falha em ${apiUrl}:`, error);
        lastError = "Falha de conexão com a Cielo ao processar o cartão.";
      }
    }
  }

  return {
    method: "CARTAO" as const,
    provider: providerLabels.CIELO,
    status: "manual" as const,
    message: lastError,
    raw: lastRaw
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
