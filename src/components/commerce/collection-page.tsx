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
    <section className="bg-white pb-20 pt-32">
      <div className="container">
        <div className="mb-10 max-w-3xl">
          <Badge>{eyebrow}</Badge>
          <h1 className="mt-4 font-display text-5xl">{title}</h1>
          <p className="mt-4 leading-7 text-black/60">{description}</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
