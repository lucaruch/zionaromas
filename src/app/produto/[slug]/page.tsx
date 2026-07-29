import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShieldCheck, Star, Truck } from "lucide-react";
import { AddToCart } from "@/components/commerce/add-to-cart";
import { ProductCard } from "@/components/commerce/product-card";
import { ProductGallery } from "@/components/commerce/product-gallery";
import { Badge } from "@/components/ui/badge";
import { getCatalogProduct, getCatalogProducts } from "@/lib/catalog";
import type { Product } from "@/lib/data";
import { productJsonLd } from "@/lib/seo";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [];
}

function getUsageImpressions(product: Product) {
  const primaryNote = product.notes[0] || "assinatura oriental";
  const secondaryNote = product.notes[1] || "presença marcante";
  const brandCopy: Record<string, string> = {
    Afnan: "perfumes intensos, modernos e com ótima projeção",
    "Al Wataniah": "fragrâncias envolventes, com doçura equilibrada e acabamento oriental",
    Armaf: "criações versáteis, fáceis de usar e com presença elegante",
    Lattafa: "perfumes árabes conhecidos pelo rastro, intensidade e excelente valor percebido",
    Zakat: "fragrâncias de impacto para quem gosta de presença marcante",
    "French Avenue": "perfumes sofisticados, com leitura contemporânea e boa performance",
    "Maison Alhambra": "fragrâncias refinadas, com proposta elegante para diferentes ocasiões",
    Orientica: "perfumes de apresentação marcante, com assinatura luxuosa e envolvente"
  };
  const brandProfile = brandCopy[product.brand] || "perfumes árabes selecionados pela curadoria da ZION AROMAS";

  return [
    {
      title: "Primeira impressão",
      text: `${product.name} entrega uma saída bem definida, com ${primaryNote.toLowerCase()} em evidência e evolução confortável na pele.`,
      label: "Perfil olfativo"
    },
    {
      title: "Presença no uso",
      text: `Boa escolha para quem procura ${secondaryNote.toLowerCase()}, rastro elegante e uma fragrância que não passa despercebida.`,
      label: "Desempenho"
    },
    {
      title: "Experiência da marca",
      text: `${product.brand} é reconhecida por ${brandProfile}. Um perfume indicado para quem valoriza presença, embalagem e custo-benefício.`,
      label: "Curadoria ZION"
    }
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProduct(slug);
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
  const product = await getCatalogProduct(slug);
  if (!product) notFound();
  const products = await getCatalogProducts();
  const related = products.filter((item) => item.categorySlug === product.categorySlug && item.slug !== product.slug).slice(0, 3);
  const usageImpressions = getUsageImpressions(product);

  return (
    <section className="arabic-pattern bg-black pb-20 pt-28 text-white sm:pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
      />
      <div className="container">
        <nav className="mb-8 flex flex-wrap gap-2 text-sm text-white/45">
          <span>Início</span>
          <span>/</span>
          <span>{product.category}</span>
          <span>/</span>
          <span className="min-w-0 break-words text-gold">{product.name}</span>
        </nav>
        <div className="grid min-w-0 gap-10 lg:grid-cols-2 lg:gap-12">
          <ProductGallery images={product.gallery} name={product.name} />
          <div className="min-w-0 lg:sticky lg:top-28 lg:h-max">
            <Badge className="border-gold/40 bg-gold/10 text-gold">{product.category}</Badge>
            <h1 className="mt-5 break-words font-display text-4xl leading-tight sm:text-5xl md:text-6xl">{product.name}</h1>
            <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/55">
              <Star className="h-4 w-4 fill-gold text-gold" /> Perfume árabe selecionado pela curadoria ZION
            </p>
            <p className="mt-6 text-base leading-8 text-white/65 sm:text-lg">{product.shortDescription}</p>
            <div className="mt-7 flex flex-wrap items-end gap-4">
              {product.salePrice ? (
                <span className="text-xl text-white/35 line-through">{formatCurrency(product.price)}</span>
              ) : null}
              <strong className="gold-text break-words font-display text-4xl sm:text-5xl">{formatCurrency(product.salePrice ?? product.price)}</strong>
            </div>
            <div className="mt-7 grid gap-3 border border-gold/20 bg-white/[0.035] p-4 text-sm text-white/65 sm:p-5">
              <span className="inline-flex items-start gap-2"><Truck className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> Calcule o frete pelo CEP no checkout</span>
              <span className="inline-flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> Pedido conferido antes do envio</span>
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
                <h2 className="font-semibold text-white">Sobre a fragrância</h2>
                <p className="mt-3 leading-7 text-white/62">{product.richDescription}</p>
              </div>
              <div className="grid gap-4 text-sm text-white/62 sm:grid-cols-2">
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
            <Badge className="border-gold/40 bg-gold/10 text-gold">Experiência</Badge>
            <h2 className="mt-4 font-display text-4xl">Impressões de uso</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {usageImpressions.map((impression) => (
              <div key={impression.title} className="border border-gold/18 bg-white/[0.035] p-5 sm:p-6">
                <p className="mb-3 flex gap-1 text-gold">{Array.from({ length: 5 }).map((_, star) => <Star key={star} className="h-4 w-4 fill-current" />)}</p>
                <h3 className="font-semibold">{impression.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/58">{impression.text}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.16em] text-gold/60">{impression.label}</p>
              </div>
            ))}
          </div>
        </div>
        {related.length ? (
          <div className="mt-20">
            <div className="mb-8">
              <Badge className="border-gold/40 bg-gold/10 text-gold">Relacionados</Badge>
              <h2 className="mt-4 font-display text-4xl">Você também pode gostar</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => <ProductCard key={item.slug} product={item} dark />)}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
