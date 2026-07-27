import { MOCK_PRODUCT_SLUGS } from "@/lib/mock-products";
import { prisma } from "@/lib/prisma";

export type CheckoutPricingInput = {
  items: Array<{ productId: string; quantity: number }>;
  paymentMethod: "PIX" | "CARTAO_CREDITO" | "CARTAO_DEBITO";
  couponCode?: string;
  shippingCents: number;
};

export class CheckoutPricingError extends Error {
  constructor(
    message: string,
    readonly status = 400
  ) {
    super(message);
  }
}

function toCents(value: unknown) {
  return Math.round(Number(value) * 100);
}

export async function calculateCheckoutPricing(input: CheckoutPricingInput) {
  const productKeys = input.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: {
      OR: [{ id: { in: productKeys } }, { slug: { in: productKeys } }],
      status: "ACTIVE",
      slug: { notIn: MOCK_PRODUCT_SLUGS }
    }
  });
  const productMap = new Map(products.flatMap((product) => [[product.id, product], [product.slug, product]]));

  if (input.items.some((item) => !productMap.has(item.productId))) {
    throw new CheckoutPricingError("Um ou mais produtos não estão disponíveis.");
  }

  const items = input.items.map((item) => {
    const product = productMap.get(item.productId)!;
    return {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      quantity: item.quantity,
      unitPriceCents: toCents(product.salePrice ?? product.price)
    };
  });
  const subtotalCents = items.reduce(
    (total, item) => total + item.unitPriceCents * item.quantity,
    0
  );

  const normalizedCouponCode = input.couponCode?.trim().toUpperCase() || "";
  const coupon = normalizedCouponCode
    ? await prisma.coupon.findFirst({
        where: {
          code: normalizedCouponCode,
          active: true,
          OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }]
        },
        include: { _count: { select: { orders: true } } }
      })
    : null;

  if (normalizedCouponCode && !coupon) {
    throw new CheckoutPricingError("Cupom inválido ou expirado.");
  }
  if (coupon?.maxUses && coupon._count.orders >= coupon.maxUses) {
    throw new CheckoutPricingError("Cupom esgotado.");
  }

  const couponDiscountCents = coupon?.discountValue
    ? toCents(coupon.discountValue)
    : coupon?.discountRate
      ? Math.round(subtotalCents * (coupon.discountRate / 100))
      : 0;
  const automaticDiscountCents = subtotalCents > 40_000 ? 3_500 : 0;
  const pixDiscountCents = input.paymentMethod === "PIX" ? Math.round(subtotalCents * 0.1) : 0;
  const discountCents = Math.min(
    subtotalCents,
    automaticDiscountCents + couponDiscountCents + pixDiscountCents
  );
  const totalCents = Math.max(1, subtotalCents + input.shippingCents - discountCents);

  return {
    items,
    coupon,
    couponCode: normalizedCouponCode || null,
    subtotalCents,
    shippingCents: input.shippingCents,
    discountCents,
    totalCents
  };
}
