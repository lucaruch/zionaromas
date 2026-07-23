import type { MetadataRoute } from "next";
import { getCatalogProducts } from "@/lib/catalog";
import { getPublicSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getPublicSiteUrl();
  const products = await getCatalogProducts();
  const staticRoutes = [
    "",
    "/produtos",
    "/categorias",
    "/promocoes",
    "/novidades",
    "/mais-vendidos",
    "/carrinho",
    "/checkout",
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
