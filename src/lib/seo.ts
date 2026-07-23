import type { Metadata } from "next";
import { getPublicSiteUrl } from "@/lib/site-url";

const siteUrl = getPublicSiteUrl();

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ZION AROMAS | Perfumes Árabes Selecionados",
    template: "%s | ZION AROMAS"
  },
  description:
    "Perfumes árabes selecionados de marcas como Lattafa, Maison Alhambra, Armaf, Afnan, Al Wataniah e French Avenue.",
  keywords: ["perfume árabe", "perfumes árabes", "Lattafa", "Maison Alhambra", "Armaf", "Afnan", "oud", "âmbar", "ZION AROMAS"],
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
