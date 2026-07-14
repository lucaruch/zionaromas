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
    name: "Perfumes Árabes",
    slug: "perfumes-arabes",
    image: "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=1000&q=85",
    description: "Fragrâncias intensas com oud, âmbar, especiarias e rastro marcante."
  },
  {
    name: "Oud & Amadeirados",
    slug: "oud-amadeirados",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85",
    description: "Perfumes profundos, elegantes e envolventes para presença sofisticada."
  },
  {
    name: "Florais Orientais",
    slug: "florais-orientais",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1000&q=85",
    description: "Rosas, jasmim, baunilha e almíscar com assinatura árabe refinada."
  },
  {
    name: "Kits Presente",
    slug: "kits-presente",
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1000&q=85",
    description: "Combinações presenteáveis para quem deseja impressionar."
  }
];

export const products: Product[] = [
  {
    id: "sultan-oud",
    name: "Sultan Oud",
    slug: "sultan-oud",
    category: "Perfumes Árabes",
    categorySlug: "perfumes-arabes",
    brand: "ZION AROMAS",
    price: 389.9,
    stock: 24,
    sku: "ZION-OUD-100",
    volume: "100 ml",
    weight: "0,42 kg",
    status: "active",
    image: "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85"
    ],
    shortDescription: "Oud nobre, açafrão e âmbar quente com rastro imponente.",
    description: "Uma fragrância árabe intensa, criada para quem gosta de perfumes marcantes, sofisticados e de alta fixação.",
    richDescription: "A saída especiada abre caminho para um coração de oud e rosa escura. No fundo, âmbar, couro e madeiras deixam uma assinatura envolvente.",
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
    category: "Oud & Amadeirados",
    categorySlug: "oud-amadeirados",
    brand: "ZION AROMAS",
    price: 459.9,
    salePrice: 419.9,
    stock: 18,
    sku: "ZION-AMEER-100",
    volume: "100 ml",
    weight: "0,45 kg",
    status: "active",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1200&q=85"
    ],
    shortDescription: "Madeiras escuras, incenso e baunilha seca para noites especiais.",
    description: "Perfume árabe amadeirado com presença elegante, ideal para eventos, encontros e uso noturno.",
    richDescription: "Combina incenso, madeira de agar e baunilha seca em uma evolução cremosa, sem perder intensidade.",
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
    category: "Florais Orientais",
    categorySlug: "florais-orientais",
    brand: "ZION AROMAS",
    price: 329.9,
    stock: 42,
    sku: "ZION-ROSE-100",
    volume: "100 ml",
    weight: "0,40 kg",
    status: "active",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=85"
    ],
    shortDescription: "Rosa damascena, praline e almíscar branco em assinatura oriental.",
    description: "Um floral árabe elegante, levemente adocicado, com excelente projeção e toque feminino sofisticado.",
    richDescription: "Rosa damascena e jasmim aparecem sobre uma base cremosa de praline, musk e âmbar suave.",
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
    category: "Florais Orientais",
    categorySlug: "florais-orientais",
    brand: "ZION AROMAS",
    price: 289.9,
    salePrice: 259.9,
    stock: 33,
    sku: "ZION-MUSK-100",
    volume: "100 ml",
    weight: "0,40 kg",
    status: "active",
    image: "https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?auto=format&fit=crop&w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=1200&q=85"
    ],
    shortDescription: "Almíscar dourado, flores brancas e âmbar macio.",
    description: "Perfume árabe limpo, elegante e envolvente, perfeito para quem busca sofisticação no dia a dia.",
    richDescription: "A fragrância abre fresca e floral, evoluindo para uma base de musk, âmbar claro e baunilha delicada.",
    featured: true,
    rating: 4.9,
    reviews: 61,
    notes: ["Musk", "Flores brancas", "Âmbar"]
  },
  {
    id: "royal-arabian-set",
    name: "Royal Arabian Set",
    slug: "royal-arabian-set",
    category: "Kits Presente",
    categorySlug: "kits-presente",
    brand: "ZION AROMAS",
    price: 529.9,
    stock: 15,
    sku: "ZION-SET-ROYAL",
    volume: "Kit",
    weight: "1,1 kg",
    status: "active",
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=85"
    ],
    shortDescription: "Kit com fragrâncias árabes selecionadas em embalagem presenteável.",
    description: "Curadoria especial para presentear com perfumes intensos, sofisticados e memoráveis.",
    richDescription: "Acompanha seleção harmonizada, embalagem rígida e apresentação premium para datas especiais.",
    bestSeller: true,
    rating: 4.8,
    reviews: 49,
    notes: ["Presente", "Oud", "Musk"]
  },
  {
    id: "desert-vanilla",
    name: "Desert Vanilla",
    slug: "desert-vanilla",
    category: "Perfumes Árabes",
    categorySlug: "perfumes-arabes",
    brand: "ZION AROMAS",
    price: 299.9,
    stock: 57,
    sku: "ZION-VANILLA-100",
    volume: "100 ml",
    weight: "0,39 kg",
    status: "active",
    image: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=85"
    ],
    shortDescription: "Baunilha oriental, tâmaras e madeiras doces.",
    description: "Um perfume árabe gourmand sofisticado, quente e confortável, sem perder elegância.",
    richDescription: "Notas de baunilha, tâmaras e âmbar se unem a madeiras doces para um rastro envolvente.",
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
    text: "Comprei o kit para presente e a apresentação ficou muito premium.",
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
