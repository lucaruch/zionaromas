import { NextResponse } from "next/server";
import { z } from "zod";
import { getPaymentSettings } from "@/lib/payment-store";
import { getCheckoutPaymentCopy, providerLabels } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { MOCK_PRODUCT_SLUGS } from "@/lib/mock-products";
import { isRateLimited, parseJson } from "@/lib/security";

const schema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().max(120),
    phone: z.string().trim().max(20).optional()
      .or(z.literal("")),
    document: z.string().trim().max(30).optional().or(z.literal(""))
  }),
  address: z.object({
    postalCode: z.string().regex(/^\d{5}-?\d{3}$/),
    street: z.string().trim().min(2).max(120),
    number: z.string().trim().min(1).max(20),
    complement: z.string().trim().max(120).optional().or(z.literal("")),
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
  coupon: z.string().trim().max(40).optional().or(z.literal("")),
  shipping: z.coerce.number().min(0).max(10_000).optional().default(0)
});

export async function POST(request: Request) {
  if (isRateLimited(request, "checkout", 30, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um instante." }, { status: 429 });
  }

  const parsed = await parseJson(request, schema, 64_000);

  if (!parsed.ok) {
    return NextResponse.json({ error: "Dados de checkout inválidos." }, { status: 400 });
  }

  const paymentSettings = await getPaymentSettings();
  if (!paymentSettings.enabledMethods.includes(parsed.data.paymentMethod)) {
    return NextResponse.json({ error: "Forma de pagamento indisponível no momento." }, { status: 400 });
  }

  const productKeys = parsed.data.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: {
      OR: [{ id: { in: productKeys } }, { slug: { in: productKeys } }],
      status: "ACTIVE",
      slug: { notIn: MOCK_PRODUCT_SLUGS }
    }
  });
  const productMap = new Map(products.flatMap((product) => [[product.id, product], [product.slug, product]]));
  const hasUnknownProduct = parsed.data.items.some((item) => !productMap.has(item.productId));
  if (hasUnknownProduct) {
    return NextResponse.json({ error: "Dados de checkout inválidos." }, { status: 400 });
  }

  const providerName = providerLabels[paymentSettings.activeProvider];
  const paymentCopy = getCheckoutPaymentCopy(paymentSettings, parsed.data.paymentMethod);
  const subtotal = parsed.data.items.reduce((total, item) => {
    const product = productMap.get(item.productId)!;
    return total + Number(product.salePrice ?? product.price) * item.quantity;
  }, 0);
  const shipping = parsed.data.shipping ?? 0;
  const automaticDiscount = subtotal > 400 ? 35 : 0;
  const couponCode = parsed.data.coupon?.trim().toUpperCase();
  const coupon = couponCode
    ? await prisma.coupon.findFirst({
        where: {
          code: couponCode,
          active: true,
          OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }]
        },
        include: { _count: { select: { orders: true } } }
      })
    : null;
  if (couponCode && !coupon) {
    return NextResponse.json({ error: "Cupom inválido ou expirado." }, { status: 400 });
  }

  const couponAvailable = coupon ? !coupon.maxUses || coupon._count.orders < coupon.maxUses : false;
  if (couponCode && coupon && !couponAvailable) {
    return NextResponse.json({ error: "Cupom esgotado." }, { status: 400 });
  }

  const couponDiscount = couponAvailable && coupon?.discountValue
    ? Number(coupon.discountValue)
    : couponAvailable && coupon?.discountRate
      ? subtotal * (coupon.discountRate / 100)
      : 0;
  const discount = Math.min(subtotal, automaticDiscount + couponDiscount);
  const total = Math.max(0, subtotal + shipping - discount);
  const orderCode = `ZA-${Date.now().toString().slice(-6)}`;

  const order = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.upsert({
      where: { email: parsed.data.customer.email.toLowerCase() },
      update: {
        name: parsed.data.customer.name,
        phone: parsed.data.customer.phone || null,
        document: parsed.data.customer.document || null
      },
      create: {
        name: parsed.data.customer.name,
        email: parsed.data.customer.email.toLowerCase(),
        phone: parsed.data.customer.phone || null,
        document: parsed.data.customer.document || null
      }
    });

    const address = await tx.address.create({
      data: {
        customerId: customer.id,
        label: "Entrega",
        postalCode: parsed.data.address.postalCode.replace(/\D/g, ""),
        street: parsed.data.address.street,
        number: parsed.data.address.number,
        complement: parsed.data.address.complement || null,
        neighborhood: "Confirmar",
        city: parsed.data.address.city || "Praia Grande",
        state: parsed.data.address.state || "SP"
      }
    });

    return tx.order.create({
      data: {
        code: orderCode,
        customerId: customer.id,
        addressId: address.id,
        couponId: couponAvailable ? coupon?.id : null,
        status: "RECEBIDO",
        paymentMethod: parsed.data.paymentMethod,
        paymentStatus: "pendente",
        subtotal,
        shipping,
        discount,
        total,
        items: {
          create: parsed.data.items.map((item) => {
            const product = productMap.get(item.productId)!;
            return {
              productId: product.id,
              quantity: item.quantity,
              price: Number(product.salePrice ?? product.price)
            };
          })
        }
      }
    });
  });

  return NextResponse.json({
    ok: true,
    orderCode: order.code,
    status: order.status,
    paymentProvider: providerName,
    nextStep:
      parsed.data.paymentMethod === "PIX"
        ? `${paymentCopy} Em instantes você receberá a confirmação.`
        : `${paymentCopy} Em instantes você receberá a confirmação do pedido.`
  });
}
