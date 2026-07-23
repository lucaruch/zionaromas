import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminUnlocked } from "@/lib/admin-auth";
import { getShippingSettings, saveShippingSettings } from "@/lib/shipping-settings";
import { isRateLimited, parseJson } from "@/lib/security";

const schema = z.object({
  originPostalCode: z.string().regex(/^\d{5}-?\d{3}$/),
  correiosServices: z.array(z.enum(["1", "2"])).min(1).max(2),
  defaultWeightKg: z.coerce.number().positive().max(30),
  defaultWidthCm: z.coerce.number().positive().max(100),
  defaultHeightCm: z.coerce.number().positive().max(100),
  defaultLengthCm: z.coerce.number().positive().max(100),
  pickupEnabled: z.coerce.boolean(),
  pickupLabel: z.string().trim().min(2).max(80),
  freeShippingEnabled: z.coerce.boolean(),
  freeShippingThreshold: z.coerce.number().min(0).max(100_000)
});

export async function GET() {
  if (!(await isAdminUnlocked())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const settings = await getShippingSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  if (!(await isAdminUnlocked())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  if (isRateLimited(request, "admin-shipping-settings", 40, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um instante." }, { status: 429 });
  }

  const parsed = await parseJson(request, schema, 12_000);
  if (!parsed.ok) {
    return NextResponse.json({ error: "Revise as opções de entrega." }, { status: 400 });
  }

  const settings = {
    ...parsed.data,
    originPostalCode: parsed.data.originPostalCode.replace(/\D/g, ""),
    correiosServices: [...new Set(parsed.data.correiosServices)]
  };

  await saveShippingSettings(settings);

  return NextResponse.json({ ok: true, settings });
}
