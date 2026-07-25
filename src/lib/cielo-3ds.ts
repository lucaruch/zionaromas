import type { PaymentSettings } from "@/lib/payments";

export type Cielo3dsTokenResult = {
  accessToken: string;
  environment: "PRD" | "SDB";
  expiresIn?: string | number;
};

function envValue(name: string) {
  const raw = process.env[name];
  if (raw == null) return "";
  // Coolify/Docker às vezes grava com aspas literais ou quebra de linha.
  return raw.trim().replace(/^['"]|['"]$/g, "").trim();
}

/** Client Secret da Cielo tem '+' '/' '='; em alguns painéis o '+' vira espaço. */
function normalizeClientSecret(raw: string) {
  let value = raw.trim().replace(/^['"]|['"]$/g, "").trim();
  if (/\s/.test(value) && !value.includes("+")) {
    value = value.replace(/\s+/g, "+");
  }
  return value;
}

function basicAuthHeader(clientId: string, clientSecret: string) {
  const raw = `${clientId}:${clientSecret}`;
  return `Basic ${Buffer.from(raw, "utf8").toString("base64")}`;
}

function threeDsCredentials() {
  const clientId = envValue("CIELO_3DS_CLIENT_ID");
  const clientSecret = normalizeClientSecret(envValue("CIELO_3DS_CLIENT_SECRET"));
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

function merchantNameCandidates() {
  const configured = envValue("CIELO_MERCHANT_NAME");
  const pix = envValue("PIX_MERCHANT_NAME");
  const names = [
    configured,
    configured ? configured.slice(0, 25) : "",
    "ZION AROMAS",
    "ZION AROMAS PERFUMARIA",
    pix ? pix.slice(0, 25) : ""
  ]
    .map((name) => name.trim())
    .filter(Boolean);

  return [...new Set(names)].slice(0, 4);
}

function establishmentCode() {
  return envValue("CIELO_ESTABLISHMENT_CODE").replace(/\D/g, "").slice(0, 10);
}

function mccCandidates() {
  const configured = envValue("CIELO_MCC").replace(/\D/g, "").slice(0, 4);
  const list = [configured, "5977", "5912", "5999"].filter((value) => value.length === 4);
  return [...new Set(list)];
}

function extractMpiError(data: unknown): string {
  if (Array.isArray(data)) {
    const parts = data
      .map((item) => {
        if (!item || typeof item !== "object") return "";
        const row = item as Record<string, unknown>;
        const code = row.Code ?? row.code;
        const message = row.Message ?? row.message;
        if (typeof message === "string" && message.trim()) {
          return code != null ? `${code}: ${message.trim()}` : message.trim();
        }
        return "";
      })
      .filter(Boolean);
    if (parts.length) return parts.join(" | ");
  }

  if (data && typeof data === "object") {
    const row = data as Record<string, unknown>;
    if (typeof row.error_description === "string" && row.error_description.trim()) {
      return row.error_description.trim();
    }
    if (typeof row.error === "string" && row.error.trim()) return row.error.trim();
    if (typeof row.Message === "string" && row.Message.trim()) return row.Message.trim();
    if (typeof row.message === "string" && row.message.trim()) return row.message.trim();
  }

  return "";
}

async function requestMpiToken(options: {
  production: boolean;
  auth: string;
  establishmentCode: string;
  merchantName: string;
  mcc: string;
}) {
  const baseUrl = options.production
    ? "https://mpi.braspag.com.br"
    : "https://mpisandbox.braspag.com.br";

  const payloads: Array<Record<string, unknown>> = [
    {
      EstablishmentCode: options.establishmentCode,
      MerchantName: options.merchantName,
      MCC: options.mcc
    },
    // Alguns exemplos oficiais enviam MCC/EC como número.
    {
      EstablishmentCode: Number(options.establishmentCode),
      MerchantName: options.merchantName,
      MCC: Number(options.mcc)
    }
  ];

  let lastStatus = 0;
  let lastData: unknown = {};

  for (const body of payloads) {
    const response = await fetch(`${baseUrl}/v2/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: options.auth
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000)
    });

    const data = await response.json().catch(() => ({}));
    lastStatus = response.status;
    lastData = data;

    if (!response.ok) {
      console.error(
        `[Cielo 3DS] MPI ${baseUrl} HTTP ${response.status} | name=${options.merchantName} mcc=${options.mcc} | ${JSON.stringify(data)}`
      );
      continue;
    }

    const accessToken =
      (typeof (data as { access_token?: unknown }).access_token === "string" &&
        (data as { access_token: string }).access_token) ||
      "";

    if (!accessToken) {
      continue;
    }

    return {
      ok: true as const,
      accessToken,
      expiresIn: (data as { expires_in?: string | number }).expires_in,
      production: options.production
    };
  }

  return {
    ok: false as const,
    error: "mpi_failed" as const,
    status: lastStatus,
    data: lastData,
    production: options.production
  };
}

export function isCielo3dsConfigured() {
  return Boolean(threeDsCredentials());
}

export function getCielo3dsConfigDiagnostics() {
  const credentials = threeDsCredentials();
  const code = establishmentCode();
  return {
    hasClientId: Boolean(credentials?.clientId),
    hasClientSecret: Boolean(credentials?.clientSecret),
    clientIdLength: credentials?.clientId.length || 0,
    clientSecretLength: credentials?.clientSecret.length || 0,
    clientIdLooksLikeUuid: Boolean(
      credentials?.clientId &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(credentials.clientId)
    ),
    establishmentCodeLength: code.length,
    establishmentCodeOk: code.length === 10,
    merchantName: merchantNameCandidates()[0] || "",
    mcc: mccCandidates()[0] || ""
  };
}

export async function createCielo3dsAccessToken(
  settings: PaymentSettings
): Promise<{ ok: true; token: Cielo3dsTokenResult } | { ok: false; message: string; diagnostics?: ReturnType<typeof getCielo3dsConfigDiagnostics> }> {
  const credentials = threeDsCredentials();
  const diagnostics = getCielo3dsConfigDiagnostics();

  if (!credentials) {
    return {
      ok: false,
      message: "Credenciais 3DS ausentes (CIELO_3DS_CLIENT_ID / CIELO_3DS_CLIENT_SECRET).",
      diagnostics
    };
  }

  // ClientId oficial da Cielo/Braspag é GUID (36). Valores menores quase sempre estão truncados no Coolify.
  if (!diagnostics.clientIdLooksLikeUuid) {
    return {
      ok: false,
      message:
        `CIELO_3DS_CLIENT_ID parece incompleto (len=${diagnostics.clientIdLength}; esperado GUID 36). ` +
        "No Coolify, cole o Client ID/Secret completos sem aspas e regenere o Client Secret no portal Cielo se necessário.",
      diagnostics
    };
  }

  const code = establishmentCode();
  if (code.length !== 10) {
    return {
      ok: false,
      message:
        "CIELO_ESTABLISHMENT_CODE inválido. Use o EC Cielo com exatamente 10 dígitos (só números).",
      diagnostics
    };
  }

  const auth = basicAuthHeader(credentials.clientId, credentials.clientSecret);
  const preferProduction = settings.environment === "PRODUCAO";
  const envOrder = preferProduction ? [true, false] : [false, true];
  const names = merchantNameCandidates();
  const mccs = mccCandidates();

  let lastFailure: { status: number; data: unknown; production: boolean } | null = null;

  try {
    for (const production of envOrder) {
      for (const merchantName of names) {
        for (const mcc of mccs) {
          const mpi = await requestMpiToken({
            production,
            auth,
            establishmentCode: code,
            merchantName,
            mcc
          });

          if (mpi.ok) {
            return {
              ok: true,
              token: {
                accessToken: mpi.accessToken,
                environment: mpi.production ? "PRD" : "SDB",
                expiresIn: mpi.expiresIn
              }
            };
          }

          lastFailure = {
            status: mpi.status,
            data: mpi.data,
            production: mpi.production
          };
        }
      }
    }

    const mpiMessage = extractMpiError(lastFailure?.data);
    const envLabel = lastFailure?.production ? "produção" : "sandbox";

    if (/invalid_client/i.test(mpiMessage) || lastFailure?.status === 401) {
      return {
        ok: false,
        message:
          "Braspag recusou o Client ID/Secret do 3DS (invalid_client). " +
          "No portal Cielo > Credenciais > 3DS, gere um novo Client Secret e atualize CIELO_3DS_CLIENT_ID e CIELO_3DS_CLIENT_SECRET no Coolify (valores completos, sem aspas).",
        diagnostics
      };
    }

    if (mpiMessage) {
      return {
        ok: false,
        message: `Token 3DS recusado pela Braspag (${envLabel}, HTTP ${lastFailure?.status || "?"}): ${mpiMessage}. Confira EC, MerchantName (CIELO_MERCHANT_NAME, máx. 25) e MCC.`,
        diagnostics
      };
    }

    return {
      ok: false,
      message: `Não foi possível gerar o token 3DS (HTTP ${lastFailure?.status || "?"} em ${envLabel}). Confira CIELO_3DS_* + CIELO_ESTABLISHMENT_CODE + CIELO_MERCHANT_NAME + CIELO_MCC.`,
      diagnostics
    };
  } catch (error) {
    console.error("[Cielo 3DS] Falha ao obter token:", error);
    return { ok: false, message: "Falha de conexão ao obter token 3DS.", diagnostics };
  }
}
