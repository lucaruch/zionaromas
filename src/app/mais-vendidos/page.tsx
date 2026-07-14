import type { Metadata } from "next";
import { CollectionPage } from "@/components/commerce/collection-page";
import { products } from "@/lib/data";

export const metadata: Metadata = { title: "Mais vendidos" };

export default function BestSellersPage() {
  return (
    <CollectionPage
      eyebrow="Mais vendidos"
      title="Perfumes favoritos dos clientes"
      description="Fragrâncias árabes com maior procura, excelente fixação e alto valor percebido."
      products={products.filter((product) => product.bestSeller)}
    />
  );
}
