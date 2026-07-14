import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Product } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AddToCart } from "@/components/commerce/add-to-cart";
import { FavoriteButton } from "@/components/commerce/favorite-button";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group relative">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-pearl">
        <Link href={`/produto/${product.slug}`} aria-label={product.name}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        </Link>
        <div className="absolute left-3 top-3 flex gap-2">
          {product.salePrice ? <Badge>Promoção</Badge> : null}
          {product.isNew ? <Badge>Novo</Badge> : null}
        </div>
        <div className="absolute right-3 top-3">
          <FavoriteButton slug={product.slug} />
        </div>
      </div>
      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.18em] text-black/50">{product.category}</p>
          <span className="inline-flex items-center gap-1 text-xs text-black/60">
            <Star className="h-3.5 w-3.5 fill-gold text-gold" />
            {product.rating}
          </span>
        </div>
        <Link href={`/produto/${product.slug}`} className="block">
          <h3 className="font-display text-xl text-black transition group-hover:text-gold-deep">
            {product.name}
          </h3>
        </Link>
        <p className="line-clamp-2 text-sm leading-6 text-black/62">{product.shortDescription}</p>
        <div className="flex items-end justify-between gap-3">
          <div>
            {product.salePrice ? (
              <p className="text-sm text-black/40 line-through">{formatCurrency(product.price)}</p>
            ) : null}
            <p className="text-lg font-semibold text-black">
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
