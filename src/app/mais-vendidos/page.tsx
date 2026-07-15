import type { Metadata } from "next";
import { CollectionPage } from "@/components/commerce/collection-page";
import { products } from "@/lib/data";

export const metadata: Metadata = { title: "Mais vendidos" };

export default function BestSellersPage() {
  return (
    <CollectionPage
      eyebrow="Mais vendidos"
      title="Os favoritos de quem busca presença"
      description="Fragrâncias com alta procura na ZION AROMAS, escolhidas por fixação, elogios e personalidade olfativa."
      products={products.filter((product) => product.bestSeller)}
    />
  );
}
