"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Search, User } from "lucide-react";
import { useEffect, useState } from "react";
import { CartDrawer } from "@/components/commerce/cart-drawer";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/produtos", label: "Produtos" },
  { href: "/categorias", label: "Categorias" },
  { href: "/promocoes", label: "Promoções" },
  { href: "/novidades", label: "Novidades" },
  { href: "/mais-vendidos", label: "Mais vendidos" }
];

export function SiteHeader() {
  const [solid, setSolid] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed left-0 right-0 top-0 z-40 border-b transition-all duration-300",
          solid
            ? "border-gold/20 bg-black/92 text-white shadow-sm backdrop-blur-xl"
            : "border-white/10 bg-black/45 text-white backdrop-blur-md"
        )}
      >
        <div className="container flex h-20 items-center justify-between gap-4">
          <button className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Abrir menu">
            <Menu className="h-6 w-6" />
          </button>
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/brand/zion-aromas-logo.png"
              alt="ZION AROMAS"
              width={70}
              height={70}
              priority
              className="h-14 w-14 rounded-full object-contain"
            />
            <span className="hidden font-display text-2xl tracking-[0.18em] sm:block">ZION</span>
          </Link>
          <nav className="hidden items-center gap-7 lg:flex">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-medium transition hover:text-gold">
                {item.label}
              </Link>
            ))}
            <div className="group relative py-7">
              <button className="text-sm font-medium transition hover:text-gold">Coleções</button>
              <div className="pointer-events-none absolute left-1/2 top-full grid w-[620px] -translate-x-1/2 translate-y-3 grid-cols-3 gap-4 rounded-lg border border-black/10 bg-white p-5 text-black opacity-0 shadow-premium transition group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                {["Assinaturas Noturnas", "Casa Perfumada", "Presentes Premium"].map((item) => (
                  <Link key={item} href="/produtos" className="rounded-md p-4 hover:bg-pearl">
                    <p className="font-display text-xl">{item}</p>
                    <p className="mt-2 text-sm leading-6 text-black/55">Curadoria elegante com acabamento ZION.</p>
                  </Link>
                ))}
              </div>
            </div>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className={cn(
                "grid h-10 w-10 place-items-center rounded-full border transition",
                solid ? "border-white/15 bg-white/10" : "border-white/20 bg-white/10"
              )}
              aria-label="Buscar"
            >
              <Search className="h-4 w-4" />
            </button>
            <Link
              href="/minha-conta"
              className={cn(
                "hidden h-10 w-10 place-items-center rounded-full border transition sm:grid",
                solid ? "border-white/15 bg-white/10" : "border-white/20 bg-white/10"
              )}
              aria-label="Minha conta"
            >
              <User className="h-4 w-4" />
            </Link>
            <CartDrawer />
          </div>
        </div>
        {mobileOpen ? (
          <nav className="border-t border-black/10 bg-white p-4 text-black lg:hidden">
            <div className="container grid gap-2">
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-md px-3 py-3 hover:bg-pearl" onClick={() => setMobileOpen(false)}>
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        ) : null}
      </header>
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
