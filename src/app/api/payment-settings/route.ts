import { NextResponse } from "next/server";
import { getPaymentSettings } from "@/lib/payment-store";
import { getCheckoutPaymentCopy, methodLabels, providerLabels } from "@/lib/payments";

export async function GET() {
  const settings = await getPaymentSettings();

  return NextResponse.json({
    provider: settings.activeProvider,
    providerName: providerLabels[settings.activeProvider],
    methods: settings.enabledMethods.map((method) => ({
      id: method,
      label: methodLabels[method],
      description: getCheckoutPaymentCopy(settings, method)
    }))
  });
}
