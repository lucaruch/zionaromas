import { NextResponse } from "next/server";
import {
  createCielo3dsAccessToken,
  getCielo3dsConfigDiagnostics,
  isCielo3dsConfigured
} from "@/lib/cielo-3ds";
import { getPaymentSettings } from "@/lib/payment-store";
import { isRateLimited } from "@/lib/security";

export async function GET(request: Request) {
  if (isRateLimited(request, "checkout-3ds-token", 40, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um instante." }, { status: 429 });
  }

  const diagnostics = getCielo3dsConfigDiagnostics();

  if (!isCielo3dsConfigured()) {
    return NextResponse.json(
      {
        error: "3DS não configurado no servidor (CIELO_3DS_CLIENT_ID / CIELO_3DS_CLIENT_SECRET).",
        diagnostics
      },
      { status: 503 }
    );
  }

  const settings = await getPaymentSettings();
  if (settings.activeProvider !== "CIELO") {
    return NextResponse.json({ error: "Provedor ativo não é Cielo.", diagnostics }, { status: 400 });
  }

  const result = await createCielo3dsAccessToken(settings);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, diagnostics: result.diagnostics || diagnostics },
      { status: 502 }
    );
  }

  return NextResponse.json({
    accessToken: result.token.accessToken,
    environment: result.token.environment,
    expiresIn: result.token.expiresIn
  });
}
