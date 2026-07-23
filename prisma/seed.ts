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
    ["Maison Alhambra", "maison-alhambra"],
    ["Al Wataniah", "al-wataniah"],
    ["Armaf", "armaf"],
    ["Lattafa", "lattafa"],
    ["Orientica", "orientica"],
    ["French Avenue", "french-avenue"],
    ["Afnan", "afnan"],
    ["Zakat", "zakat"]
  ] as const;

  await Promise.all(
    brandSeeds.map(([name, slug]) =>
      prisma.brand.upsert({
        where: { slug },
        update: { name },
        create: { name, slug }
      })
    )
  );

  const categories = await Promise.all(
    brandSeeds.map(([name, slug]) =>
      prisma.category.upsert({
        where: { slug },
        update: { name },
        create: {
          name,
          slug,
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
        enabledMethods: ["PIX", "CARTAO", "BOLETO"]
      }
    },
    create: {
      key: "payments",
      label: "Pagamentos da loja",
      group: "checkout",
      value: {
        activeProvider: "CIELO",
        environment: "HOMOLOGACAO",
        enabledMethods: ["PIX", "CARTAO", "BOLETO"]
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
