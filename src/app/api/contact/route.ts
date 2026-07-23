import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isRateLimited, parseJson } from "@/lib/security";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  subject: z.string().trim().min(2).max(140),
  message: z.string().trim().min(10).max(5_000)
});

export async function POST(request: Request) {
  if (isRateLimited(request, "contact", 8, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um instante." }, { status: 429 });
  }

  const parsed = await parseJson(request, schema, 16_000);
  if (!parsed.ok) {
    return NextResponse.json({ error: "Revise os dados da mensagem." }, { status: 400 });
  }

  try {
    await prisma.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.phone || null,
        subject: parsed.data.subject,
        message: parsed.data.message
      }
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Não foi possível enviar a mensagem agora." }, { status: 503 });
  }
}
