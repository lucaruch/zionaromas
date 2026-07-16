import { prisma } from "@/lib/prisma";
import type { Product } from "@/lib/data";
import type { Brand, Category, Product as PrismaProduct } from "@prisma/client";
import { MOCK_PRODUCT_SLUGS } from "@/lib/mock-products";

export type CatalogCategory = {
  name: string;
  slug: string;
  image: string;
  description: string;
};

function toNumber(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function productNotes(description: string) {
  const source = description.toLowerCase();
  const notes = [
    source.includes("oud") ? "Oud" : null,
    source.includes("âmbar") || source.includes("ambar") ? "Âmbar" : null,
    source.includes("musk") || source.includes("almíscar") || source.includes("almiscar") ? "Musk" : null
  ].filter(Boolean) as string[];

  return notes.length ? notes : ["Perfume árabe", "Alta fixação", "Assinatura marcante"];
}

type CatalogProductRecord = PrismaProduct & {
  brand: Brand;
  category: Category;
};

function mapProduct(product: CatalogProductRecord): Product {
  const gallery = Array.isArray(product.gallery) ? (product.gallery as string[]) : [product.mainImage];
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category.name,
    categorySlug: product.category.slug,
    brand: product.brand.name,
    price: toNumber(product.price),
    salePrice: product.salePrice ? toNumber(product.salePrice) : undefined,
    stock: product.stock,
    sku: product.sku,
    volume: product.volume || "100 ml",
    weight: `${product.weight?.toString() || "1.00"} kg`,
    status: product.status === "ACTIVE" ? "active" : "draft",
    image: product.mainImage,
    gallery: gallery.length ? gallery : [product.mainImage],
    shortDescription: product.shortDescription,
    description: product.description,
    richDescription: product.richDescription,
    featured: product.featured,
    bestSeller: product.bestSeller,
    isNew: product.isNew,
    rating: 5,
    reviews: 0,
    notes: productNotes(`${product.shortDescription} ${product.description}`)
  };
}

export async function getCatalogProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE", slug: { notIn: MOCK_PRODUCT_SLUGS } },
      orderBy: { updatedAt: "desc" },
      include: { brand: true, category: true }
    });
    return products.map(mapProduct);
  } catch {
    return [];
  }
}

export async function getCatalogProduct(slug: string) {
  try {
    const product = await prisma.product.findFirst({
      where: { status: "ACTIVE", slug: { equals: slug, notIn: MOCK_PRODUCT_SLUGS } },
      include: { brand: true, category: true }
    });
    return product ? mapProduct(product) : null;
  } catch {
    return null;
  }
}

export async function getCatalogCategories(): Promise<CatalogCategory[]> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } }
    });
    return categories
      .filter((category) => category._count.products > 0)
      .map((category) => ({
        name: category.name,
        slug: category.slug,
        image: category.image || `/brands/${category.slug}-real.png`,
        description: category.description || "Marca de perfume árabe disponível na ZION AROMAS."
      }));
  } catch {
    return [];
  }
}
