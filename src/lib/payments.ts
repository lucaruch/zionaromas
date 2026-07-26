export const PAYMENT_SETTING_KEY = "payments";

export const paymentProviders = ["CIELO", "GETNET"] as const;
export const paymentEnvironments = ["HOMOLOGACAO", "PRODUCAO"] as const;
export const paymentMethods = ["PIX", "CARTAO_CREDITO", "CARTAO_DEBITO"] as const;

export type PaymentProvider = (typeof paymentProviders)[number];
export type PaymentEnvironment = (typeof paymentEnvironments)[number];
export type PaymentMethod = (typeof paymentMethods)[number];

export type PaymentSettings = {
  activeProvider: PaymentProvider;
  environment: PaymentEnvironment;
  enabledMethods: PaymentMethod[];
};

export const defaultPaymentSettings: PaymentSettings = {
  activeProvider: "CIELO",
  environment: "PRODUCAO",
  enabledMethods: ["PIX", "CARTAO_CREDITO", "CARTAO_DEBITO"]
};

export const providerLabels: Record<PaymentProvider, string> = {
  CIELO: "Cielo",
  GETNET: "Getnet"
};

export const environmentLabels: Record<PaymentEnvironment, string> = {
  HOMOLOGACAO: "Homologação",
  PRODUCAO: "Produção"
};

export const methodLabels: Record<PaymentMethod, string> = {
  PIX: "PIX (10% OFF)",
  CARTAO_CREDITO: "Cartão de Crédito",
  CARTAO_DEBITO: "Cartão de Débito"
};

function isProvider(value: unknown): value is PaymentProvider {
  return typeof value === "string" && paymentProviders.includes(value as PaymentProvider);
}

function isMethod(value: unknown): value is PaymentMethod {
  return typeof value === "string" && paymentMethods.includes(value as PaymentMethod);
}

function normalizeMethod(value: unknown): PaymentMethod[] {
  if (value === "CARTAO") return ["CARTAO_CREDITO", "CARTAO_DEBITO"];
  if (isMethod(value)) return [value];
  return [];
}

export function normalizePaymentSettings(value: unknown): PaymentSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return defaultPaymentSettings;
  }

  const payload = value as Partial<PaymentSettings>;
  const enabledMethods = Array.isArray(payload.enabledMethods)
    ? payload.enabledMethods.flatMap(normalizeMethod)
    : defaultPaymentSettings.enabledMethods;

  return {
    activeProvider: isProvider(payload.activeProvider)
      ? payload.activeProvider
      : defaultPaymentSettings.activeProvider,
    environment: defaultPaymentSettings.environment,
    enabledMethods: enabledMethods.length ? [...new Set(enabledMethods)] : defaultPaymentSettings.enabledMethods
  };
}

export function getCheckoutPaymentCopy(settings: PaymentSettings, method: PaymentMethod) {
  const providerName = providerLabels[settings.activeProvider];

  if (method === "PIX") {
    return `Ganhe 10% de desconto no PIX processado por ${providerName}.`;
  }

  if (method === "CARTAO_DEBITO") {
    return `Pagamento no débito com autenticação segura via ${providerName}.`;
  }

  return `Pagamento no crédito com confirmação segura via ${providerName}.`;
}
