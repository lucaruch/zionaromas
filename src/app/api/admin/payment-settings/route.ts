import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminUnlocked } from "@/lib/admin-auth";
import { getPaymentSettings, savePaymentSettings } from "@/lib/payment-store";
import { paymentEnvironments, paymentMethods, paymentProviders } from "@/lib/payments";
import { isRateLimited, parseJson } from "@/lib/security";

const schema = z.object({
  activeProvider: z.enum(paymentProviders),
  environment: z.enum(paymentEnvironments),
  enabledMethods: z.array(z.enum(paymentMethods)).min(1).max(paymentMethods.length)
});

export async function GET() {
  if (!(await isAdminUnlocked())) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const settings = await getPaymentSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  if (!(await isAdminUnlocked())) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  if (isRateLimited(request, "admin-payment-settings", 40, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um instante." }, { status: 429 });
  }

  const parsed = await parseJson(request, schema, 8_000);
  if (!parsed.ok) {
    return NextResponse.json({ error: "Revise as opcoes selecionadas." }, { status: 400 });
  }

  const uniqueMethods = [...new Set(parsed.data.enabledMethods)];
  const settings = {
    ...parsed.data,
    enabledMethods: uniqueMethods
  };

  await savePaymentSettings(settings);

  return NextResponse.json({ ok: true, settings });
}
