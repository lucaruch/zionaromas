import type { Metadata } from "next";
import { CollectionPage } from "@/components/commerce/collection-page";
import { getCatalogProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "Novidades" };

export default async function NewProductsPage() {
  const products = await getCatalogProducts();
  return (
    <CollectionPage
      eyebrow="Novidades"
      title="Novas escolhas para renovar sua assinatura"
      description="Perfumes recém-adicionados à seleção ZION, com notas orientais, desempenho marcante e perfis para diferentes ocasiões."
      products={products.filter((product) => product.isNew)}
    />
  );
}
