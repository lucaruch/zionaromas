"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/commerce/product-card";
import { products } from "@/lib/data";

export default function FavoritesPage() {
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteSlugs(JSON.parse(window.localStorage.getItem("zion-favorites") || "[]"));
  }, []);

  const favorites = products.filter((product) => favoriteSlugs.includes(product.slug));

  return (
    <section className="bg-white pb-20 pt-32">
      <div className="container">
        <h1 className="font-display text-5xl">Favoritos</h1>
        {favorites.length ? (
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {favorites.map((product) => <ProductCard key={product.slug} product={product} />)}
          </div>
        ) : (
          <div className="mt-10 rounded-lg border border-black/10 p-10 text-black/60">Seus favoritos aparecerão aqui.</div>
        )}
      </div>
    </section>
  );
}
