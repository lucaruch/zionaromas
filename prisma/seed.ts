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

  const brand = await prisma.brand.upsert({
    where: { slug: "zion-aromas" },
    update: {},
    create: { name: "ZION AROMAS", slug: "zion-aromas" }
  });

  const categories = await Promise.all(
    [
      ["Perfumes Árabes", "perfumes-arabes"],
      ["Oud & Amadeirados", "oud-amadeirados"],
      ["Florais Orientais", "florais-orientais"],
      ["Kits Presente", "kits-presente"]
    ].map(([name, slug]) =>
      prisma.category.upsert({
        where: { slug },
        update: {},
        create: { name, slug, description: "Curadoria ZION de perfumes árabes e fragrâncias orientais." }
      })
    )
  );

  const products = [
    {
      name: "Sultan Oud",
      slug: "sultan-oud",
      price: "389.90",
      salePrice: null,
      sku: "ZION-OUD-100",
      volume: "100 ml",
      mainImage: "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=1200&q=85",
      categoryId: categories[0].id,
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
      mainImage: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85",
      categoryId: categories[1].id,
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
      mainImage: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=85",
      categoryId: categories[2].id,
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
      mainImage: "https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?auto=format&fit=crop&w=1200&q=85",
      categoryId: categories[2].id,
      featured: true,
      bestSeller: false,
      isNew: false
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product,
        brandId: brand.id,
        status: ProductStatus.ACTIVE,
        stock: 24,
        shortDescription: "Perfume árabe premium com alta fixação e presença sofisticada.",
        description: "Fragrância oriental selecionada pela ZION AROMAS para quem busca rastro marcante e elegância.",
        richDescription: "<p>Notas orientais, acabamento premium, excelente projeção e embalagem cuidadosamente preparada.</p>",
        gallery: [product.mainImage, product.mainImage],
        seoTitle: `${product.name} | ZION AROMAS`,
        seoDescription: "Perfume árabe premium ZION AROMAS com oud, âmbar, musk e especiarias."
      }
    });
  }

  await prisma.banner.upsert({
    where: { id: "home-hero" },
    update: {},
    create: {
      id: "home-hero",
      title: "Perfumes árabes para quem deixa presença",
      subtitle: "Curadoria oriental com oud, âmbar, musk, especiarias e fragrâncias de alta fixação.",
      image: "https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?auto=format&fit=crop&w=1800&q=85",
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
