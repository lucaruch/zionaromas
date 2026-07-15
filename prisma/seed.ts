import { PrismaClient, ProductStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@zionaromas.com" },
    update: {},
    create: {
      name: "Administrador ZION",
      email: "admin@zionaromas.com",
      passwordHash,
      role: "ADMIN"
    }
  });

  const brandSeeds = [
    ["Maison Alhambra", "maison-alhambra"],
    ["Al Wataniah", "al-wataniah"],
    ["Armaf", "armaf"],
    ["Lattafa", "lattafa"],
    ["Orientica", "orientica"],
    ["French Avenue", "french-avenue"],
    ["Afnan", "afnan"],
    ["Zakat", "zakat"]
  ] as const;

  const brands = await Promise.all(
    brandSeeds.map(([name, slug]) =>
      prisma.brand.upsert({
        where: { slug },
        update: { name },
        create: { name, slug }
      })
    )
  );

  const brandBySlug = new Map(brands.map((brand) => [brand.slug, brand]));

  const categories = await Promise.all(
    brandSeeds.map(([name, slug]) =>
      prisma.category.upsert({
        where: { slug },
        update: { name },
        create: {
          name,
          slug,
          description: "Marca de perfume arabe disponivel na ZION AROMAS."
        }
      })
    )
  );

  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));
  const oldCategorySlugs = ["perfumes-arabes", "oud-amadeirados", "florais-orientais", "kits-presente"];
  const fallbackCategory = categoryBySlug.get("maison-alhambra")!;

  for (const slug of oldCategorySlugs) {
    const oldCategory = await prisma.category.findUnique({ where: { slug } });
    if (oldCategory) {
      await prisma.product.updateMany({
        where: { categoryId: oldCategory.id },
        data: { categoryId: fallbackCategory.id }
      });
    }
  }

  const products = [
    {
      name: "Sultan Oud",
      slug: "sultan-oud",
      price: "389.90",
      salePrice: null,
      sku: "ZION-OUD-100",
      volume: "100 ml",
      mainImage: "/brands/maison-alhambra-real.png",
      categoryId: categoryBySlug.get("maison-alhambra")!.id,
      brandId: brandBySlug.get("maison-alhambra")!.id,
      featured: true,
      bestSeller: true,
      isNew: false
    },
    {
      name: "Ameer Al Layl",
      slug: "ameer-al-layl",
      price: "459.90",
      salePrice: "419.90",
      sku: "ZION-AMEER-100",
      volume: "100 ml",
      mainImage: "/brands/lattafa-real.png",
      categoryId: categoryBySlug.get("lattafa")!.id,
      brandId: brandBySlug.get("lattafa")!.id,
      featured: true,
      bestSeller: false,
      isNew: true
    },
    {
      name: "Rose Dubai",
      slug: "rose-dubai",
      price: "329.90",
      salePrice: null,
      sku: "ZION-ROSE-100",
      volume: "100 ml",
      mainImage: "/brands/armaf-real.png",
      categoryId: categoryBySlug.get("armaf")!.id,
      brandId: brandBySlug.get("armaf")!.id,
      featured: false,
      bestSeller: true,
      isNew: true
    },
    {
      name: "Golden Musk",
      slug: "golden-musk",
      price: "289.90",
      salePrice: "259.90",
      sku: "ZION-MUSK-100",
      volume: "100 ml",
      mainImage: "/brands/afnan-real.png",
      categoryId: categoryBySlug.get("afnan")!.id,
      brandId: brandBySlug.get("afnan")!.id,
      featured: true,
      bestSeller: false,
      isNew: false
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        ...product,
        status: ProductStatus.ACTIVE,
        stock: 24,
        shortDescription: "Perfume arabe com alta fixacao e presenca sofisticada.",
        description: "Perfume arabe selecionado pela ZION AROMAS para quem busca rastro marcante e elegancia.",
        richDescription: "<p>Perfume arabe com excelente projecao e embalagem cuidadosamente preparada.</p>",
        gallery: [product.mainImage, product.mainImage],
        seoTitle: `${product.name} | ZION AROMAS`,
        seoDescription: "Perfume arabe ZION AROMAS com oud, ambar, musk e especiarias."
      },
      create: {
        ...product,
        status: ProductStatus.ACTIVE,
        stock: 24,
        shortDescription: "Perfume arabe com alta fixacao e presenca sofisticada.",
        description: "Perfume arabe selecionado pela ZION AROMAS para quem busca rastro marcante e elegancia.",
        richDescription: "<p>Perfume arabe com excelente projecao e embalagem cuidadosamente preparada.</p>",
        gallery: [product.mainImage, product.mainImage],
        seoTitle: `${product.name} | ZION AROMAS`,
        seoDescription: "Perfume arabe ZION AROMAS com oud, ambar, musk e especiarias."
      }
    });
  }

  await prisma.category.deleteMany({
    where: { slug: { in: oldCategorySlugs } }
  });

  await prisma.banner.upsert({
    where: { id: "home-hero" },
    update: {
      title: "Perfumes arabes para quem deixa presenca",
      subtitle: "Curadoria oriental com oud, ambar, musk, especiarias e fragrancias de alta fixacao.",
      image: "/brands/lattafa-real.png",
      ctaLabel: "Explorar perfumes",
      ctaHref: "/produtos",
      location: "home",
      active: true
    },
    create: {
      id: "home-hero",
      title: "Perfumes arabes para quem deixa presenca",
      subtitle: "Curadoria oriental com oud, ambar, musk, especiarias e fragrancias de alta fixacao.",
      image: "/brands/lattafa-real.png",
      ctaLabel: "Explorar perfumes",
      ctaHref: "/produtos",
      location: "home",
      active: true
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
