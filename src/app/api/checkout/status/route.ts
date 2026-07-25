import { NextResponse } from "next/server";
import { getPaymentSettings } from "@/lib/payment-store";
import { syncCieloPaymentStatus } from "@/lib/payment-processing";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/security";

export async function GET(request: Request) {
  if (isRateLimited(request, "checkout-status", 60, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um instante." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const orderCode = (searchParams.get("orderCode") || "").trim().toUpperCase();

  if (!orderCode || orderCode.length > 40) {
    return NextResponse.json({ error: "Pedido não informado." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { code: orderCode },
    select: {
      code: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
      paymentReference: true,
      paymentProvider: true
    }
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  let paymentStatus = order.paymentStatus;
  let status = order.status;

  if (paymentStatus !== "aprovado" && order.paymentReference) {
    try {
      const settings = await getPaymentSettings();
      const synced = await syncCieloPaymentStatus(order.paymentReference, settings);
      if (synced.approved) {
        paymentStatus = "aprovado";
        status = "PAGO";
      }
    } catch {
      // Mantém o status atual se a consulta/sincronização falhar.
    }
  }

  const approved = paymentStatus === "aprovado" || status === "PAGO";

  return NextResponse.json({
    ok: true,
    orderCode: order.code,
    status,
    paymentStatus,
    paymentMethod: order.paymentMethod,
    approved,
    message: approved
      ? "Pagamento aprovado! Seu pedido já está sendo preparado."
      : "Aguardando confirmação do pagamento."
  });
}
