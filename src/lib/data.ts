export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  brand: string;
  price: number;
  salePrice?: number;
  stock: number;
  sku: string;
  volume: string;
  weight: string;
  status: "active" | "draft";
  image: string;
  gallery: string[];
  shortDescription: string;
  description: string;
  richDescription: string;
  featured?: boolean;
  bestSeller?: boolean;
  isNew?: boolean;
  rating: number;
  reviews: number;
  notes: string[];
};

export const categories = [
  {
    name: "Maison Alhambra",
    slug: "maison-alhambra",
    image: "/brands/maison-alhambra-real.png",
    description: "Perfumes árabes com presença sofisticada, ótimos para quem busca impacto e elegância."
  },
  {
    name: "Al Wataniah",
    slug: "al-wataniah",
    image: "/brands/al-wataniah-real.png",
    description: "Perfumes envolventes, versáteis e marcantes para usar com personalidade."
  },
  {
    name: "Armaf",
    slug: "armaf",
    image: "/brands/armaf-real.png",
    description: "Perfumes árabes modernos, com alto desempenho e perfis fáceis de amar."
  },
  {
    name: "Lattafa",
    slug: "lattafa",
    image: "/brands/lattafa-real.png",
    description: "Assinaturas árabes envolventes, com notas quentes, especiadas e memoráveis."
  },
  {
    name: "Orientica",
    slug: "orientica",
    image: "/brands/orientica-real.png",
    description: "Perfumes árabes com apresentação refinada e presença de alto padrão."
  },
  {
    name: "French Avenue",
    slug: "french-avenue",
    image: "/brands/french-avenue-real.png",
    description: "Fragrâncias com inspiração contemporânea, bom desempenho e acabamento elegante."
  },
  {
    name: "Afnan",
    slug: "afnan",
    image: "/brands/afnan-real.png",
    description: "Perfumes árabes conhecidos por projeção, fixação e assinatura marcante."
  },
  {
    name: "Zakat",
    slug: "zakat",
    image: "/brands/zakat-real.png",
    description: "Perfumes árabes escolhidos para quem procura intensidade, estilo e bom valor."
  }
];

export const products: Product[] = [
  {
    id: "sultan-oud",
    name: "Sultan Oud",
    slug: "sultan-oud",
    category: "Maison Alhambra",
    categorySlug: "maison-alhambra",
    brand: "Maison Alhambra",
    price: 389.9,
    stock: 24,
    sku: "MA-OUD-100",
    volume: "100 ml",
    weight: "0,42 kg",
    status: "active",
    image: "/products/sultan-oud.png",
    gallery: [
      "/products/sultan-oud.png",
      "/brands/maison-alhambra-real.png",
      "/brands/lattafa-real.png"
    ],
    shortDescription: "Oud nobre, açafrão e âmbar quente em uma assinatura imponente.",
    description: "Uma fragrância intensa para quem gosta de presença marcante, acabamento sofisticado e alta fixação.",
    richDescription: "A abertura especiada revela um coração de oud e rosa escura. No fundo, âmbar, couro e madeiras criam um rastro envolvente e elegante.",
    featured: true,
    bestSeller: true,
    rating: 4.9,
    reviews: 128,
    notes: ["Oud", "Açafrão", "Âmbar"]
  },
  {
    id: "ameer-al-layl",
    name: "Ameer Al Layl",
    slug: "ameer-al-layl",
    category: "Lattafa",
    categorySlug: "lattafa",
    brand: "Lattafa",
    price: 459.9,
    salePrice: 419.9,
    stock: 18,
    sku: "LAT-AMEER-100",
    volume: "100 ml",
    weight: "0,45 kg",
    status: "active",
    image: "/products/ameer-al-layl.png",
    gallery: [
      "/products/ameer-al-layl.png",
      "/brands/lattafa-real.png"
    ],
    shortDescription: "Madeiras escuras, incenso e baunilha seca para ocasiões especiais.",
    description: "Um perfume árabe amadeirado e elegante, ideal para momentos em que a fragrância precisa acompanhar a presença.",
    richDescription: "Incenso, madeira de agar e baunilha seca evoluem de forma cremosa, mantendo intensidade sem perder refinamento.",
    featured: true,
    isNew: true,
    rating: 4.8,
    reviews: 94,
    notes: ["Incenso", "Madeira de agar", "Baunilha"]
  },
  {
    id: "rose-dubai",
    name: "Rose Dubai",
    slug: "rose-dubai",
    category: "Armaf",
    categorySlug: "armaf",
    brand: "Armaf",
    price: 329.9,
    stock: 42,
    sku: "ARM-ROSE-100",
    volume: "100 ml",
    weight: "0,40 kg",
    status: "active",
    image: "/products/rose-dubai.png",
    gallery: [
      "/products/rose-dubai.png",
      "/brands/armaf-real.png"
    ],
    shortDescription: "Rosa damascena, praline e almíscar branco em assinatura sofisticada.",
    description: "Um perfume árabe floral, elegante e levemente adocicado, com projeção equilibrada e toque feminino refinado.",
    richDescription: "Rosa damascena e jasmim se apoiam em uma base cremosa de praline, musk e âmbar suave.",
    bestSeller: true,
    isNew: true,
    rating: 4.7,
    reviews: 76,
    notes: ["Rosa damascena", "Praline", "Almíscar"]
  },
  {
    id: "golden-musk",
    name: "Golden Musk",
    slug: "golden-musk",
    category: "Afnan",
    categorySlug: "afnan",
    brand: "Afnan",
    price: 289.9,
    salePrice: 259.9,
    stock: 33,
    sku: "AFN-MUSK-100",
    volume: "100 ml",
    weight: "0,40 kg",
    status: "active",
    image: "/products/golden-musk.png",
    gallery: [
      "/products/golden-musk.png",
      "/brands/afnan-real.png"
    ],
    shortDescription: "Almíscar dourado, flores brancas e âmbar macio.",
    description: "Uma fragrância limpa, elegante e envolvente para quem busca sofisticação discreta no dia a dia.",
    richDescription: "A saída fresca e floral evolui para uma base de musk, âmbar claro e baunilha delicada.",
    featured: true,
    rating: 4.9,
    reviews: 61,
    notes: ["Musk", "Flores brancas", "Âmbar"]
  },
  {
    id: "royal-arabian-set",
    name: "Royal Arabian Set",
    slug: "royal-arabian-set",
    category: "French Avenue",
    categorySlug: "french-avenue",
    brand: "French Avenue",
    price: 529.9,
    stock: 15,
    sku: "FA-SET-ROYAL",
    volume: "Kit",
    weight: "1,1 kg",
    status: "active",
    image: "/products/royal-arabian-set.png",
    gallery: [
      "/products/royal-arabian-set.png",
      "/brands/french-avenue-real.png"
    ],
    shortDescription: "Seleção de perfumes árabes com perfis complementares.",
    description: "Uma composição elegante de perfumes árabes marcantes, bem apresentados e fáceis de encantar.",
    richDescription: "Reúne fragrâncias árabes harmonizadas em uma apresentação elegante, pensada para quem deseja conhecer mais de uma assinatura ZION.",
    bestSeller: true,
    rating: 4.8,
    reviews: 49,
    notes: ["Perfumes árabes", "Oud", "Musk"]
  },
  {
    id: "desert-vanilla",
    name: "Desert Vanilla",
    slug: "desert-vanilla",
    category: "Al Wataniah",
    categorySlug: "al-wataniah",
    brand: "Al Wataniah",
    price: 299.9,
    stock: 57,
    sku: "AW-VANILLA-100",
    volume: "100 ml",
    weight: "0,39 kg",
    status: "active",
    image: "/products/desert-vanilla.png",
    gallery: [
      "/products/desert-vanilla.png",
      "/brands/al-wataniah-real.png"
    ],
    shortDescription: "Baunilha árabe, tâmaras e madeiras doces em uma assinatura quente.",
    description: "Um perfume árabe gourmand, confortável, sofisticado e envolvente, sem perder elegância.",
    richDescription: "Baunilha, tâmaras e âmbar se unem a madeiras doces para criar um rastro acolhedor e memorável.",
    isNew: true,
    rating: 4.6,
    reviews: 37,
    notes: ["Baunilha", "Tâmaras", "Madeiras doces"]
  }
];

export const testimonials = [
  {
    name: "Marina L.",
    text: "O perfume fixa muito e tem aquele rastro árabe elegante que chama atenção sem exagerar.",
    role: "Cliente ZION"
  },
  {
    name: "Rafael C.",
    text: "Comprei uma seleção de perfumes árabes e a apresentação veio impecável.",
    role: "Cliente ZION"
  },
  {
    name: "Bianca A.",
    text: "Rose Dubai é marcante, doce na medida e muito sofisticado.",
    role: "Cliente ZION"
  }
];

export const orderStatuses = ["Recebido", "Pago", "Separação", "Enviado", "Entregue", "Cancelado"];

export function findProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
