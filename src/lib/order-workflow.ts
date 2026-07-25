import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const paidStatuses = new Set<OrderStatus>(["PAGO", "SEPARACAO", "ENVIADO", "ENTREGUE"]);

export function paymentStatusForOrderStatus(status: OrderStatus, fallback = "pendente") {
  if (paidStatuses.has(status)) return "aprovado";
  if (status === "CANCELADO") return "cancelado";
  return fallback;
}

/** Normaliza MerchantOrderId da Cielo (ZA123456) para o código do pedido (ZA-123456). */
export function normalizeOrderCode(value: string) {
  const upper = value.trim().toUpperCase();
  if (!upper) return "";
  if (/^ZA-\d+$/.test(upper)) return upper;

  const compact = upper.replace(/[^A-Z0-9]/g, "");
  if (/^ZA\d+$/.test(compact)) return `ZA-${compact.slice(2)}`;
  return upper;
}

export async function findOrderForPayment(lookup: { code?: string; paymentReference?: string }) {
  const code = normalizeOrderCode(lookup.code || "");
  const paymentReference = lookup.paymentReference?.trim();

  if (!code && !paymentReference) return null;

  if (paymentReference) {
    const byReference = await prisma.order.findFirst({
      where: { paymentReference },
      select: { id: true, code: true, paymentReference: true, paymentStatus: true, status: true }
    });
    if (byReference) return byReference;
  }

  if (code) {
    const byCode = await prisma.order.findUnique({
      where: { code },
      select: { id: true, code: true, paymentReference: true, paymentStatus: true, status: true }
    });
    if (byCode) return byCode;
  }

  return null;
}

export async function updateOrderWorkflow(
  id: string,
  data: {
    status: OrderStatus;
    paymentStatus?: string | null;
    trackingCode?: string | null;
    paymentReference?: string | null;
  },
  options?: { allowPaidWithoutStock?: boolean }
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
    let stockReduced = false;

    if (shouldReduceStock) {
      let canReduce = true;
      for (const item of order.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true }
        });
        if (!product || product.stock < item.quantity) {
          canReduce = false;
          break;
        }
      }

      if (canReduce) {
        for (const item of order.items) {
          const updated = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } }
          });
          if (!updated.count) {
            canReduce = false;
            break;
          }
        }
        stockReduced = canReduce;
      }

      if (!canReduce && !options?.allowPaidWithoutStock) {
        throw new Error("insufficient-stock");
      }

      if (!canReduce && options?.allowPaidWithoutStock) {
        console.error(`[order-workflow] Pedido ${order.code} pago sem baixa de estoque (estoque insuficiente).`);
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
        paymentReference: data.paymentReference ?? order.paymentReference,
        stockReducedAt: stockReduced ? new Date() : shouldRestoreStock ? null : order.stockReducedAt
      }
    });
  });
}

export async function confirmOrderPaymentByCode(code: string, paymentStatus = "aprovado") {
  const order = await findOrderForPayment({ code });
  if (!order) throw new Error("order-not-found");
  return updateOrderWorkflow(order.id, { status: "PAGO", paymentStatus }, { allowPaidWithoutStock: true });
}

export async function confirmOrderPayment(
  lookup: { code?: string; paymentReference?: string },
  paymentStatus = "aprovado",
  extras?: { paymentReference?: string | null }
) {
  const order = await findOrderForPayment(lookup);
  if (!order) throw new Error("order-not-found");
  return updateOrderWorkflow(
    order.id,
    {
      status: "PAGO",
      paymentStatus,
      paymentReference: extras?.paymentReference
    },
    { allowPaidWithoutStock: true }
  );
}
