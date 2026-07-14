import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    message: "Cadastro realizado com sucesso.",
    email: parsed.data.email
  });
}
