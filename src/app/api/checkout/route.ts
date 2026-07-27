import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import {
  canonicalItemFingerprint,
  verifyCheckoutToken,
  type CheckoutTokenPayload
} from "@/lib/checkout-token";
import { getPaymentSettings } from "@/lib/payment-store";
import { createPaymentInstruction } from "@/lib/payment-processing";
import { providerLabels } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { isRateLimited, parseJson } from "@/lib/security";

const schema = z.object({
  checkoutToken: z.string().trim().min(40).max(12_000),
  customer: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().max(120),
    phone: z.string().trim().max(20).optional().or(z.literal("")),
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
  paymentMethod: z.enum(["PIX", "CARTAO_CREDITO", "CARTAO_DEBITO"]),
  card: z
    .object({
      cardNumber: z.string().trim().min(12).max(30),
      holder: z.string().trim().min(2).max(80),
      expirationDate: z.string().trim().min(4).max(10),
      securityCode: z.string().trim().min(3).max(4),
      brand: z.string().trim().min(2).max(30).optional().default("Visa"),
      installments: z.number().int().min(1).max(12).optional().default(1),
      externalAuthentication: z
        .object({
          cavv: z.string().trim().max(512).optional(),
          xid: z.string().trim().max(512).optional(),
          eci: z.string().trim().min(1).max(4),
          version: z.string().trim().max(20).optional(),
          referenceId: z.string().trim().max(120).optional()
        })
        .optional()
    })
    .optional()
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

  const isCardMethod = parsed.data.paymentMethod === "CARTAO_CREDITO" || parsed.data.paymentMethod === "CARTAO_DEBITO";
  if (isCardMethod && !parsed.data.card) {
    return NextResponse.json({ error: "Informe os dados do cartão para continuar." }, { status: 400 });
  }

  let prepared: CheckoutTokenPayload | null;
  try {
    prepared = verifyCheckoutToken(parsed.data.checkoutToken);
  } catch (error) {
    console.error("[Checkout] Falha ao verificar assinatura:", error);
    return NextResponse.json(
      { error: "Não foi possível validar o pedido. Atualize a página e tente novamente." },
      { status: 503 }
    );
  }

  const requestFingerprint = canonicalItemFingerprint(parsed.data.items);
  const preparedFingerprint = canonicalItemFingerprint(
    prepared?.items.map((item) => ({ productId: item.productId, quantity: item.quantity })) || []
  );
  const postalCode = parsed.data.address.postalCode.replace(/\D/g, "");
  if (
    !prepared ||
    prepared.paymentMethod !== parsed.data.paymentMethod ||
    prepared.postalCode !== postalCode ||
    preparedFingerprint !== requestFingerprint
  ) {
    return NextResponse.json(
      { error: "O pedido mudou após a conferência. Revise o carrinho e tente novamente." },
      { status: 400 }
    );
  }

  const existingOrder = await prisma.order.findUnique({
    where: { code: prepared.orderCode }
  });
  if (existingOrder) {
    const approved = existingOrder.paymentStatus === "aprovado";
    return NextResponse.json({
      ok: true,
      orderCode: existingOrder.code,
      status: existingOrder.status,
      paymentStatus: existingOrder.paymentStatus,
      paymentProvider: providerLabels[paymentSettings.activeProvider],
      nextStep: approved
        ? "Pagamento aprovado com sucesso."
        : "Este pedido já foi recebido e está sendo conferido.",
      payment: {
        method: parsed.data.paymentMethod,
        provider: existingOrder.paymentProvider || providerLabels[paymentSettings.activeProvider],
        status: approved ? "ready" : "pending",
        message: approved
          ? "Pagamento aprovado com sucesso."
          : "Este pedido já foi recebido e está sendo conferido.",
        pixQrCode: existingOrder.pixQrCode,
        pixQrCodeImage: existingOrder.pixQrCodeImage,
        boletoUrl: existingOrder.boletoUrl,
        boletoBarcode: existingOrder.boletoBarcode
      }
    });
  }

  const activeProducts = await prisma.product.findMany({
    where: {
      id: { in: prepared.items.map((item) => item.productId) },
      status: "ACTIVE"
    },
    select: { id: true, stock: true }
  });
  const activeProductMap = new Map(activeProducts.map((product) => [product.id, product]));
  if (
    prepared.items.some((item) => {
      const product = activeProductMap.get(item.productId);
      return !product || product.stock < item.quantity;
    })
  ) {
    return NextResponse.json(
      { error: "Um produto ficou indisponível ou sem estoque. Revise o carrinho." },
      { status: 409 }
    );
  }

  const providerName = providerLabels[paymentSettings.activeProvider];
  const subtotal = prepared.subtotalCents / 100;
  const shipping = prepared.shippingCents / 100;
  const discount = prepared.discountCents / 100;
  const total = prepared.totalCents / 100;
  const orderCode = prepared.orderCode;
  const dbPaymentMethod = parsed.data.paymentMethod === "PIX" ? "PIX" : "CARTAO";

  const { order, customer } = await prisma.$transaction(async (tx) => {
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

    const order = await tx.order.create({
      data: {
        code: orderCode,
        customerId: customer.id,
        addressId: address.id,
        couponId: prepared.couponId,
        status: "RECEBIDO",
        paymentMethod: dbPaymentMethod,
        paymentStatus: "pendente",
        subtotal,
        shipping,
        discount,
        total,
        items: {
          create: prepared.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.unitPriceCents / 100
          }))
        }
      }
    });

    return { order, customer };
  });

  const cardDetails = isCardMethod && parsed.data.card ? {
    cardType: (parsed.data.paymentMethod === "CARTAO_DEBITO" ? "DebitCard" : "CreditCard") as "CreditCard" | "DebitCard",
    cardNumber: parsed.data.card.cardNumber,
    holder: parsed.data.card.holder,
    expirationDate: parsed.data.card.expirationDate,
    securityCode: parsed.data.card.securityCode,
    brand: parsed.data.card.brand || "Visa",
    installments: parsed.data.card.installments,
    externalAuthentication: parsed.data.card.externalAuthentication
  } : undefined;

  const paymentInstruction = await createPaymentInstruction({
    order,
    customer: {
      name: customer.name,
      email: customer.email,
      document: parsed.data.customer.document || customer.document || undefined
    },
    settings: paymentSettings,
    card: cardDetails
  });

  const paymentData: Prisma.OrderUpdateInput = {
    paymentProvider: paymentInstruction.provider,
    paymentReference: paymentInstruction.reference || null,
    pixQrCode: paymentInstruction.pixQrCode || null,
    pixQrCodeImage: paymentInstruction.pixQrCodeImage || null,
    boletoUrl: paymentInstruction.boletoUrl || null,
    boletoBarcode: paymentInstruction.boletoBarcode || null
  };

  if (paymentInstruction.raw !== undefined && paymentInstruction.raw !== null) {
    paymentData.paymentPayload = paymentInstruction.raw as Prisma.InputJsonValue;
  }

  await prisma.order.update({
    where: { id: order.id },
    data: paymentData
  });

  const freshOrder = await prisma.order.findUnique({
    where: { id: order.id },
    select: { status: true, paymentStatus: true }
  });

  return NextResponse.json({
    ok: true,
    orderCode: order.code,
    status: freshOrder?.status || order.status,
    paymentStatus: freshOrder?.paymentStatus || "pendente",
    paymentProvider: providerName,
    nextStep: paymentInstruction.message,
    payment: {
      method: parsed.data.paymentMethod,
      provider: paymentInstruction.provider,
      status: paymentInstruction.status,
      message: paymentInstruction.message,
      pixQrCode: paymentInstruction.pixQrCode,
      pixQrCodeImage: paymentInstruction.pixQrCodeImage,
      boletoUrl: paymentInstruction.boletoUrl,
      boletoBarcode: paymentInstruction.boletoBarcode,
      redirectUrl: paymentInstruction.redirectUrl
    }
  });
}
