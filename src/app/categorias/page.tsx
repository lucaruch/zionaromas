import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { categories } from "@/lib/data";

export const metadata: Metadata = { title: "Marcas" };

export default function CategoriesPage() {
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
              <div className="relative min-h-72 overflow-hidden bg-[#070604]">
                <Image
                  src={category.image}
                  alt={`Perfumes árabes ${category.name}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover opacity-78 transition duration-700 group-hover:scale-105 group-hover:opacity-94"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(212,175,55,.08),transparent_36%),linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.28),rgba(0,0,0,.82))]" />
                <div className="absolute left-5 top-5 grid h-20 w-20 place-items-center border border-gold/25 bg-black/78 shadow-[0_18px_60px_rgba(0,0,0,.45)] backdrop-blur">
                  <Image src="/brand/zion-aromas-logo.png" alt="ZION AROMAS" width={60} height={60} className="h-14 w-14 object-contain" />
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
        </div>
      </div>
    </section>
  );
}
