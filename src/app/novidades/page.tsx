import type { Metadata } from "next";
import { CollectionPage } from "@/components/commerce/collection-page";
import { products } from "@/lib/data";

export const metadata: Metadata = { title: "Novidades" };

export default function NewProductsPage() {
  return (
    <CollectionPage
      eyebrow="Novidades"
      title="Lançamentos recentes"
      description="Novas assinaturas olfativas e produtos para casa adicionados à curadoria ZION."
      products={products.filter((product) => product.isNew)}
    />
  );
}
