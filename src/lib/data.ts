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
    image: "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=1000&q=85",
    description: "Fragrâncias orientais com presença sofisticada, ótimas para quem busca impacto e elegância."
  },
  {
    name: "Al Wataniah",
    slug: "al-wataniah",
    image: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=1000&q=85",
    description: "Perfumes envolventes, versáteis e marcantes para usar com personalidade."
  },
  {
    name: "Armaf",
    slug: "armaf",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1000&q=85",
    description: "Criações modernas com alto desempenho e perfis olfativos fáceis de amar."
  },
  {
    name: "Lattafa",
    slug: "lattafa",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85",
    description: "Assinaturas árabes envolventes, com notas quentes, especiadas e memoráveis."
  },
  {
    name: "Orientica",
    slug: "orientica",
    image: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=1000&q=85",
    description: "Perfumes orientais com apresentação refinada e presença de alto padrão."
  },
  {
    name: "French Avenue",
    slug: "french-avenue",
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1000&q=85",
    description: "Fragrâncias com inspiração contemporânea, bom desempenho e acabamento elegante."
  },
  {
    name: "Afnan",
    slug: "afnan",
    image: "https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?auto=format&fit=crop&w=1000&q=85",
    description: "Perfumes conhecidos pela projeção, fixação e assinatura olfativa marcante."
  },
  {
    name: "Zakat",
    slug: "zakat",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1000&q=85",
    description: "Opções orientais escolhidas para quem procura intensidade, estilo e bom valor."
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
    image: "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85"
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
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1200&q=85"
    ],
    shortDescription: "Madeiras escuras, incenso e baunilha seca para ocasiões especiais.",
    description: "Um amadeirado oriental elegante, ideal para eventos, encontros e momentos em que a fragrância precisa acompanhar a presença.",
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
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=85"
    ],
    shortDescription: "Rosa damascena, praline e almíscar branco em assinatura sofisticada.",
    description: "Um floral oriental elegante, levemente adocicado, com projeção equilibrada e toque feminino refinado.",
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
    image: "https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?auto=format&fit=crop&w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=1200&q=85"
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
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=85"
    ],
    shortDescription: "Seleção presenteável com fragrâncias árabes de perfis complementares.",
    description: "Uma opção elegante para presentear com perfumes marcantes, bem apresentados e fáceis de encantar.",
    richDescription: "Reúne fragrâncias harmonizadas em uma apresentação elegante, pensada para datas especiais e presentes de impacto.",
    bestSeller: true,
    rating: 4.8,
    reviews: 49,
    notes: ["Presente", "Oud", "Musk"]
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
    image: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=85"
    ],
    shortDescription: "Baunilha oriental, tâmaras e madeiras doces em uma assinatura quente.",
    description: "Um gourmand oriental confortável, sofisticado e envolvente, sem perder elegância.",
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
    text: "Comprei o kit para presente e a apresentação veio impecável.",
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
