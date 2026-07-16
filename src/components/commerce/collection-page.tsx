import { ProductCard } from "@/components/commerce/product-card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/data";

export function CollectionPage({
  eyebrow,
  title,
  description,
  products
}: {
  eyebrow: string;
  title: string;
  description: string;
  products: Product[];
}) {
  return (
    <section className="bg-black pb-20 pt-24 text-white sm:pt-28">
      <div className="arabic-pattern border-b border-gold/20 bg-black text-white">
        <div className="container py-12 sm:py-16">
          <Badge className="border-gold/40 bg-black/40 text-gold">{eyebrow}</Badge>
          <h1 className="mt-6 max-w-4xl break-words font-display text-4xl leading-tight sm:text-5xl md:text-6xl">{title}</h1>
          <p className="mt-5 max-w-2xl leading-8 text-white/68">{description}</p>
        </div>
      </div>
      <div className="container pt-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} dark />
          ))}
        </div>
        {!products.length ? <p className="py-12 text-center text-sm text-white/50">Nenhum produto cadastrado nesta seção.</p> : null}
      </div>
    </section>
  );
}
