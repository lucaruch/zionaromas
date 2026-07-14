import type { Metadata } from "next";
import { ProductCard } from "@/components/commerce/product-card";
import { Badge } from "@/components/ui/badge";
import { categories, products } from "@/lib/data";

export const metadata: Metadata = {
  title: "Produtos",
  description: "Catálogo completo de perfumes, velas, difusores e kits premium ZION AROMAS."
};

export default async function ProductsPage({
  searchParams
}: {
  searchParams?: Promise<{ categoria?: string; busca?: string; preco?: string; marca?: string; disponibilidade?: string }>;
}) {
  const filters = await searchParams;
  const filtered = products.filter((product) => {
    const byCategory = !filters?.categoria || product.categorySlug === filters.categoria;
    const bySearch =
      !filters?.busca ||
      product.name.toLowerCase().includes(filters.busca.toLowerCase()) ||
      product.shortDescription.toLowerCase().includes(filters.busca.toLowerCase());
    return byCategory && bySearch;
  });

  return (
    <section className="bg-white pb-20 pt-32">
      <div className="container">
        <div className="mb-10">
          <Badge>Catálogo</Badge>
          <h1 className="mt-4 font-display text-5xl">Produtos ZION</h1>
          <p className="mt-4 max-w-2xl leading-7 text-black/60">
            Navegue por categorias, disponibilidade, marcas e faixas de preço com carregamento leve e cards otimizados.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="h-max rounded-lg border border-black/10 bg-pearl p-5">
            <h2 className="font-semibold">Filtros</h2>
            <div className="mt-5 grid gap-6">
              <div>
                <p className="mb-3 text-xs uppercase tracking-[0.16em] text-black/45">Categoria</p>
                <div className="grid gap-2">
                  {categories.map((category) => (
                    <a key={category.slug} href={`/produtos?categoria=${category.slug}`} className="rounded-full px-3 py-2 text-sm hover:bg-white">
                      {category.name}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-xs uppercase tracking-[0.16em] text-black/45">Preço</p>
                <div className="grid gap-2 text-sm text-black/65">
                  <span>Até R$ 200</span>
                  <span>R$ 200 a R$ 400</span>
                  <span>Acima de R$ 400</span>
                </div>
              </div>
              <div>
                <p className="mb-3 text-xs uppercase tracking-[0.16em] text-black/45">Disponibilidade</p>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked className="accent-gold" /> Em estoque
                </label>
              </div>
            </div>
          </aside>
          <div>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-black/55">{filtered.length} produtos encontrados</p>
              <select className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm">
                <option>Mais relevantes</option>
                <option>Menor preço</option>
                <option>Maior preço</option>
                <option>Novidades</option>
              </select>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
