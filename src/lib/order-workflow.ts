import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const paidStatuses = new Set<OrderStatus>(["PAGO", "SEPARACAO", "ENVIADO", "ENTREGUE"]);

export function paymentStatusForOrderStatus(status: OrderStatus, fallback = "pendente") {
  if (paidStatuses.has(status)) return "aprovado";
  if (status === "CANCELADO") return "cancelado";
  return fallback;
}

export async function updateOrderWorkflow(
  id: string,
  data: {
    status: OrderStatus;
    paymentStatus?: string | null;
    trackingCode?: string | null;
  }
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) throw new Error("order-not-found");

    const nextStatus = data.status;
    const shouldReduceStock = paidStatuses.has(nextStatus) && !order.stockReducedAt;
    const shouldRestoreStock = nextStatus === "CANCELADO" && Boolean(order.stockReducedAt);

    if (shouldReduceStock) {
      for (const item of order.items) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } }
        });

        if (!updated.count) throw new Error("insufficient-stock");
      }
    }

    if (shouldRestoreStock) {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
      }
    }

    return tx.order.update({
      where: { id },
      data: {
        status: nextStatus,
        paymentStatus: data.paymentStatus || paymentStatusForOrderStatus(nextStatus, order.paymentStatus),
        trackingCode: data.trackingCode ?? order.trackingCode,
        stockReducedAt: shouldReduceStock ? new Date() : shouldRestoreStock ? null : order.stockReducedAt
      }
    });
  });
}

export async function confirmOrderPaymentByCode(code: string, paymentStatus = "aprovado") {
  const order = await prisma.order.findUnique({ where: { code }, select: { id: true } });
  if (!order) throw new Error("order-not-found");
  return updateOrderWorkflow(order.id, { status: "PAGO", paymentStatus });
}
