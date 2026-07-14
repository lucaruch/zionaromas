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
    <div className="fixed inset-0 z-50 bg-black/55 p-4 backdrop-blur-sm">
      <div className="mx-auto mt-20 max-w-2xl rounded-lg bg-white p-5 shadow-premium">
        <div className="mb-5 flex items-center gap-3">
          <Search className="h-5 w-5 text-gold-deep" />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por perfume, categoria ou SKU"
            className="border-0 bg-pearl"
          />
          <button onClick={() => onOpenChange(false)} className="rounded-full p-2 hover:bg-black/5">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-2">
          {results.map((product) => (
            <Link
              key={product.slug}
              href={`/produto/${product.slug}`}
              onClick={() => onOpenChange(false)}
              className="flex items-center justify-between rounded-md px-4 py-3 transition hover:bg-pearl"
            >
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-black/50">{product.category}</p>
              </div>
              <span className="text-xs uppercase tracking-[0.16em] text-gold-deep">{product.volume}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
