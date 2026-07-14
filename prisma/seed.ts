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
      ["Perfumes Autorais", "perfumes-autorais"],
      ["Aromas de Ambiente", "aromas-de-ambiente"],
      ["Velas Premium", "velas-premium"],
      ["Kits Presente", "kits-presente"]
    ].map(([name, slug]) =>
      prisma.category.upsert({
        where: { slug },
        update: {},
        create: { name, slug, description: "Curadoria ZION para experiências olfativas memoráveis." }
      })
    )
  );

  const products = [
    {
      name: "Noir Absolu",
      slug: "noir-absolu",
      price: "389.90",
      salePrice: null,
      sku: "ZION-NOIR-100",
      volume: "100 ml",
      mainImage: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85",
      categoryId: categories[0].id,
      featured: true,
      bestSeller: true,
      isNew: false
    },
    {
      name: "Oud Imperial",
      slug: "oud-imperial",
      price: "459.90",
      salePrice: "419.90",
      sku: "ZION-OUD-100",
      volume: "100 ml",
      mainImage: "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=1200&q=85",
      categoryId: categories[0].id,
      featured: true,
      bestSeller: false,
      isNew: true
    },
    {
      name: "Amber Room Diffuser",
      slug: "amber-room-diffuser",
      price: "249.90",
      salePrice: null,
      sku: "ZION-AMBER-250",
      volume: "250 ml",
      mainImage: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=85",
      categoryId: categories[1].id,
      featured: false,
      bestSeller: true,
      isNew: true
    },
    {
      name: "Golden Ritual Candle",
      slug: "golden-ritual-candle",
      price: "189.90",
      salePrice: "159.90",
      sku: "ZION-CANDLE-180",
      volume: "180 g",
      mainImage: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=85",
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
        shortDescription: "Assinatura olfativa premium com acabamento sofisticado.",
        description: "Uma criação refinada da ZION AROMAS, pensada para presença, memória e elegância.",
        richDescription: "<p>Notas cuidadosamente equilibradas, fixação prolongada e apresentação impecável.</p>",
        gallery: [product.mainImage, product.mainImage],
        seoTitle: `${product.name} | ZION AROMAS`,
        seoDescription: "Perfume premium ZION AROMAS com experiência sensorial exclusiva."
      }
    });
  }

  await prisma.banner.upsert({
    where: { id: "home-hero" },
    update: {},
    create: {
      id: "home-hero",
      title: "Perfumes para quem deixa presença",
      subtitle: "Coleções autorais com matérias-primas nobres, rituais de cuidado e acabamento de alta perfumaria.",
      image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=1800&q=85",
      ctaLabel: "Explorar coleção",
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
