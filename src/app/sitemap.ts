import type { MetadataRoute } from "next";
import { products } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const staticRoutes = [
    "",
    "/produtos",
    "/categorias",
    "/promocoes",
    "/novidades",
    "/mais-vendidos",
    "/carrinho",
    "/checkout",
    "/minha-conta",
    "/pedidos",
    "/favoritos",
    "/contato",
    "/sobre",
    "/politica-de-privacidade",
    "/trocas-e-devolucoes",
    "/termos",
    "/faq"
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7
    })),
    ...products.map((product) => ({
      url: `${siteUrl}/produto/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9
    }))
  ];
}
