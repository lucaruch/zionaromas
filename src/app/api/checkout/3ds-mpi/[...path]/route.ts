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
  if (headerAuth.toLowerCase().startsWith("bearer ") && headerAuth.length > 20) {
    return headerAuth;
  }

  // Coolify/Traefik costuma remover Authorization — usamos header alternativo.
  const alt =
    request.headers.get("x-cielo-3ds-token")?.trim() ||
    request.headers.get("x-forwarded-authorization")?.trim() ||
    "";
  if (alt) {
    return alt.toLowerCase().startsWith("bearer ") ? alt : `Bearer ${alt}`;
  }

  // Fallback: token embutido no JSON pelo script MPI.
  try {
    const parsed = JSON.parse(bodyText) as { __zionAccessToken?: unknown };
    if (typeof parsed.__zionAccessToken === "string" && parsed.__zionAccessToken.trim()) {
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
  const baseUrl =
    settings.environment === "PRODUCAO"
      ? "https://mpi.braspag.com.br"
      : "https://mpisandbox.braspag.com.br";

  const rawBody = await request.text();
  const authorization = resolveBearer(request, rawBody);

  if (!authorization.toLowerCase().startsWith("bearer ") || authorization.length < 30) {
    console.error(
      `[Cielo 3DS Proxy] ${path} sem token | hasAuth=${Boolean(request.headers.get("authorization"))} | hasAlt=${Boolean(request.headers.get("x-cielo-3ds-token"))}`
    );
    return NextResponse.json(
      {
        Message:
          "Token 3DS ausente no proxy (header Authorization removido pelo servidor). Atualize o deploy e limpe o cache (Ctrl+F5)."
      },
      { status: 401 }
    );
  }

  const body = stripEmbeddedToken(rawBody);
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

    if (!upstream.ok) {
      console.error(
        `[Cielo 3DS Proxy] ${path} HTTP ${upstream.status} | body=${text.slice(0, 500)} | req=${redactBody(body)}`
      );
    } else {
      console.info(`[Cielo 3DS Proxy] ${path} HTTP ${upstream.status} ok`);
    }

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json"
      }
    });
  } catch (error) {
    console.error(`[Cielo 3DS Proxy] ${path} falhou:`, error);
    return NextResponse.json(
      { Message: "Falha ao contatar Braspag MPI.", Detail: error instanceof Error ? error.message : "erro" },
      { status: 502 }
    );
  }
}
