import { NextResponse } from "next/server";
import { getPaymentSettings } from "@/lib/payment-store";
import { isRateLimited } from "@/lib/security";

export const runtime = "nodejs";

const ALLOWED = new Set(["v2/3ds/init", "v2/3ds/enroll", "v2/3ds/validate"]);

function redactBody(raw: string) {
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (typeof data.cardnumber === "string" && data.cardnumber.length > 4) {
      data.cardnumber = `${data.cardnumber.slice(0, 6)}****${data.cardnumber.slice(-4)}`;
    }
    delete data.__zionAccessToken;
    return JSON.stringify(data);
  } catch {
    return "[unparseable]";
  }
}

function resolveBearer(request: Request, bodyText: string) {
  const headerAuth = request.headers.get("authorization")?.trim() || "";
  if (headerAuth.toLowerCase().startsWith("bearer ") && headerAuth.length > 40) {
    return headerAuth;
  }

  const alt =
    request.headers.get("x-cielo-3ds-token")?.trim() ||
    request.headers.get("x-forwarded-authorization")?.trim() ||
    "";
  if (alt) {
    const cleaned = alt.replace(/^Bearer\s+/i, "").trim();
    if (cleaned.length > 40) return `Bearer ${cleaned}`;
  }

  try {
    const parsed = JSON.parse(bodyText) as { __zionAccessToken?: unknown };
    if (typeof parsed.__zionAccessToken === "string" && parsed.__zionAccessToken.trim().length > 40) {
      return `Bearer ${parsed.__zionAccessToken.trim()}`;
    }
  } catch {
    // ignore
  }

  return "";
}

function stripEmbeddedToken(bodyText: string) {
  try {
    const parsed = JSON.parse(bodyText) as Record<string, unknown>;
    if ("__zionAccessToken" in parsed) {
      delete parsed.__zionAccessToken;
      return JSON.stringify(parsed);
    }
  } catch {
    // ignore
  }
  return bodyText;
}

function baseUrls(preferred: "PRD" | "SDB") {
  const production = "https://mpi.braspag.com.br";
  const sandbox = "https://mpisandbox.braspag.com.br";
  return preferred === "PRD" ? [production, sandbox] : [sandbox, production];
}

function resolvePreferredEnv(request: Request, settingsEnv: string): "PRD" | "SDB" {
  const header = (request.headers.get("x-cielo-3ds-env") || "").trim().toUpperCase();
  if (header === "PRD" || header === "SDB") return header;
  return settingsEnv === "PRODUCAO" ? "PRD" : "SDB";
}

function braspagMessage(status: number, text: string) {
  try {
    const data = JSON.parse(text) as Record<string, unknown>;
    if (typeof data.Message === "string" && data.Message.trim()) return data.Message.trim();
    if (typeof data.message === "string" && data.message.trim()) return data.message.trim();
    if (typeof data.error_description === "string" && data.error_description.trim()) {
      return data.error_description.trim();
    }
    if (typeof data.error === "string" && data.error.trim()) return data.error.trim();
    if (Array.isArray(data) && data[0] && typeof data[0] === "object") {
      const row = data[0] as Record<string, unknown>;
      if (typeof row.Message === "string") return row.Message;
    }
  } catch {
    // ignore
  }
  return `Braspag MPI HTTP ${status}`;
}

type RouteContext = { params: Promise<{ path?: string[] }> };

export async function POST(request: Request, context: RouteContext) {
  if (isRateLimited(request, "checkout-3ds-mpi", 60, 60_000)) {
    return NextResponse.json({ Message: "Muitas tentativas 3DS." }, { status: 429 });
  }

  const { path: pathParts = [] } = await context.params;
  const path = pathParts.join("/");
  if (!ALLOWED.has(path)) {
    return NextResponse.json({ Message: `Rota 3DS não permitida: ${path}` }, { status: 404 });
  }

  const settings = await getPaymentSettings();
  const preferred = resolvePreferredEnv(request, settings.environment);
  const rawBody = await request.text();
  const authorization = resolveBearer(request, rawBody);

  if (!authorization.toLowerCase().startsWith("bearer ") || authorization.length < 50) {
    console.error(
      `[Cielo 3DS Proxy] ${path} sem token | auth=${Boolean(request.headers.get("authorization"))} | alt=${Boolean(request.headers.get("x-cielo-3ds-token"))} | env=${preferred}`
    );
    return NextResponse.json(
      {
        Message:
          "Token 3DS ausente no proxy. Atualize o deploy, limpe cache (Ctrl+Shift+R) e tente de novo."
      },
      { status: 401 }
    );
  }

  const body = stripEmbeddedToken(rawBody);
  const tokenLen = authorization.length;
  let lastStatus = 0;
  let lastText = "";

  for (const baseUrl of baseUrls(preferred)) {
    const target = `${baseUrl}/${path}`;
    try {
      const upstream = await fetch(target, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authorization,
          "X-Script-Version": request.headers.get("x-script-version") || "0.0.1"
        },
        body,
        signal: AbortSignal.timeout(25_000)
      });

      const text = await upstream.text();
      lastStatus = upstream.status;
      lastText = text;

      if (upstream.ok) {
        console.info(`[Cielo 3DS Proxy] ${path} OK via ${baseUrl} | tokenLen=${tokenLen}`);
        return new NextResponse(text, {
          status: upstream.status,
          headers: {
            "Content-Type": upstream.headers.get("content-type") || "application/json"
          }
        });
      }

      console.error(
        `[Cielo 3DS Proxy] ${path} HTTP ${upstream.status} via ${baseUrl} | tokenLen=${tokenLen} | body=${text.slice(0, 400)} | req=${redactBody(body)}`
      );

      // 401/403: tenta o outro ambiente (token PRD vs SDB).
      if (upstream.status === 401 || upstream.status === 403) {
        continue;
      }

      return NextResponse.json(
        { Message: braspagMessage(upstream.status, text), UpstreamStatus: upstream.status },
        { status: upstream.status }
      );
    } catch (error) {
      console.error(`[Cielo 3DS Proxy] ${path} falhou em ${baseUrl}:`, error);
      lastText = error instanceof Error ? error.message : "erro";
      lastStatus = 502;
    }
  }

  return NextResponse.json(
    {
      Message: `${braspagMessage(lastStatus, lastText)} (ambientes tentados: PRD/SDB)`,
      UpstreamStatus: lastStatus
    },
    { status: lastStatus || 502 }
  );
}
