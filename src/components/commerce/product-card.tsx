import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { AddToCart } from "@/components/commerce/add-to-cart";
import { FavoriteButton } from "@/components/commerce/favorite-button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/data";
import { cn, formatCurrency } from "@/lib/utils";

export function ProductCard({ product, dark = false }: { product: Product; dark?: boolean }) {
  return (
    <article
      className={cn(
        "group relative min-w-0 transition duration-300",
        dark
          ? "border border-gold/20 bg-white/[0.035] p-3 shadow-[0_24px_70px_rgba(0,0,0,.32)] hover:border-gold/55"
          : "hover:-translate-y-1"
      )}
    >
      <div className={cn("relative aspect-[4/5] overflow-hidden bg-pearl", dark ? "rounded-sm bg-black" : "rounded-lg")}>
        <Link href={`/produto/${product.slug}`} aria-label={product.name} className="absolute inset-0 block">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover transition duration-700 group-hover:scale-105",
              dark ? "opacity-[.88] group-hover:opacity-[.72]" : ""
            )}
          />
        </Link>
        {dark ? <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/58 via-transparent to-transparent" /> : null}
        <div className="absolute left-2 top-2 flex max-w-[calc(100%-3.5rem)] flex-wrap gap-1.5 sm:left-3 sm:top-3 sm:gap-2">
          {product.salePrice ? <Badge>Promoção</Badge> : null}
          {product.isNew ? <Badge>Novo</Badge> : null}
        </div>
        <div className="absolute right-2 top-2 sm:right-3 sm:top-3">
          <FavoriteButton slug={product.slug} />
        </div>
      </div>
      <div className={cn("mt-4 space-y-3 sm:mt-5", dark ? "px-1 pb-1" : "")}>
        <div className="flex min-w-0 items-center justify-between gap-3">
          <p className={cn("min-w-0 truncate text-[10px] uppercase tracking-[0.14em] sm:text-xs sm:tracking-[0.18em]", dark ? "text-gold/70" : "text-black/50")}>
            {product.category}
          </p>
          <span className={cn("inline-flex shrink-0 items-center gap-1 text-xs", dark ? "text-white/68" : "text-black/60")}>
            <Star className="h-3.5 w-3.5 fill-gold text-gold" />
            {product.rating}
          </span>
        </div>
        <Link href={`/produto/${product.slug}`} className="block">
          <h3 className={cn("line-clamp-2 font-display text-lg leading-tight transition sm:text-xl", dark ? "text-white group-hover:text-gold" : "text-black group-hover:text-gold-deep")}>
            {product.name}
          </h3>
        </Link>
        <p className={cn("line-clamp-2 text-sm leading-6", dark ? "text-white/55" : "text-black/62")}>{product.shortDescription}</p>
        <div className="flex min-w-0 items-end justify-between gap-3">
          <div className="min-w-0">
            {product.salePrice ? (
              <p className={cn("text-sm line-through", dark ? "text-white/35" : "text-black/40")}>{formatCurrency(product.price)}</p>
            ) : null}
            <p className={cn("text-base font-semibold sm:text-lg", dark ? "text-white" : "text-black")}>
              {formatCurrency(product.salePrice ?? product.price)}
            </p>
          </div>
          <span className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-gold-deep sm:text-xs sm:tracking-[0.16em]">{product.volume}</span>
        </div>
        <AddToCart product={product} label="Comprar" />
      </div>
    </article>
  );
}
