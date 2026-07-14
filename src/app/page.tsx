import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/commerce/product-card";
import { categories, products, testimonials } from "@/lib/data";

export default function HomePage() {
  const featured = products.filter((product) => product.featured);
  const bestSellers = products.filter((product) => product.bestSeller);

  return (
    <>
      <section className="relative min-h-[92vh] overflow-hidden bg-black text-white">
        <Image
          src="https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=1900&q=88"
          alt="Perfumes premium ZION AROMAS"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-58"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.88),rgba(0,0,0,.42),rgba(0,0,0,.15))]" />
        <div className="container relative flex min-h-[92vh] items-center pb-20 pt-28">
          <div className="max-w-2xl soft-reveal">
            <Image src="/brand/zion-aromas-logo.png" alt="ZION AROMAS" width={130} height={130} className="mb-8 h-28 w-28 object-contain" />
            <Badge className="border-white/25 bg-white/10 text-gold">Alta perfumaria autoral</Badge>
            <h1 className="mt-6 font-display text-5xl leading-[1.02] tracking-normal md:text-7xl">
              ZION AROMAS
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/72">
              Perfumes, velas e rituais aromáticos desenhados para presença, sofisticação e memórias que permanecem.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/produtos">
                <Button size="lg">Comprar agora <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <Link href="/sobre">
                <Button size="lg" variant="glass">Conhecer a marca</Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/35 backdrop-blur">
          <div className="container grid gap-4 py-5 text-sm text-white/70 md:grid-cols-3">
            <span className="inline-flex items-center gap-2"><Truck className="h-4 w-4 text-gold" /> Frete com cálculo por CEP</span>
            <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-gold" /> PIX, cartão e boleto</span>
            <span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-gold" /> Embalagem premium</span>
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <Badge>Categorias</Badge>
              <h2 className="mt-4 font-display text-4xl md:text-5xl">Rituais de fragrância</h2>
            </div>
            <Link href="/categorias" className="inline-flex items-center gap-2 text-sm font-semibold text-gold-deep">
              Ver categorias <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {categories.map((category) => (
              <Link key={category.slug} href={`/produtos?categoria=${category.slug}`} className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-black">
                <Image src={category.image} alt={category.name} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover opacity-75 transition duration-700 group-hover:scale-105 group-hover:opacity-55" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 p-5 text-white">
                  <h3 className="font-display text-2xl">{category.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/65">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-pearl">
        <div className="container">
          <div className="mb-10 text-center">
            <Badge>Destaques</Badge>
            <h2 className="mt-4 font-display text-4xl md:text-5xl">Escolhas da maison</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-black text-white">
        <div className="container grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Badge className="border-white/20 bg-white/10 text-gold">Mais vendidos</Badge>
            <h2 className="mt-5 font-display text-4xl md:text-5xl">Fragrâncias com assinatura memorável</h2>
            <p className="mt-5 leading-8 text-white/62">
              Uma curadoria com alta conversão: produtos de rastro elegante, excelente apresentação e valor percebido elevado.
            </p>
            <Link href="/mais-vendidos" className="mt-8 inline-flex">
              <Button>Ver best sellers</Button>
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {bestSellers.map((product) => (
              <Link key={product.slug} href={`/produto/${product.slug}`} className="group rounded-lg border border-white/10 bg-white/[0.04] p-4 transition hover:border-gold/40">
                <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-white/5">
                  <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 100vw, 30vw" className="object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <h3 className="mt-4 font-display text-2xl">{product.name}</h3>
                <p className="mt-2 text-sm text-white/55">{product.shortDescription}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container">
          <div className="mb-10 text-center">
            <Badge>Depoimentos</Badge>
            <h2 className="mt-4 font-display text-4xl md:text-5xl">Experiência de boutique</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure key={testimonial.name} className="rounded-lg border border-black/10 bg-white p-7 shadow-sm">
                <blockquote className="leading-7 text-black/65">“{testimonial.text}”</blockquote>
                <figcaption className="mt-6">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gold-deep">{testimonial.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
