import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Gem, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/commerce/product-card";
import { getCatalogCategories, getCatalogProducts } from "@/lib/catalog";

export default async function HomePage() {
  const [categories, products] = await Promise.all([getCatalogCategories(), getCatalogProducts()]);
  const featured = products.filter((product) => product.featured);
  const bestSellers = products.filter((product) => product.bestSeller);

  return (
    <>
      <section className="arabic-pattern relative min-h-[760px] overflow-hidden bg-black text-white sm:min-h-[92vh]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(212,175,55,.2),transparent_26%),linear-gradient(180deg,rgba(0,0,0,.7),rgba(0,0,0,.96)_78%),linear-gradient(90deg,#000,rgba(0,0,0,.82),#000)]" />
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black to-transparent" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/10 sm:block" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/10 sm:block" />

        <div className="container relative flex min-h-[760px] items-center justify-center pb-40 pt-28 text-center sm:min-h-[92vh] sm:pb-32 sm:pt-36">
          <div className="mx-auto max-w-4xl soft-reveal">
            <Image
              src="/brand/zion-aromas-logo.png"
              alt="ZION AROMAS"
              width={172}
              height={172}
              priority
              className="mx-auto mb-7 h-28 w-28 object-contain drop-shadow-[0_0_45px_rgba(212,175,55,.24)] sm:h-36 sm:w-36"
            />
            <Badge className="border-gold/45 bg-black/50 text-gold">Perfumaria árabe selecionada</Badge>
            <h1 className="mt-7 break-words font-display text-5xl leading-[0.95] tracking-normal sm:text-6xl md:text-8xl">
              ZION <span className="gold-text">AROMAS</span>
            </h1>
            <div className="luxury-divider mx-auto mt-7 max-w-lg" />
            <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
              Perfumes árabes de marcas desejadas, escolhidos pela presença, fixação e personalidade que transformam a fragrância em assinatura.
            </p>
            <div className="mx-auto mt-9 flex max-w-md flex-col justify-center gap-3 sm:max-w-none sm:flex-row">
              <Link href="/produtos" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  Ver perfumes <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/categorias" className="w-full sm:w-auto">
                <Button size="lg" variant="glass" className="w-full sm:w-auto">
                  Ver marcas
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-y border-gold/20 bg-black/75 backdrop-blur">
          <div className="container grid gap-3 py-4 text-sm text-white/72 sm:grid-cols-3">
            <span className="inline-flex items-center justify-center gap-2 text-center"><Truck className="h-4 w-4 shrink-0 text-gold" /> Frete por CEP com Correios</span>
            <span className="inline-flex items-center justify-center gap-2 text-center"><Check className="h-4 w-4 shrink-0 text-gold" /> PIX, cartão e boleto</span>
            <span className="inline-flex items-center justify-center gap-2 text-center"><Gem className="h-4 w-4 shrink-0 text-gold" /> Marcas árabes selecionadas</span>
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-gold/15 bg-[#050505] text-white">
        <div className="container">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <Badge className="border-gold/40 bg-gold/10 text-gold">Marcas</Badge>
              <h2 className="mt-4 font-display text-4xl sm:text-5xl">Marcas árabes selecionadas</h2>
              <p className="mt-4 max-w-2xl leading-7 text-white/58">
                Encontre perfumes árabes das marcas selecionadas pela ZION AROMAS, com desempenho, elegância e excelente valor percebido.
              </p>
            </div>
            <Link href="/categorias" className="inline-flex items-center gap-2 text-sm font-semibold text-gold">
              Ver marcas <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/produtos?categoria=${category.slug}`}
                className="group gold-frame relative min-h-[430px] overflow-hidden rounded-sm border border-gold/20 bg-[#070604] shadow-[0_24px_80px_rgba(0,0,0,.45)]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(212,175,55,.12),transparent_38%),linear-gradient(180deg,rgba(255,255,255,.035),rgba(0,0,0,.18)_45%,rgba(0,0,0,.88))]" />
                <div className="relative mx-5 mt-5 aspect-square overflow-hidden border border-gold/12 bg-[#f6f2e8]">
                  <Image
                    src={category.image}
                    alt={`Perfumes árabes ${category.name}`}
                    fill
                    sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 22vw"
                    className="object-contain p-4 transition duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="relative p-5 text-white">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-gold/70">Perfumes árabes</p>
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
            <h2 className="mt-4 font-display text-4xl sm:text-5xl">Escolhas em evidência</h2>
            <div className="luxury-divider mx-auto mt-6 max-w-sm" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.slug} product={product} dark />
            ))}
          </div>
          {!featured.length ? <p className="text-center text-sm text-white/50">Cadastre produtos em destaque no painel administrativo.</p> : null}
        </div>
      </section>

      <section className="section-pad border-y border-gold/15 bg-[#070604] text-white">
        <div className="container grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Badge className="border-gold/40 bg-gold/10 text-gold">Mais vendidos</Badge>
            <h2 className="mt-5 font-display text-4xl sm:text-5xl">Fragrâncias que permanecem</h2>
            <p className="mt-5 leading-8 text-white/60">
              Os favoritos da ZION reúnem projeção elegante, notas marcantes e aquele rastro que chama atenção na medida certa.
            </p>
            <Link href="/mais-vendidos" className="mt-8 inline-flex w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Ver mais vendidos</Button>
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {bestSellers.map((product) => (
              <Link key={product.slug} href={`/produto/${product.slug}`} className="group min-w-0 border border-gold/20 bg-white/[0.025] p-4 transition hover:border-gold/60 hover:bg-white/[0.045]">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#f6f2e8]">
                  <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw" className="object-contain p-4 transition duration-700 group-hover:scale-[1.03]" />
                </div>
                <h3 className="mt-4 font-display text-2xl text-gold">{product.name}</h3>
                <p className="mt-2 text-sm leading-6 text-white/55">{product.shortDescription}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
