import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { categories } from "@/lib/data";

export const metadata: Metadata = { title: "Categorias" };

export default function CategoriesPage() {
  return (
    <section className="bg-white pb-20 pt-32">
      <div className="container">
        <Badge>Categorias</Badge>
        <h1 className="mt-4 font-display text-5xl">Coleções por ritual</h1>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {categories.map((category) => (
            <Link key={category.slug} href={`/produtos?categoria=${category.slug}`} className="group grid overflow-hidden rounded-lg border border-black/10 md:grid-cols-[0.95fr_1.05fr]">
              <div className="relative min-h-72 bg-black">
                <Image src={category.image} alt={category.name} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover opacity-82 transition duration-700 group-hover:scale-105" />
              </div>
              <div className="flex flex-col justify-center p-8">
                <h2 className="font-display text-3xl">{category.name}</h2>
                <p className="mt-4 leading-7 text-black/60">{category.description}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gold-deep">
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
