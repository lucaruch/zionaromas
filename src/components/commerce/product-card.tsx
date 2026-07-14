import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Product } from "@/lib/data";
import { formatCurrency, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AddToCart } from "@/components/commerce/add-to-cart";
import { FavoriteButton } from "@/components/commerce/favorite-button";

export function ProductCard({ product, dark = false }: { product: Product; dark?: boolean }) {
  return (
    <article
      className={cn(
        "group relative transition duration-300",
        dark
          ? "border border-gold/20 bg-white/[0.035] p-3 shadow-[0_24px_70px_rgba(0,0,0,.32)] hover:border-gold/55"
          : "hover:-translate-y-1"
      )}
    >
      <div className={cn("relative aspect-[4/5] overflow-hidden bg-pearl", dark ? "rounded-sm bg-black" : "rounded-lg")}>
        <Link href={`/produto/${product.slug}`} aria-label={product.name}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={cn(
              "object-cover transition duration-700 group-hover:scale-105",
              dark ? "opacity-[.88] group-hover:opacity-[.72]" : ""
            )}
          />
        </Link>
        {dark ? <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/58 via-transparent to-transparent" /> : null}
        <div className="absolute left-3 top-3 flex gap-2">
          {product.salePrice ? <Badge>Promoção</Badge> : null}
          {product.isNew ? <Badge>Novo</Badge> : null}
        </div>
        <div className="absolute right-3 top-3">
          <FavoriteButton slug={product.slug} />
        </div>
      </div>
      <div className={cn("mt-5 space-y-3", dark ? "px-1 pb-1" : "")}>
        <div className="flex items-center justify-between gap-3">
          <p className={cn("text-xs uppercase tracking-[0.18em]", dark ? "text-gold/70" : "text-black/50")}>{product.category}</p>
          <span className={cn("inline-flex items-center gap-1 text-xs", dark ? "text-white/68" : "text-black/60")}>
            <Star className="h-3.5 w-3.5 fill-gold text-gold" />
            {product.rating}
          </span>
        </div>
        <Link href={`/produto/${product.slug}`} className="block">
          <h3 className={cn("font-display text-xl transition", dark ? "text-white group-hover:text-gold" : "text-black group-hover:text-gold-deep")}>
            {product.name}
          </h3>
        </Link>
        <p className={cn("line-clamp-2 text-sm leading-6", dark ? "text-white/55" : "text-black/62")}>{product.shortDescription}</p>
        <div className="flex items-end justify-between gap-3">
          <div>
            {product.salePrice ? (
              <p className={cn("text-sm line-through", dark ? "text-white/35" : "text-black/40")}>{formatCurrency(product.price)}</p>
            ) : null}
            <p className={cn("text-lg font-semibold", dark ? "text-white" : "text-black")}>
              {formatCurrency(product.salePrice ?? product.price)}
            </p>
          </div>
          <span className="text-xs uppercase tracking-[0.16em] text-gold-deep">{product.volume}</span>
        </div>
        <AddToCart product={product} label="Comprar" />
      </div>
    </article>
  );
}
