import { NextResponse } from "next/server";
import { z } from "zod";
import { products } from "@/lib/data";
import { isRateLimited, parseJson } from "@/lib/security";

const schema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().max(120),
    phone: z.string().trim().max(20).optional()
  }),
  address: z.object({
    postalCode: z.string().regex(/^\d{5}-?\d{3}$/),
    street: z.string().trim().min(2).max(120),
    number: z.string().trim().min(1).max(20),
    city: z.string().trim().max(80).optional(),
    state: z.string().trim().max(2).optional()
  }),
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1).max(80),
        quantity: z.number().int().positive().max(20)
      })
    )
    .min(1)
    .max(30),
  paymentMethod: z.enum(["PIX", "CARTAO", "BOLETO"]),
  coupon: z.string().trim().max(40).optional()
});

export async function POST(request: Request) {
  if (isRateLimited(request, "checkout", 30, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um instante." }, { status: 429 });
  }

  const parsed = await parseJson(request, schema, 64_000);

  if (!parsed.ok) {
    return NextResponse.json({ error: "Dados de checkout invalidos." }, { status: 400 });
  }

  const knownIds = new Set(products.flatMap((product) => [product.id, product.slug]));
  const hasUnknownProduct = parsed.data.items.some((item) => !knownIds.has(item.productId));
  if (hasUnknownProduct) {
    return NextResponse.json({ error: "Dados de checkout invalidos." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    orderCode: `ZA-${Math.floor(1000 + Math.random() * 9000)}`,
    status: "RECEBIDO",
    nextStep: parsed.data.paymentMethod === "PIX" ? "Gerar QR Code PIX" : "Processar pagamento"
  });
}
