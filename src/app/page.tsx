import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Gem, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/commerce/product-card";
import { categories, products, testimonials } from "@/lib/data";

export default function HomePage() {
  const featured = products.filter((product) => product.featured);
  const bestSellers = products.filter((product) => product.bestSeller);

  return (
    <>
      <section className="arabic-pattern relative min-h-[92vh] overflow-hidden text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(212,175,55,.18),transparent_25%),linear-gradient(180deg,rgba(0,0,0,.72),rgba(0,0,0,.96)_78%),linear-gradient(90deg,#000,rgba(0,0,0,.82),#000)]" />
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/10" />
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/10" />

        <div className="container relative flex min-h-[92vh] items-center justify-center pb-28 pt-32 text-center">
          <div className="mx-auto max-w-4xl soft-reveal">
            <Image
              src="/brand/zion-aromas-logo.png"
              alt="ZION AROMAS"
              width={172}
              height={172}
              priority
              className="mx-auto mb-8 h-36 w-36 object-contain drop-shadow-[0_0_45px_rgba(212,175,55,.24)]"
            />
            <Badge className="border-gold/45 bg-black/50 text-gold">Perfumaria árabe premium</Badge>
            <h1 className="mt-7 font-display text-6xl leading-[0.95] tracking-normal md:text-8xl">
              ZION <span className="gold-text">AROMAS</span>
            </h1>
            <div className="luxury-divider mx-auto mt-7 max-w-lg" />
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-white/72">
              Fragrâncias árabes intensas, elegantes e memoráveis. Oud, âmbar, musk e especiarias em uma curadoria de presença sofisticada.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/produtos">
                <Button size="lg">
                  Comprar perfumes <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/categorias">
                <Button size="lg" variant="glass">Ver famílias olfativas</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-y border-gold/20 bg-black/70 backdrop-blur">
          <div className="container grid gap-4 py-5 text-sm text-white/72 md:grid-cols-3">
            <span className="inline-flex items-center justify-center gap-2"><Truck className="h-4 w-4 text-gold" /> Frete por CEP com Correios</span>
            <span className="inline-flex items-center justify-center gap-2"><Check className="h-4 w-4 text-gold" /> PIX, cartão e boleto</span>
            <span className="inline-flex items-center justify-center gap-2"><Gem className="h-4 w-4 text-gold" /> Curadoria árabe selecionada</span>
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-gold/15 bg-[#050505] text-white">
        <div className="container">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <Badge className="border-gold/40 bg-gold/10 text-gold">Categorias</Badge>
              <h2 className="mt-4 font-display text-4xl md:text-5xl">Famílias olfativas</h2>
              <p className="mt-4 max-w-2xl leading-7 text-white/58">
                Escolha pelo estilo que combina com a sua presença: oud intenso, florais orientais, musk elegante ou kits presenteáveis.
              </p>
            </div>
            <Link href="/categorias" className="inline-flex items-center gap-2 text-sm font-semibold text-gold">
              Ver categorias <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {categories.map((category) => (
              <Link key={category.slug} href={`/produtos?categoria=${category.slug}`} className="group gold-frame relative aspect-[3/4] overflow-hidden rounded-sm border border-gold/20 bg-black shadow-[0_24px_80px_rgba(0,0,0,.45)]">
                <Image src={category.image} alt={category.name} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover opacity-48 grayscale transition duration-700 group-hover:scale-105 group-hover:opacity-62" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/15" />
                <div className="absolute bottom-0 p-5 text-white">
                  <h3 className="font-display text-2xl text-gold">{category.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/58">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-black text-white">
        <div className="container">
          <div className="mb-10 text-center">
            <Badge className="border-gold/40 bg-gold/10 text-gold">Destaques</Badge>
            <h2 className="mt-4 font-display text-4xl md:text-5xl">Perfumes em evidência</h2>
            <div className="luxury-divider mx-auto mt-6 max-w-sm" />
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.slug} product={product} dark />
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-gold/15 bg-[#070604] text-white">
        <div className="container grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Badge className="border-gold/40 bg-gold/10 text-gold">Mais vendidos</Badge>
            <h2 className="mt-5 font-display text-4xl md:text-5xl">Rastro marcante, acabamento sofisticado</h2>
            <p className="mt-5 leading-8 text-white/60">
              Os favoritos da ZION combinam intensidade árabe, projeção elegante e notas que permanecem na memória.
            </p>
            <Link href="/mais-vendidos" className="mt-8 inline-flex">
              <Button>Ver best sellers</Button>
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {bestSellers.map((product) => (
              <Link key={product.slug} href={`/produto/${product.slug}`} className="group border border-gold/20 bg-white/[0.025] p-4 transition hover:border-gold/60 hover:bg-white/[0.045]">
                <div className="relative aspect-[4/3] overflow-hidden bg-black">
                  <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 100vw, 30vw" className="object-cover opacity-56 grayscale transition duration-700 group-hover:scale-105 group-hover:opacity-75" />
                </div>
                <h3 className="mt-4 font-display text-2xl text-gold">{product.name}</h3>
                <p className="mt-2 text-sm text-white/55">{product.shortDescription}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-black text-white">
        <div className="container">
          <div className="mb-10 text-center">
            <Badge className="border-gold/40 bg-gold/10 text-gold">Depoimentos</Badge>
            <h2 className="mt-4 font-display text-4xl md:text-5xl">Experiência de boutique</h2>
            <div className="luxury-divider mx-auto mt-6 max-w-sm" />
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure key={testimonial.name} className="border border-gold/18 bg-white/[0.035] p-7 shadow-[0_24px_80px_rgba(0,0,0,.38)]">
                <Sparkles className="mb-5 h-5 w-5 text-gold" />
                <blockquote className="leading-7 text-white/62">"{testimonial.text}"</blockquote>
                <figcaption className="mt-6">
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-gold">{testimonial.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
