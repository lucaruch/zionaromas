import type { Metadata } from "next";
import { CollectionPage } from "@/components/commerce/collection-page";
import { products } from "@/lib/data";

export const metadata: Metadata = { title: "Promoções" };

export default function PromotionsPage() {
  return (
    <CollectionPage
      eyebrow="Promoções"
      title="Seleções com condição especial"
      description="Produtos premium com preço promocional, mantendo a mesma experiência de embalagem e atendimento ZION."
      products={products.filter((product) => product.salePrice)}
    />
  );
}
