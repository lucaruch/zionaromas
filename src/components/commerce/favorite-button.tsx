"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function FavoriteButton({ slug }: { slug: string }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(window.localStorage.getItem("zion-favorites") || "[]") as string[];
    setActive(saved.includes(slug));
  }, [slug]);

  function toggle() {
    const saved = JSON.parse(window.localStorage.getItem("zion-favorites") || "[]") as string[];
    const next = active ? saved.filter((item) => item !== slug) : [...saved, slug];
    window.localStorage.setItem("zion-favorites", JSON.stringify(next));
    setActive(!active);
  }

  return (
    <button
      aria-label="Favoritar produto"
      onClick={toggle}
      className="grid h-10 w-10 place-items-center rounded-full border border-gold/25 bg-black/75 text-white shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-gold hover:text-gold"
    >
      <Heart className={cn("h-4 w-4", active && "fill-gold text-gold-deep")} />
    </button>
  );
}
