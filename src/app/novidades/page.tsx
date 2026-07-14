import type { Metadata } from "next";
import { CollectionPage } from "@/components/commerce/collection-page";
import { products } from "@/lib/data";

export const metadata: Metadata = { title: "Novidades" };

export default function NewProductsPage() {
  return (
    <CollectionPage
      eyebrow="Novidades"
      title="Lançamentos orientais"
      description="Novas fragrâncias árabes com oud, musk, âmbar, especiarias e florais sofisticados."
      products={products.filter((product) => product.isNew)}
    />
  );
}
