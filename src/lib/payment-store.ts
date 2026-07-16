import { prisma } from "@/lib/prisma";
import {
  PAYMENT_SETTING_KEY,
  defaultPaymentSettings,
  normalizePaymentSettings,
  type PaymentSettings
} from "@/lib/payments";

export async function getPaymentSettings(): Promise<PaymentSettings> {
  try {
    const record = await prisma.storeSetting.findUnique({
      where: { key: PAYMENT_SETTING_KEY }
    });

    return normalizePaymentSettings(record?.value);
  } catch {
    return defaultPaymentSettings;
  }
}

export async function savePaymentSettings(settings: PaymentSettings) {
  return prisma.storeSetting.upsert({
    where: { key: PAYMENT_SETTING_KEY },
    update: {
      value: settings,
      label: "Pagamentos da loja",
      group: "checkout"
    },
    create: {
      key: PAYMENT_SETTING_KEY,
      value: settings,
      label: "Pagamentos da loja",
      group: "checkout"
    }
  });
}
