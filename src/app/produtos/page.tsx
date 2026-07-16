import type { Metadata } from "next";
import { ProductCard } from "@/components/commerce/product-card";
import { Badge } from "@/components/ui/badge";
import { getCatalogCategories, getCatalogProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Produtos",
  description: "Perfumes árabes selecionados de marcas como Lattafa, Maison Alhambra, Armaf, Afnan, Al Wataniah e French Avenue."
};

export default async function ProductsPage({
  searchParams
}: {
  searchParams?: Promise<{ categoria?: string; busca?: string; preco?: string; marca?: string; disponibilidade?: string }>;
}) {
  const filters = await searchParams;
  const [categories, products] = await Promise.all([getCatalogCategories(), getCatalogProducts()]);
  const filtered = products.filter((product) => {
    const byCategory = !filters?.categoria || product.categorySlug === filters.categoria;
    const bySearch =
      !filters?.busca ||
      product.name.toLowerCase().includes(filters.busca.toLowerCase()) ||
      product.shortDescription.toLowerCase().includes(filters.busca.toLowerCase());
    return byCategory && bySearch;
  });

  return (
    <section className="bg-black pb-20 pt-28 text-white">
      <div className="arabic-pattern border-b border-gold/20 bg-black text-white">
        <div className="container py-16">
          <Badge className="border-gold/40 bg-black/40 text-gold">Seleção ZION</Badge>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
            <div>
              <h1 className="font-display text-5xl md:text-6xl">
                Perfumes árabes <span className="gold-text">selecionados</span>
              </h1>
              <p className="mt-5 max-w-2xl leading-8 text-white/68">
                Uma vitrine dedicada a perfumes árabes com presença, fixação e acabamento para diferentes estilos de uso.
              </p>
            </div>
            <div className="border border-gold/20 bg-white/[0.04] p-5 text-sm leading-7 text-white/62">
              Escolha por marca árabe, veja as notas principais de cada perfume e encontre uma fragrância que combine com sua rotina.
            </div>
          </div>
        </div>
      </div>

      <div className="container pt-12">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="h-max border border-gold/20 bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,.35)]">
            <h2 className="font-display text-2xl">Refinar busca</h2>
            <div className="luxury-divider my-5" />
            <div className="grid gap-7">
              <div>
                <p className="mb-3 text-xs uppercase tracking-[0.16em] text-gold/70">Marca</p>
                <div className="grid gap-2">
                  {categories.map((category) => (
                    <a key={category.slug} href={`/produtos?categoria=${category.slug}`} className="rounded-full px-3 py-2 text-sm text-white/70 transition hover:bg-gold hover:text-black">
                      {category.name}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-xs uppercase tracking-[0.16em] text-gold/70">Preço</p>
                <div className="grid gap-2 text-sm text-white/65">
                  <span>Até R$ 200</span>
                  <span>R$ 200 a R$ 400</span>
                  <span>Acima de R$ 400</span>
                </div>
              </div>
              <div>
                <p className="mb-3 text-xs uppercase tracking-[0.16em] text-gold/70">Disponibilidade</p>
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input type="checkbox" defaultChecked className="accent-gold" /> Em estoque
                </label>
              </div>
            </div>
          </aside>
          <div>
            <div className="mb-6 flex flex-col gap-3 border-b border-gold/15 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-white/55">{filtered.length} fragrâncias encontradas</p>
              <select className="rounded-full border border-gold/20 bg-black px-4 py-2 text-sm text-white outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/10">
                <option>Mais relevantes</option>
                <option>Menor preço</option>
                <option>Maior preço</option>
                <option>Novidades</option>
              </select>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.slug} product={product} dark />
              ))}
            </div>
            {!filtered.length ? <p className="py-12 text-center text-sm text-white/50">Nenhum produto cadastrado para esta seleção.</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
