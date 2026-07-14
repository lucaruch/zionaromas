"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { products } from "@/lib/data";
import { Input } from "@/components/ui/input";

export function SearchOverlay({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const value = query.toLowerCase().trim();
    if (!value) return products.slice(0, 4);
    return products.filter((product) =>
      [product.name, product.category, product.shortDescription, product.sku].join(" ").toLowerCase().includes(value)
    );
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 p-4 backdrop-blur-sm">
      <div className="mx-auto mt-20 max-w-2xl border border-gold/20 bg-black/95 p-5 text-white shadow-[0_28px_90px_rgba(0,0,0,.65)]">
        <div className="mb-5 flex items-center gap-3">
          <Search className="h-5 w-5 text-gold-deep" />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por perfume, categoria ou SKU"
            className="border-gold/20 bg-white/[0.04]"
          />
          <button onClick={() => onOpenChange(false)} className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-gold">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-2">
          {results.map((product) => (
            <Link
              key={product.slug}
              href={`/produto/${product.slug}`}
              onClick={() => onOpenChange(false)}
              className="flex items-center justify-between border border-transparent px-4 py-3 transition hover:border-gold/25 hover:bg-white/[0.04]"
            >
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-white/45">{product.category}</p>
              </div>
              <span className="text-xs uppercase tracking-[0.16em] text-gold-deep">{product.volume}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
