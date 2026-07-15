"use client";

import Image from "next/image";
import { useState } from "react";
import { Search } from "lucide-react";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [selected, setSelected] = useState(images[0]);

  return (
    <div className="grid min-w-0 gap-4 md:grid-cols-[88px_minmax(0,1fr)]">
      <div className="order-2 flex gap-3 overflow-x-auto pb-1 md:order-1 md:flex-col md:overflow-visible md:pb-0">
        {images.map((image) => (
          <button
            key={image}
            onClick={() => setSelected(image)}
            className="relative h-20 w-20 shrink-0 overflow-hidden border border-gold/20 bg-black transition hover:border-gold"
          >
            <Image src={image} alt={name} fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
      <div className="group relative order-1 aspect-[4/5] min-w-0 overflow-hidden border border-gold/20 bg-black md:order-2">
        <Image
          src={selected}
          alt={name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition duration-700 group-hover:scale-110"
        />
        <div className="absolute bottom-4 left-4 right-4 inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs text-white backdrop-blur sm:right-auto">
          <Search className="h-3.5 w-3.5" />
          Passe o mouse para zoom
        </div>
      </div>
    </div>
  );
}
