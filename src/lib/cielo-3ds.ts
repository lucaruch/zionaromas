import type { PaymentSettings } from "@/lib/payments";

export type Cielo3dsTokenResult = {
  accessToken: string;
  environment: "PRD" | "SDB";
  expiresIn?: string | number;
};

function basicAuthHeader(clientId: string, clientSecret: string) {
  const raw = `${clientId}:${clientSecret}`;
  return `Basic ${Buffer.from(raw, "utf8").toString("base64")}`;
}

function threeDsCredentials() {
  const clientId = process.env.CIELO_3DS_CLIENT_ID?.trim();
  const clientSecret = process.env.CIELO_3DS_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

function merchantName() {
  const name =
    process.env.CIELO_MERCHANT_NAME?.trim() ||
    process.env.PIX_MERCHANT_NAME?.trim() ||
    "ZION AROMAS";
  return name.slice(0, 25);
}

function establishmentCode() {
  return (process.env.CIELO_ESTABLISHMENT_CODE || "").replace(/\D/g, "").slice(0, 10);
}

function mcc() {
  const value = (process.env.CIELO_MCC || "5977").replace(/\D/g, "").slice(0, 4);
  return value.length === 4 ? value : "5977";
}

async function requestMpiToken(production: boolean, auth: string) {
  const code = establishmentCode();
  if (code.length !== 10) {
    return { ok: false as const, error: "missing_establishment" };
  }

  const baseUrl = production ? "https://mpi.braspag.com.br" : "https://mpisandbox.braspag.com.br";
  const response = await fetch(`${baseUrl}/v2/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: auth
    },
    body: JSON.stringify({
      EstablishmentCode: code,
      MerchantName: merchantName(),
      MCC: mcc()
    }),
    signal: AbortSignal.timeout(15_000)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error(`[Cielo 3DS] MPI token HTTP ${response.status} | ${JSON.stringify(data)}`);
    return { ok: false as const, error: "mpi_failed", status: response.status, data };
  }

  const accessToken =
    (typeof (data as { access_token?: unknown }).access_token === "string" &&
      (data as { access_token: string }).access_token) ||
    "";

  if (!accessToken) {
    return { ok: false as const, error: "mpi_empty" };
  }

  return {
    ok: true as const,
    accessToken,
    expiresIn: (data as { expires_in?: string | number }).expires_in
  };
}

async function requestOauthToken(production: boolean, auth: string) {
  const baseUrl = production ? "https://auth.braspag.com.br" : "https://authsandbox.braspag.com.br";
  const response = await fetch(`${baseUrl}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      Authorization: auth
    },
    body: "grant_type=client_credentials",
    signal: AbortSignal.timeout(15_000)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error(`[Cielo 3DS] OAuth token HTTP ${response.status} | ${JSON.stringify(data)}`);
    return { ok: false as const, error: "oauth_failed", status: response.status, data };
  }

  const accessToken =
    (typeof (data as { access_token?: unknown }).access_token === "string" &&
      (data as { access_token: string }).access_token) ||
    "";

  if (!accessToken) {
    return { ok: false as const, error: "oauth_empty" };
  }

  return {
    ok: true as const,
    accessToken,
    expiresIn: (data as { expires_in?: string | number }).expires_in
  };
}

export function isCielo3dsConfigured() {
  return Boolean(threeDsCredentials());
}

export async function createCielo3dsAccessToken(
  settings: PaymentSettings
): Promise<{ ok: true; token: Cielo3dsTokenResult } | { ok: false; message: string }> {
  const credentials = threeDsCredentials();
  if (!credentials) {
    return {
      ok: false,
      message: "Credenciais 3DS ausentes (CIELO_3DS_CLIENT_ID / CIELO_3DS_CLIENT_SECRET)."
    };
  }

  const production = settings.environment === "PRODUCAO";
  const auth = basicAuthHeader(credentials.clientId, credentials.clientSecret);
  const environment = production ? ("PRD" as const) : ("SDB" as const);

  try {
    const mpi = await requestMpiToken(production, auth);
    if (mpi.ok) {
      return {
        ok: true,
        token: {
          accessToken: mpi.accessToken,
          environment,
          expiresIn: mpi.expiresIn
        }
      };
    }

    if (mpi.error === "missing_establishment") {
      console.warn(
        "[Cielo 3DS] CIELO_ESTABLISHMENT_CODE ausente/inválido (10 dígitos). Tentando OAuth Braspag."
      );
    }

    const oauth = await requestOauthToken(production, auth);
    if (oauth.ok) {
      return {
        ok: true,
        token: {
          accessToken: oauth.accessToken,
          environment,
          expiresIn: oauth.expiresIn
        }
      };
    }

    if (mpi.error === "missing_establishment") {
      return {
        ok: false,
        message:
          "Configure CIELO_ESTABLISHMENT_CODE (código EC Cielo com 10 dígitos) na env para o 3DS. " +
          "É o código do estabelecimento em Meu Cadastro na Cielo."
      };
    }

    return {
      ok: false,
      message: "Não foi possível gerar o token 3DS na Cielo/Braspag. Confira as credenciais CIELO_3DS_*."
    };
  } catch (error) {
    console.error("[Cielo 3DS] Falha ao obter token:", error);
    return { ok: false, message: "Falha de conexão ao obter token 3DS." };
  }
}
