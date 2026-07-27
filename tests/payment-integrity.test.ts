import assert from "node:assert/strict";
import test from "node:test";
import {
  canonicalItemFingerprint,
  createCheckoutToken,
  createShippingQuoteToken,
  verifyCheckoutToken,
  verifyShippingQuoteToken
} from "../src/lib/checkout-token";
import { isValidCardExpiration, isValidCardNumber } from "../src/lib/payment-processing";

process.env.CHECKOUT_SIGNING_SECRET = "zion-checkout-test-secret-with-32-chars";

test("shipping quote token binds price, destination and cart", () => {
  const token = createShippingQuoteToken({
    postalCode: "11700007",
    itemFingerprint: "perfume-a:1",
    optionId: 2,
    priceCents: 4490
  });

  assert.deepEqual(verifyShippingQuoteToken(token), {
    version: 1,
    kind: "shipping",
    expiresAt: verifyShippingQuoteToken(token)?.expiresAt,
    postalCode: "11700007",
    itemFingerprint: "perfume-a:1",
    optionId: 2,
    priceCents: 4490
  });
  assert.equal(verifyShippingQuoteToken(`${token.slice(0, -1)}x`), null);
});

test("checkout token preserves the exact amount authenticated by 3DS", () => {
  const token = createCheckoutToken({
    orderCode: "ZA-12345678",
    paymentMethod: "CARTAO_CREDITO",
    postalCode: "11700007",
    shippingOptionId: 2,
    couponId: null,
    couponCode: null,
    items: [
      {
        productId: "product-1",
        name: "Perfume Árabe",
        sku: "ZA-001",
        quantity: 1,
        unitPriceCents: 33_800
      }
    ],
    subtotalCents: 33_800,
    shippingCents: 4_490,
    discountCents: 0,
    totalCents: 38_290
  });

  const verified = verifyCheckoutToken(token);
  assert.equal(verified?.totalCents, 38_290);
  assert.equal(verified?.orderCode, "ZA-12345678");
  assert.equal(verifyCheckoutToken(`${token}alterado`), null);
});

test("canonical cart fingerprint is stable and quantity-sensitive", () => {
  assert.equal(
    canonicalItemFingerprint([
      { productId: "b", quantity: 2 },
      { productId: "a", quantity: 1 }
    ]),
    "a:1|b:2"
  );
  assert.notEqual(
    canonicalItemFingerprint([{ productId: "a", quantity: 1 }]),
    canonicalItemFingerprint([{ productId: "a", quantity: 2 }])
  );
});

test("card validation rejects malformed, expired and invalid-Luhn values", () => {
  assert.equal(isValidCardNumber("4111 1111 1111 1111"), true);
  assert.equal(isValidCardNumber("4111 1111 1111 1112"), false);
  assert.equal(isValidCardNumber("abc"), false);

  assert.equal(isValidCardExpiration("12/2030", new Date("2026-07-27T12:00:00Z")), true);
  assert.equal(isValidCardExpiration("06/2026", new Date("2026-07-27T12:00:00Z")), false);
  assert.equal(isValidCardExpiration("13/2030", new Date("2026-07-27T12:00:00Z")), false);
});
