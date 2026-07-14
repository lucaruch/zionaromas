import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShieldCheck, Star, Truck } from "lucide-react";
import { AddToCart } from "@/components/commerce/add-to-cart";
import { ProductCard } from "@/components/commerce/product-card";
import { ProductGallery } from "@/components/commerce/product-gallery";
import { Badge } from "@/components/ui/badge";
import { findProduct, products } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { productJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [product.image]
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) notFound();
  const related = products.filter((item) => item.categorySlug === product.categorySlug && item.slug !== product.slug).slice(0, 3);

  return (
    <section className="arabic-pattern bg-black pb-20 pt-32 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
      />
      <div className="container">
        <nav className="mb-8 text-sm text-white/45">
          Início / {product.category} / <span className="text-gold">{product.name}</span>
        </nav>
        <div className="grid gap-12 lg:grid-cols-2">
          <ProductGallery images={product.gallery} name={product.name} />
          <div className="lg:sticky lg:top-28 lg:h-max">
            <Badge className="border-gold/40 bg-gold/10 text-gold">{product.category}</Badge>
            <h1 className="mt-5 font-display text-5xl md:text-6xl">{product.name}</h1>
            <p className="mt-4 flex items-center gap-2 text-sm text-white/55">
              <Star className="h-4 w-4 fill-gold text-gold" /> {product.rating} · {product.reviews} avaliações · SKU {product.sku}
            </p>
            <p className="mt-6 text-lg leading-8 text-white/65">{product.description}</p>
            <div className="mt-7 flex items-end gap-4">
              {product.salePrice ? (
                <span className="text-xl text-white/35 line-through">{formatCurrency(product.price)}</span>
              ) : null}
              <strong className="gold-text font-display text-5xl">{formatCurrency(product.salePrice ?? product.price)}</strong>
            </div>
            <div className="mt-7 grid gap-3 border border-gold/20 bg-white/[0.035] p-5 text-sm text-white/65">
              <span className="inline-flex items-center gap-2"><Truck className="h-4 w-4 text-gold" /> CEP automático e frete configurável</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-gold" /> Compra protegida e pagamento seguro</span>
            </div>
            <div className="mt-7">
              <AddToCart product={product} />
            </div>
            <div className="mt-8 grid gap-5 border-t border-gold/15 pt-8">
              <div>
                <h2 className="font-semibold text-white">Notas olfativas</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.notes.map((note) => (
                    <span key={note} className="rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs text-gold">{note}</span>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="font-semibold text-white">Descrição rica</h2>
                <p className="mt-3 leading-7 text-white/62">{product.richDescription}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-white/62">
                <span><strong className="text-white">Volume:</strong> {product.volume}</span>
                <span><strong className="text-white">Peso:</strong> {product.weight}</span>
                <span><strong className="text-white">Estoque:</strong> {product.stock} unidades</span>
                <span><strong className="text-white">Marca:</strong> {product.brand}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-20">
          <div className="mb-8">
            <Badge className="border-gold/40 bg-gold/10 text-gold">Avaliações</Badge>
            <h2 className="mt-4 font-display text-4xl">O que os clientes dizem</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {["Fixação impecável", "Entrega elegante", "Fragrância sofisticada"].map((title, index) => (
              <div key={title} className="border border-gold/18 bg-white/[0.035] p-6">
                <p className="mb-3 flex gap-1 text-gold">{Array.from({ length: 5 }).map((_, star) => <Star key={star} className="h-4 w-4 fill-current" />)}</p>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/58">Experiência premium do começo ao fim, com acabamento digno de presente.</p>
                <p className="mt-4 text-xs uppercase tracking-[0.16em] text-gold/60">Cliente {index + 1}</p>
              </div>
            ))}
          </div>
        </div>
        {related.length ? (
          <div className="mt-20">
            <div className="mb-8">
              <Badge className="border-gold/40 bg-gold/10 text-gold">Relacionados</Badge>
              <h2 className="mt-4 font-display text-4xl">Combine com</h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => <ProductCard key={item.slug} product={item} dark />)}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
