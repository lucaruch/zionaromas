export const PAYMENT_SETTING_KEY = "payments";

export const paymentProviders = ["CIELO", "GETNET"] as const;
export const paymentEnvironments = ["HOMOLOGACAO", "PRODUCAO"] as const;
export const paymentMethods = ["PIX", "CARTAO", "BOLETO"] as const;

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
  enabledMethods: ["PIX", "CARTAO", "BOLETO"]
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
  PIX: "PIX",
  CARTAO: "Cartão",
  BOLETO: "Boleto"
};

function isProvider(value: unknown): value is PaymentProvider {
  return typeof value === "string" && paymentProviders.includes(value as PaymentProvider);
}

function isEnvironment(value: unknown): value is PaymentEnvironment {
  return typeof value === "string" && paymentEnvironments.includes(value as PaymentEnvironment);
}

function isMethod(value: unknown): value is PaymentMethod {
  return typeof value === "string" && paymentMethods.includes(value as PaymentMethod);
}

export function normalizePaymentSettings(value: unknown): PaymentSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return defaultPaymentSettings;
  }

  const payload = value as Partial<PaymentSettings>;
  const enabledMethods = Array.isArray(payload.enabledMethods)
    ? payload.enabledMethods.filter(isMethod)
    : defaultPaymentSettings.enabledMethods;

  return {
    activeProvider: isProvider(payload.activeProvider)
      ? payload.activeProvider
      : defaultPaymentSettings.activeProvider,
    environment: isEnvironment(payload.environment)
      ? payload.environment
      : defaultPaymentSettings.environment,
    enabledMethods: enabledMethods.length ? [...new Set(enabledMethods)] : defaultPaymentSettings.enabledMethods
  };
}

export function getCheckoutPaymentCopy(settings: PaymentSettings, method: PaymentMethod) {
  const providerName = providerLabels[settings.activeProvider];

  if (method === "PIX") {
    return `Pagamento via PIX processado por ${providerName}.`;
  }

  if (method === "CARTAO") {
    return `Pagamento por cartão com confirmação segura via ${providerName}.`;
  }

  return `Boleto bancário emitido pelo ambiente seguro ${providerName}.`;
}
