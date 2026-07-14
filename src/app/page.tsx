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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_44%,rgba(212,175,55,.22),transparent_30%),radial-gradient(circle_at_22%_70%,rgba(255,255,255,.08),transparent_28%),linear-gradient(90deg,rgba(0,0,0,.96),rgba(0,0,0,.78),rgba(0,0,0,.48))]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black to-transparent" />
        <div className="container relative flex min-h-[92vh] items-center pb-24 pt-32">
          <div className="grid w-full items-center gap-12 lg:grid-cols-[0.86fr_1fr]">
            <div className="max-w-2xl soft-reveal">
              <Image src="/brand/zion-aromas-logo.png" alt="ZION AROMAS" width={136} height={136} className="mb-8 h-28 w-28 object-contain" />
              <Badge className="border-gold/40 bg-black/40 text-gold">Perfumes árabes premium</Badge>
              <h1 className="mt-6 font-display text-5xl leading-[1.02] tracking-normal md:text-7xl">
                ZION <span className="gold-text">AROMAS</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/74">
                Oud, âmbar, musk e especiarias em fragrâncias orientais intensas, elegantes e feitas para deixar presença.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
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
            <div className="hidden lg:block">
              <div className="gold-frame relative ml-auto aspect-[4/5] max-w-md overflow-hidden rounded-sm border border-gold/30 bg-[#070604] shadow-[0_35px_100px_rgba(0,0,0,.65)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(212,175,55,.25),transparent_30%),linear-gradient(145deg,rgba(255,255,255,.12),transparent_35%,rgba(212,175,55,.12))]" />
                <div className="absolute left-1/2 top-20 h-10 w-20 -translate-x-1/2 rounded-t-lg border border-gold/50 bg-black" />
                <div className="absolute left-1/2 top-28 h-[58%] w-[58%] -translate-x-1/2 rounded-t-[64px] border border-gold/35 bg-gradient-to-br from-[#090909] via-[#1a160d] to-black shadow-[inset_24px_0_55px_rgba(255,255,255,.06),0_24px_80px_rgba(212,175,55,.18)]" />
                <div className="absolute left-1/2 top-52 grid h-36 w-36 -translate-x-1/2 place-items-center rounded-full border border-gold/35 bg-black/78">
                  <Image src="/brand/zion-aromas-logo.png" alt="ZION AROMAS" width={112} height={112} className="h-28 w-28 object-contain" />
                </div>
                <div className="absolute bottom-8 left-8 right-8">
                  <p className="text-xs uppercase tracking-[0.28em] text-gold">Assinatura oriental</p>
                  <p className="mt-3 font-display text-3xl">Oud, âmbar e madeiras nobres</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 border-t border-gold/20 bg-black/55 backdrop-blur">
          <div className="container grid gap-4 py-5 text-sm text-white/72 md:grid-cols-3">
            <span className="inline-flex items-center gap-2"><Truck className="h-4 w-4 text-gold" /> Frete por CEP com Correios</span>
            <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-gold" /> PIX, cartão e boleto</span>
            <span className="inline-flex items-center gap-2"><Gem className="h-4 w-4 text-gold" /> Curadoria árabe selecionada</span>
          </div>
        </div>
      </section>

      <section className="section-pad bg-[#f7f5ef]">
        <div className="container">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <Badge>Categorias</Badge>
              <h2 className="mt-4 font-display text-4xl md:text-5xl">Famílias olfativas</h2>
              <p className="mt-4 max-w-2xl leading-7 text-black/60">
                Escolha pelo estilo que mais combina com a sua presença: oud intenso, florais orientais, musk elegante ou kits presenteáveis.
              </p>
            </div>
            <Link href="/categorias" className="inline-flex items-center gap-2 text-sm font-semibold text-gold-deep">
              Ver categorias <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {categories.map((category) => (
              <Link key={category.slug} href={`/produtos?categoria=${category.slug}`} className="group gold-frame relative aspect-[3/4] overflow-hidden rounded-sm bg-black shadow-sm">
                <Image src={category.image} alt={category.name} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover opacity-72 transition duration-700 group-hover:scale-105 group-hover:opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/25 to-transparent" />
                <div className="absolute bottom-0 p-5 text-white">
                  <h3 className="font-display text-2xl">{category.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/65">{category.description}</p>
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

      <section className="section-pad bg-[#0b0a08] text-white">
        <div className="container grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Badge className="border-gold/40 bg-gold/10 text-gold">Mais vendidos</Badge>
            <h2 className="mt-5 font-display text-4xl md:text-5xl">Rastro marcante, acabamento sofisticado</h2>
            <p className="mt-5 leading-8 text-white/62">
              Os favoritos da ZION combinam intensidade árabe, projeção elegante e notas que permanecem na memória.
            </p>
            <Link href="/mais-vendidos" className="mt-8 inline-flex">
              <Button>Ver best sellers</Button>
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {bestSellers.map((product) => (
              <Link key={product.slug} href={`/produto/${product.slug}`} className="group border border-gold/18 bg-white/[0.035] p-4 transition hover:border-gold/55">
                <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
                  <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 100vw, 30vw" className="object-cover opacity-82 transition duration-700 group-hover:scale-105" />
                </div>
                <h3 className="mt-4 font-display text-2xl text-gold">{product.name}</h3>
                <p className="mt-2 text-sm text-white/55">{product.shortDescription}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-[#f7f5ef]">
        <div className="container">
          <div className="mb-10 text-center">
            <Badge>Depoimentos</Badge>
            <h2 className="mt-4 font-display text-4xl md:text-5xl">Experiência de boutique</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure key={testimonial.name} className="border border-black/10 bg-white p-7 shadow-sm">
                <Sparkles className="mb-5 h-5 w-5 text-gold-deep" />
                <blockquote className="leading-7 text-black/65">"{testimonial.text}"</blockquote>
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
