import { NextResponse } from "next/server";
import { getPaymentSettings } from "@/lib/payment-store";
import { syncOrderPaymentFromCielo } from "@/lib/payment-processing";
import { prisma } from "@/lib/prisma";
import { getPublicSiteUrl } from "@/lib/site-url";

async function finalizeAuthenticatedPayment(request: Request) {
  const siteUrl = getPublicSiteUrl();
  const incomingUrl = new URL(request.url);
  const orderCode = (incomingUrl.searchParams.get("orderCode") || "").trim().toUpperCase();
  const paymentId =
    incomingUrl.searchParams.get("PaymentId") ||
    incomingUrl.searchParams.get("paymentId") ||
    incomingUrl.searchParams.get("PaymentID") ||
    "";

  let resolvedCode = orderCode;

  if (orderCode || paymentId) {
    try {
      const order = orderCode
        ? await prisma.order.findUnique({
            where: { code: orderCode },
            select: { code: true, paymentReference: true }
          })
        : await prisma.order.findFirst({
            where: { paymentReference: paymentId },
            select: { code: true, paymentReference: true }
          });

      if (order) {
        resolvedCode = order.code;
        if (paymentId && order.paymentReference !== paymentId) {
          await prisma.order.update({
            where: { code: order.code },
            data: { paymentReference: paymentId }
          });
        }

        const settings = await getPaymentSettings();
        await syncOrderPaymentFromCielo(
          {
            code: order.code,
            paymentReference: paymentId || order.paymentReference
          },
          settings
        );
      }
    } catch (error) {
      console.error("[checkout-callback] Falha ao sincronizar pagamento autenticado:", error);
    }
  }

  const redirectUrl = new URL("/checkout", siteUrl);
  redirectUrl.searchParams.set("pagamento", "autenticado");
  if (resolvedCode) redirectUrl.searchParams.set("orderCode", resolvedCode);

  return NextResponse.redirect(redirectUrl.toString(), 303);
}

export async function GET(request: Request) {
  return finalizeAuthenticatedPayment(request);
}

export async function POST(request: Request) {
  return finalizeAuthenticatedPayment(request);
}
