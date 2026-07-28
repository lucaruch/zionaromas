import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

const paymentMethodSchema = z.enum(["PIX", "CARTAO_CREDITO", "CARTAO_DEBITO"]);

const shippingQuoteSchema = z.object({
  version: z.literal(1),
  kind: z.literal("shipping"),
  expiresAt: z.number().int().positive(),
  postalCode: z.string().regex(/^\d{8}$/),
  itemFingerprint: z.string().min(1).max(2_000),
  optionId: z.number().int().positive(),
  priceCents: z.number().int().nonnegative()
});

const checkoutLineSchema = z.object({
  productId: z.string().min(1).max(80),
  name: z.string().min(1).max(160),
  sku: z.string().min(1).max(80),
  quantity: z.number().int().positive().max(20),
  unitPriceCents: z.number().int().nonnegative()
});

const checkoutTokenSchema = z.object({
  version: z.literal(1),
  kind: z.literal("checkout"),
  expiresAt: z.number().int().positive(),
  orderCode: z.string().regex(/^ZA-\d{8}$/),
  paymentMethod: paymentMethodSchema,
  postalCode: z.string().regex(/^\d{8}$/),
  shippingOptionId: z.number().int().positive(),
  couponId: z.string().max(80).nullable(),
  couponCode: z.string().max(40).nullable(),
  items: z.array(checkoutLineSchema).min(1).max(30),
  subtotalCents: z.number().int().nonnegative(),
  shippingCents: z.number().int().nonnegative(),
  discountCents: z.number().int().nonnegative(),
  totalCents: z.number().int().positive()
});

export type ShippingQuoteTokenPayload = z.infer<typeof shippingQuoteSchema>;
export type CheckoutTokenPayload = z.infer<typeof checkoutTokenSchema>;

function signingSecret() {
  const secret =
    process.env.CHECKOUT_SIGNING_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    process.env.CIELO_MERCHANT_KEY?.trim() ||
    "";

  if (secret.length < 24) {
    throw new Error("Assinatura segura do checkout não configurada.");
  }

  return secret;
}

function signature(payload: string) {
  return createHmac("sha256", signingSecret()).update(payload).digest("base64url");
}

function sign(payload: object) {
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${encoded}.${signature(encoded)}`;
}

function verify(token: string) {
  const [encoded, providedSignature, ...extra] = token.split(".");
  if (!encoded || !providedSignature || extra.length) return null;

  const expectedSignature = signature(encoded);
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;

  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as unknown;
  } catch {
    return null;
  }
}

export function canonicalItemFingerprint(items: Array<{ productId?: string; slug?: string; quantity: number }>) {
  return items
    .map((item) => ({
      key: String(item.productId || item.slug || "").trim(),
      quantity: item.quantity
    }))
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((item) => `${item.key}:${item.quantity}`)
    .join("|");
}

export function normalizeCartProductIds(
  items: Array<{ productId: string; quantity: number }>,
  products: Array<{ id: string; slug: string }>
) {
  const productIdByKey = new Map(products.flatMap((product) => [[product.id, product.id], [product.slug, product.id]]));

  return items.map((item) => ({
    productId: productIdByKey.get(item.productId) || item.productId,
    quantity: item.quantity
  }));
}

export function createShippingQuoteToken(
  payload: Omit<ShippingQuoteTokenPayload, "version" | "kind" | "expiresAt">,
  ttlMs = 10 * 60_000
) {
  return sign({
    version: 1,
    kind: "shipping",
    expiresAt: Date.now() + ttlMs,
    ...payload
  });
}

export function verifyShippingQuoteToken(token: string) {
  const parsed = shippingQuoteSchema.safeParse(verify(token));
  if (!parsed.success || parsed.data.expiresAt < Date.now()) return null;
  return parsed.data;
}

export function createCheckoutToken(
  payload: Omit<CheckoutTokenPayload, "version" | "kind" | "expiresAt">,
  ttlMs = 10 * 60_000
) {
  return sign({
    version: 1,
    kind: "checkout",
    expiresAt: Date.now() + ttlMs,
    ...payload
  });
}

export function verifyCheckoutToken(token: string) {
  const parsed = checkoutTokenSchema.safeParse(verify(token));
  if (!parsed.success || parsed.data.expiresAt < Date.now()) return null;
  return parsed.data;
}
