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
    return JSON.stringify(data);
  } catch {
    return "[unparseable]";
  }
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

  const authorization = request.headers.get("authorization") || "";
  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return NextResponse.json({ Message: "Authorization Bearer ausente no 3DS." }, { status: 401 });
  }

  const body = await request.text();
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
