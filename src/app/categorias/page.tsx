import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { categories } from "@/lib/data";

export const metadata: Metadata = { title: "Categorias" };

export default function CategoriesPage() {
  return (
    <section className="arabic-pattern bg-black pb-20 pt-32 text-white">
      <div className="container">
        <Badge className="border-gold/40 bg-gold/10 text-gold">Categorias</Badge>
        <h1 className="mt-4 max-w-3xl font-display text-5xl md:text-6xl">Coleções por ritual</h1>
        <p className="mt-5 max-w-2xl leading-8 text-white/60">
          Navegue por famílias olfativas pensadas para diferentes intensidades, ocasiões e estilos de presença.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {categories.map((category) => (
            <Link key={category.slug} href={`/produtos?categoria=${category.slug}`} className="group grid overflow-hidden border border-gold/20 bg-white/[0.03] md:grid-cols-[0.95fr_1.05fr]">
              <div className="relative min-h-72 bg-black">
                <Image src={category.image} alt={category.name} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover opacity-52 grayscale transition duration-700 group-hover:scale-105 group-hover:opacity-72" />
              </div>
              <div className="flex flex-col justify-center p-8">
                <h2 className="font-display text-3xl text-gold">{category.name}</h2>
                <p className="mt-4 leading-7 text-white/60">{category.description}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gold">
                  Ver produtos <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
