import { prisma } from "@/lib/prisma";

export async function deleteProductWorkflow(id: string) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!product) throw new Error("product-not-found");

    const orderItemCount = await tx.orderItem.count({ where: { productId: id } });
    if (orderItemCount > 0) {
      await tx.product.update({
        where: { id },
        data: {
          status: "ARCHIVED",
          stock: 0,
          featured: false,
          bestSeller: false,
          isNew: false
        }
      });
      return { archived: true };
    }

    await tx.product.delete({ where: { id } });
    return { archived: false };
  });
}
