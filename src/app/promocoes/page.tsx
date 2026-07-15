import type { Metadata } from "next";
import { CollectionPage } from "@/components/commerce/collection-page";
import { products } from "@/lib/data";

export const metadata: Metadata = { title: "Promoções" };

export default function PromotionsPage() {
  return (
    <CollectionPage
      eyebrow="Promoções"
      title="Fragrâncias desejadas com valor especial"
      description="Oportunidades selecionadas para comprar perfumes árabes com excelente presença, apresentação refinada e preço mais atrativo."
      products={products.filter((product) => product.salePrice)}
    />
  );
}
