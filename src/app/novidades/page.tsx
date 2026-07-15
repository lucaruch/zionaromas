import type { Metadata } from "next";
import { CollectionPage } from "@/components/commerce/collection-page";
import { products } from "@/lib/data";

export const metadata: Metadata = { title: "Novidades" };

export default function NewProductsPage() {
  return (
    <CollectionPage
      eyebrow="Novidades"
      title="Novas escolhas para renovar sua assinatura"
      description="Perfumes recém-adicionados à seleção ZION, com notas orientais, desempenho marcante e perfis para diferentes ocasiões."
      products={products.filter((product) => product.isNew)}
    />
  );
}
