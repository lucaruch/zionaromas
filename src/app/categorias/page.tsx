import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCatalogCategories } from "@/lib/catalog";

export const metadata: Metadata = { title: "Marcas" };

export default async function CategoriesPage() {
  const categories = await getCatalogCategories();

  return (
    <section className="arabic-pattern bg-black pb-20 pt-32 text-white">
      <div className="container">
        <Badge className="border-gold/40 bg-gold/10 text-gold">Marcas</Badge>
        <h1 className="mt-4 max-w-3xl font-display text-5xl md:text-6xl">Escolha pela marca</h1>
        <p className="mt-5 max-w-2xl leading-8 text-white/60">
          A ZION AROMAS trabalha exclusivamente com perfumes árabes. Navegue pelas marcas disponíveis e encontre fragrâncias originais para diferentes estilos de uso.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {categories.map((category) => (
            <Link key={category.slug} href={`/produtos?categoria=${category.slug}`} className="group grid overflow-hidden border border-gold/20 bg-white/[0.03] md:grid-cols-[0.95fr_1.05fr]">
              <div className="relative min-h-72 overflow-hidden bg-[radial-gradient(circle_at_50%_35%,rgba(212,175,55,.13),transparent_42%),#070604] p-6">
                <div className="relative h-full min-h-60 overflow-hidden border border-gold/12 bg-[#f6f2e8]">
                  <Image
                    src={category.image}
                    alt={`Perfumes árabes ${category.name}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-contain p-5 transition duration-700 group-hover:scale-[1.03]"
                  />
                </div>
              </div>
              <div className="flex flex-col justify-center p-8">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-gold/70">Marca de perfume árabe</p>
                <h2 className="font-display text-3xl text-gold">{category.name}</h2>
                <p className="mt-4 leading-7 text-white/60">{category.description}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gold">
                  Ver perfumes da marca <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
          {!categories.length ? <p className="text-sm text-white/50">Nenhuma marca com produto cadastrado no momento.</p> : null}
        </div>
      </div>
    </section>
  );
}
