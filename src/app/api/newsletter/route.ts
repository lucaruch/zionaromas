import { NextResponse } from "next/server";
import { z } from "zod";
import { isRateLimited, parseJson } from "@/lib/security";

const schema = z.object({
  email: z.string().trim().email().max(120)
});

export async function POST(request: Request) {
  if (isRateLimited(request, "newsletter", 10, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um instante." }, { status: 429 });
  }

  const parsed = await parseJson(request, schema, 4_000);

  if (!parsed.ok) {
    return NextResponse.json({ error: "E-mail invalido." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    message: "Cadastro realizado com sucesso.",
    email: parsed.data.email.toLowerCase()
  });
}
