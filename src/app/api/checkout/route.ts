import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional()
  }),
  address: z.object({
    postalCode: z.string().min(8),
    street: z.string(),
    number: z.string(),
    city: z.string().optional(),
    state: z.string().optional()
  }),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive()
    })
  ),
  paymentMethod: z.enum(["PIX", "CARTAO", "BOLETO"]),
  coupon: z.string().optional()
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados de checkout inválidos.", issues: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    orderCode: `ZA-${Math.floor(1000 + Math.random() * 9000)}`,
    status: "RECEBIDO",
    nextStep: parsed.data.paymentMethod === "PIX" ? "Gerar QR Code PIX" : "Processar pagamento"
  });
}
