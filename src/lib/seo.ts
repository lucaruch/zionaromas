import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ZION AROMAS | Perfumaria Premium",
    template: "%s | ZION AROMAS"
  },
  description:
    "Loja premium de perfumes autorais, aromas de ambiente, velas e kits sofisticados.",
  keywords: ["perfume premium", "ZION AROMAS", "aromas de luxo", "velas premium", "difusor"],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "ZION AROMAS",
    images: ["/brand/zion-aromas-logo.png"]
  },
  twitter: {
    card: "summary_large_image"
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: "/brand/zion-aromas-logo.png",
    apple: "/brand/zion-aromas-logo.png"
  }
};

export function productJsonLd(product: {
  name: string;
  description: string;
  image: string;
  sku: string;
  price: number;
  slug: string;
  rating: number;
  reviews: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    brand: { "@type": "Brand", name: "ZION AROMAS" },
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: product.price,
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/produto/${product.slug}`
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviews
    }
  };
}
