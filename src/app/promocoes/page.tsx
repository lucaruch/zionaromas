import type { Metadata } from "next";
import { CollectionPage } from "@/components/commerce/collection-page";
import { products } from "@/lib/data";

export const metadata: Metadata = { title: "Promoções" };

export default function PromotionsPage() {
  return (
    <CollectionPage
      eyebrow="Promoções"
      title="Perfumes árabes com condição especial"
      description="Seleções premium com preço promocional, embalagem cuidadosa e atendimento ZION."
      products={products.filter((product) => product.salePrice)}
    />
  );
}
