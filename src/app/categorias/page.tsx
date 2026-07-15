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
              <div className="relative grid min-h-72 place-items-center overflow-hidden bg-[#070604]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(212,175,55,.22),transparent_34%),linear-gradient(135deg,rgba(212,175,55,.12),transparent_42%),linear-gradient(180deg,transparent,rgba(0,0,0,.85))]" />
                <div className="absolute h-48 w-36 rounded-t-[70px] border border-gold/25 bg-black/45 transition duration-700 group-hover:border-gold/55" />
                <div className="relative grid h-28 w-28 place-items-center border border-gold/25 bg-black shadow-[0_18px_60px_rgba(0,0,0,.45)]">
                  <Image src="/brand/zion-aromas-logo.png" alt="ZION AROMAS" width={84} height={84} className="h-20 w-20 object-contain" />
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
