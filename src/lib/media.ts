const brandFallbacks: Record<string, string> = {
  "maison-alhambra": "/brands/maison-alhambra-real.png",
  "al-wataniah": "/brands/al-wataniah-real.png",
  armaf: "/brands/armaf-real.png",
  lattafa: "/brands/lattafa-real.png",
  orientica: "/brands/orientica-real.png",
  "french-avenue": "/brands/french-avenue-real.png",
  afnan: "/brands/afnan-real.png",
  zakat: "/brands/zakat-real.png"
};

const defaultFallback = "/brand/zion-aromas-logo.png";

export function sanitizeImageSource(source: string | null | undefined) {
  return (source || "").trim().replace(/\\/g, "");
}

export function fallbackProductImage(brandSlug?: string | null, categorySlug?: string | null) {
  if (brandSlug && brandFallbacks[brandSlug]) return brandFallbacks[brandSlug];
  if (categorySlug && brandFallbacks[categorySlug]) return brandFallbacks[categorySlug];
  return defaultFallback;
}

export function resolveProductImage(source: string | null | undefined, brandSlug?: string | null, categorySlug?: string | null) {
  const cleanSource = sanitizeImageSource(source);
  if (!cleanSource) return fallbackProductImage(brandSlug, categorySlug);
  if (cleanSource.startsWith("/uploads/")) return fallbackProductImage(brandSlug, categorySlug);
  return cleanSource;
}
