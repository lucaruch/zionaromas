import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateCheckoutPricing, CheckoutPricingError } from "@/lib/checkout-pricing";
import {
  canonicalItemFingerprint,
  createCheckoutToken,
  verifyShippingQuoteToken
} from "@/lib/checkout-token";
import { getPaymentSettings } from "@/lib/payment-store";
import { isRateLimited, parseJson } from "@/lib/security";
import { getShippingSettings } from "@/lib/shipping-settings";

const schema = z.object({
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
  coupon: z.string().trim().max(40).optional().or(z.literal("")),
  postalCode: z.string().regex(/^\d{5}-?\d{3}$/),
  shippingOptionId: z.number().int().positive(),
  shippingQuoteToken: z.string().max(4_000).optional().or(z.literal(""))
});

export async function POST(request: Request) {
  if (isRateLimited(request, "checkout-prepare", 40, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um instante." }, { status: 429 });
  }

  const parsed = await parseJson(request, schema, 32_000);
  if (!parsed.ok) {
    return NextResponse.json({ error: "Não foi possível conferir o pedido." }, { status: 400 });
  }

  const paymentSettings = await getPaymentSettings();
  if (!paymentSettings.enabledMethods.includes(parsed.data.paymentMethod)) {
    return NextResponse.json({ error: "Forma de pagamento indisponível no momento." }, { status: 400 });
  }

  const postalCode = parsed.data.postalCode.replace(/\D/g, "");
  const itemFingerprint = canonicalItemFingerprint(parsed.data.items);
  let shippingCents = 0;

  if (parsed.data.shippingOptionId !== 900 && parsed.data.shippingOptionId !== 901) {
    const quote = parsed.data.shippingQuoteToken
      ? verifyShippingQuoteToken(parsed.data.shippingQuoteToken)
      : null;

    if (
      !quote ||
      quote.optionId !== parsed.data.shippingOptionId ||
      quote.postalCode !== postalCode ||
      quote.itemFingerprint !== itemFingerprint
    ) {
      return NextResponse.json(
        { error: "A cotação do frete expirou. Calcule o frete novamente." },
        { status: 400 }
      );
    }
    shippingCents = quote.priceCents;
  }

  try {
    let pricing = await calculateCheckoutPricing({
      items: parsed.data.items,
      paymentMethod: parsed.data.paymentMethod,
      couponCode: parsed.data.coupon,
      shippingCents
    });

    if (parsed.data.shippingOptionId === 901) {
      const shippingSettings = await getShippingSettings();
      if (
        !shippingSettings.freeShippingEnabled ||
        pricing.subtotalCents < Math.round(shippingSettings.freeShippingThreshold * 100)
      ) {
        return NextResponse.json(
          { error: "A condição de frete grátis não se aplica a este pedido." },
          { status: 400 }
        );
      }
      pricing = {
        ...pricing,
        shippingCents: 0,
        totalCents: Math.max(1, pricing.subtotalCents - pricing.discountCents)
      };
    }

    const orderCode = `ZA-${randomInt(10_000_000, 100_000_000)}`;
    const checkoutToken = createCheckoutToken({
      orderCode,
      paymentMethod: parsed.data.paymentMethod,
      postalCode,
      shippingOptionId: parsed.data.shippingOptionId,
      couponId: pricing.coupon?.id || null,
      couponCode: pricing.couponCode,
      items: pricing.items,
      subtotalCents: pricing.subtotalCents,
      shippingCents: pricing.shippingCents,
      discountCents: pricing.discountCents,
      totalCents: pricing.totalCents
    });

    return NextResponse.json({
      orderCode,
      checkoutToken,
      amountCents: pricing.totalCents,
      pricing: {
        subtotal: pricing.subtotalCents / 100,
        shipping: pricing.shippingCents / 100,
        discount: pricing.discountCents / 100,
        total: pricing.totalCents / 100
      },
      items: pricing.items
    });
  } catch (error) {
    if (error instanceof CheckoutPricingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[Checkout Prepare] Falha ao preparar pedido:", error);
    return NextResponse.json(
      { error: "Não foi possível conferir o pedido agora. Tente novamente." },
      { status: 500 }
    );
  }
}
