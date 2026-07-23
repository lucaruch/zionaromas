import { prisma } from "@/lib/prisma";

export const SHIPPING_SETTING_KEY = "shipping";

export type ShippingSettings = {
  originPostalCode: string;
  correiosServices: string[];
  defaultWeightKg: number;
  defaultWidthCm: number;
  defaultHeightCm: number;
  defaultLengthCm: number;
  pickupEnabled: boolean;
  pickupLabel: string;
  freeShippingEnabled: boolean;
  freeShippingThreshold: number;
};

export const defaultShippingSettings: ShippingSettings = {
  originPostalCode: "11700007",
  correiosServices: ["1", "2"],
  defaultWeightKg: 1,
  defaultWidthCm: 12,
  defaultHeightCm: 18,
  defaultLengthCm: 12,
  pickupEnabled: false,
  pickupLabel: "Retirada na loja",
  freeShippingEnabled: false,
  freeShippingThreshold: 0
};

function asPositiveNumber(value: unknown, fallback: number) {
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function asPostalCode(value: unknown, fallback: string) {
  const cleaned = String(value ?? "").replace(/\D/g, "");
  return cleaned.length === 8 ? cleaned : fallback;
}

export function normalizeShippingSettings(value: unknown): ShippingSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaultShippingSettings;
  const payload = value as Partial<ShippingSettings>;
  const services = Array.isArray(payload.correiosServices)
    ? payload.correiosServices.map(String).filter((service) => ["1", "2"].includes(service))
    : defaultShippingSettings.correiosServices;

  return {
    originPostalCode: asPostalCode(payload.originPostalCode, defaultShippingSettings.originPostalCode),
    correiosServices: services.length ? [...new Set(services)] : defaultShippingSettings.correiosServices,
    defaultWeightKg: asPositiveNumber(payload.defaultWeightKg, defaultShippingSettings.defaultWeightKg),
    defaultWidthCm: asPositiveNumber(payload.defaultWidthCm, defaultShippingSettings.defaultWidthCm),
    defaultHeightCm: asPositiveNumber(payload.defaultHeightCm, defaultShippingSettings.defaultHeightCm),
    defaultLengthCm: asPositiveNumber(payload.defaultLengthCm, defaultShippingSettings.defaultLengthCm),
    pickupEnabled: Boolean(payload.pickupEnabled),
    pickupLabel: String(payload.pickupLabel || defaultShippingSettings.pickupLabel).slice(0, 80),
    freeShippingEnabled: Boolean(payload.freeShippingEnabled),
    freeShippingThreshold: Math.max(0, asPositiveNumber(payload.freeShippingThreshold, 0))
  };
}

export async function getShippingSettings(): Promise<ShippingSettings> {
  try {
    const record = await prisma.storeSetting.findUnique({
      where: { key: SHIPPING_SETTING_KEY }
    });

    return normalizeShippingSettings(record?.value);
  } catch {
    return defaultShippingSettings;
  }
}

export async function saveShippingSettings(settings: ShippingSettings) {
  return prisma.storeSetting.upsert({
    where: { key: SHIPPING_SETTING_KEY },
    update: {
      value: settings,
      label: "Entrega e frete",
      group: "checkout"
    },
    create: {
      key: SHIPPING_SETTING_KEY,
      value: settings,
      label: "Entrega e frete",
      group: "checkout"
    }
  });
}
