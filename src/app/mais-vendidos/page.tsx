import type { Metadata } from "next";
import { CollectionPage } from "@/components/commerce/collection-page";
import { products } from "@/lib/data";

export const metadata: Metadata = { title: "Mais vendidos" };

export default function BestSellersPage() {
  return (
    <CollectionPage
      eyebrow="Mais vendidos"
      title="Favoritos dos clientes"
      description="Produtos com maior procura, alto valor percebido e excelente potencial de recompra."
      products={products.filter((product) => product.bestSeller)}
    />
  );
}
