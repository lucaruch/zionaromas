"use client";

import Image from "next/image";
import { useState } from "react";
import { fallbackProductImage, sanitizeImageSource } from "@/lib/media";

type ProductImageProps = {
  src: string;
  alt: string;
  brandSlug?: string;
  categorySlug?: string;
  className?: string;
  sizes: string;
  priority?: boolean;
};

export function ProductImage({ src, alt, brandSlug, categorySlug, className, sizes, priority = false }: ProductImageProps) {
  const fallback = fallbackProductImage(brandSlug, categorySlug);
  const initialSource = sanitizeImageSource(src);
  const [source, setSource] = useState(initialSource.startsWith("/uploads/") ? fallback : initialSource || fallback);

  return (
    <Image
      src={source}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
      onError={() => {
        if (source !== fallback) setSource(fallback);
      }}
    />
  );
}
