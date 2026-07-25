import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { MOCK_PRODUCT_SLUGS } from "../src/lib/mock-products";

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
    { name: "Maison Alhambra", slug: "maison-alhambra", image: "/brands/maison-alhambra-real.png" },
    { name: "Al Wataniah", slug: "al-wataniah", image: "/brands/al-wataniah-real.png" },
    { name: "Armaf", slug: "armaf", image: "/brands/armaf-real.png" },
    { name: "Lattafa", slug: "lattafa", image: "/brands/lattafa-real.png" },
    { name: "Orientica", slug: "orientica", image: "/brands/orientica-real.png" },
    { name: "French Avenue", slug: "french-avenue", image: "/brands/french-avenue-real.png" },
    { name: "Afnan", slug: "afnan", image: "/brands/afnan-real.png" },
    { name: "Zakat", slug: "zakat", image: "/brands/zakat-real.png" }
  ] as const;

  await Promise.all(
    brandSeeds.map(({ name, slug, image }) =>
      prisma.brand.upsert({
        where: { slug },
        update: { name, image },
        create: { name, slug, image }
      })
    )
  );

  const categories = await Promise.all(
    brandSeeds.map(({ name, slug, image }) =>
      prisma.category.upsert({
        where: { slug },
        update: { name, image },
        create: {
          name,
          slug,
          image,
          description: "Marca de perfume árabe disponível na ZION AROMAS."
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

  await prisma.product.deleteMany({
    where: {
      slug: {
        in: MOCK_PRODUCT_SLUGS
      }
    }
  });

  await prisma.category.deleteMany({
    where: { slug: { in: oldCategorySlugs } }
  });

  await prisma.banner.upsert({
    where: { id: "home-hero" },
    update: {
      title: "Perfumes árabes para quem deixa presença",
      subtitle: "Curadoria oriental com oud, âmbar, musk, especiarias e fragrâncias de alta fixação.",
      image: "/brands/lattafa-real.png",
      ctaLabel: "Explorar perfumes",
      ctaHref: "/produtos",
      location: "home",
      active: true
    },
    create: {
      id: "home-hero",
      title: "Perfumes árabes para quem deixa presença",
      subtitle: "Curadoria oriental com oud, âmbar, musk, especiarias e fragrâncias de alta fixação.",
      image: "/brands/lattafa-real.png",
      ctaLabel: "Explorar perfumes",
      ctaHref: "/produtos",
      location: "home",
      active: true
    }
  });

  await prisma.storeSetting.upsert({
    where: { key: "payments" },
    update: {
      label: "Pagamentos da loja",
      group: "checkout",
      value: {
        activeProvider: "CIELO",
        environment: "HOMOLOGACAO",
        enabledMethods: ["PIX", "CARTAO_CREDITO", "CARTAO_DEBITO"]
      }
    },
    create: {
      key: "payments",
      label: "Pagamentos da loja",
      group: "checkout",
      value: {
        activeProvider: "CIELO",
        environment: "HOMOLOGACAO",
        enabledMethods: ["PIX", "CARTAO_CREDITO", "CARTAO_DEBITO"]
      }
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
