import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_COOKIE_NAME, getAdminPassword, getAdminSessionToken, secureCompare } from "@/lib/admin-auth";
import { isRateLimited, parseJson } from "@/lib/security";

const schema = z.object({
  password: z.string().min(1).max(120)
});

const cookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/"
};

export async function POST(request: Request) {
  if (isRateLimited(request, "admin-session", 5, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um instante." }, { status: 429 });
  }

  const parsed = await parseJson(request, schema, 2_000);

  if (!parsed.ok || !secureCompare(parsed.data.password, getAdminPassword())) {
    return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, getAdminSessionToken(), {
    ...cookieOptions,
    maxAge: 60 * 60 * 8
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    ...cookieOptions,
    maxAge: 0
  });
  return response;
}
