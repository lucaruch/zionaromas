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
    console.error("[Checkout 3DS] Configuração incompleta.", diagnostics);
    return NextResponse.json(
      { error: "A validação segura do cartão está indisponível no momento. Tente novamente em instantes." },
      { status: 503 }
    );
  }

  const settings = await getPaymentSettings();
  if (settings.activeProvider !== "CIELO") {
    return NextResponse.json(
      { error: "Pagamento com cartão indisponível no momento." },
      { status: 400 }
    );
  }

  const result = await createCielo3dsAccessToken(settings);
  if (!result.ok) {
    console.error("[Checkout 3DS] Falha ao iniciar autenticação.", result.message, result.diagnostics);
    return NextResponse.json(
      { error: "Não foi possível iniciar a validação segura do cartão. Tente novamente." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    accessToken: result.token.accessToken,
    environment: result.token.environment,
    expiresIn: result.token.expiresIn
  });
}
