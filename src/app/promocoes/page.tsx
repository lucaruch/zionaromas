import type { Metadata } from "next";
import { CollectionPage } from "@/components/commerce/collection-page";
import { getCatalogProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "Promoções" };

export default async function PromotionsPage() {
  const products = await getCatalogProducts();
  return (
    <CollectionPage
      eyebrow="Promoções"
      title="Fragrâncias desejadas com valor especial"
      description="Oportunidades selecionadas para comprar perfumes árabes com excelente presença, apresentação refinada e preço mais atrativo."
      products={products.filter((product) => product.salePrice)}
    />
  );
}
