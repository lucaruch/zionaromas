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
    name: "Perfumes Autorais",
    slug: "perfumes-autorais",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85",
    description: "Assinaturas olfativas com intensidade, fixação e presença."
  },
  {
    name: "Aromas de Ambiente",
    slug: "aromas-de-ambiente",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1000&q=85",
    description: "Difusores e sprays para transformar espaços em rituais."
  },
  {
    name: "Velas Premium",
    slug: "velas-premium",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1000&q=85",
    description: "Cera nobre, pavio elegante e fragrâncias envolventes."
  },
  {
    name: "Kits Presente",
    slug: "kits-presente",
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1000&q=85",
    description: "Composições sofisticadas para datas especiais."
  }
];

export const products: Product[] = [
  {
    id: "noir-absolu",
    name: "Noir Absolu",
    slug: "noir-absolu",
    category: "Perfumes Autorais",
    categorySlug: "perfumes-autorais",
    brand: "ZION AROMAS",
    price: 389.9,
    stock: 24,
    sku: "ZION-NOIR-100",
    volume: "100 ml",
    weight: "0,42 kg",
    status: "active",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1200&q=85"
    ],
    shortDescription: "Âmbar negro, madeira cremosa e especiarias raras.",
    description: "Um perfume de presença magnética, feito para noites longas, encontros marcantes e memórias que permanecem.",
    richDescription: "A abertura traz especiarias finas; o coração revela âmbar quente e o fundo firma madeiras nobres com textura aveludada.",
    featured: true,
    bestSeller: true,
    rating: 4.9,
    reviews: 128,
    notes: ["Pimenta rosa", "Âmbar", "Sândalo"]
  },
  {
    id: "oud-imperial",
    name: "Oud Imperial",
    slug: "oud-imperial",
    category: "Perfumes Autorais",
    categorySlug: "perfumes-autorais",
    brand: "ZION AROMAS",
    price: 459.9,
    salePrice: 419.9,
    stock: 18,
    sku: "ZION-OUD-100",
    volume: "100 ml",
    weight: "0,45 kg",
    status: "active",
    image: "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?auto=format&fit=crop&w=1200&q=85"
    ],
    shortDescription: "Oud sofisticado com couro macio e incenso dourado.",
    description: "Uma assinatura intensa, nobre e contemporânea, equilibrada para causar impacto sem excesso.",
    richDescription: "Construído em camadas amadeiradas, com rastro elegante e acabamento seco, ideal para ocasiões especiais.",
    featured: true,
    isNew: true,
    rating: 4.8,
    reviews: 94,
    notes: ["Oud", "Couro", "Incenso"]
  },
  {
    id: "amber-room-diffuser",
    name: "Amber Room Diffuser",
    slug: "amber-room-diffuser",
    category: "Aromas de Ambiente",
    categorySlug: "aromas-de-ambiente",
    brand: "ZION AROMAS",
    price: 249.9,
    stock: 42,
    sku: "ZION-AMBER-250",
    volume: "250 ml",
    weight: "0,62 kg",
    status: "active",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1603204077779-bed963ea7d0e?auto=format&fit=crop&w=1200&q=85"
    ],
    shortDescription: "Difusor de ambiente com âmbar, baunilha seca e madeiras.",
    description: "Aromatização contínua para salas, lavabos e suítes com sensação acolhedora e refinada.",
    richDescription: "Varetas de alta absorção, frasco elegante e fragrância calibrada para difusão uniforme.",
    bestSeller: true,
    isNew: true,
    rating: 4.7,
    reviews: 76,
    notes: ["Âmbar", "Baunilha", "Cedro"]
  },
  {
    id: "golden-ritual-candle",
    name: "Golden Ritual Candle",
    slug: "golden-ritual-candle",
    category: "Velas Premium",
    categorySlug: "velas-premium",
    brand: "ZION AROMAS",
    price: 189.9,
    salePrice: 159.9,
    stock: 33,
    sku: "ZION-CANDLE-180",
    volume: "180 g",
    weight: "0,52 kg",
    status: "active",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=1200&q=85"
    ],
    shortDescription: "Vela aromática com flor de laranjeira, musk e mel claro.",
    description: "Um ritual luminoso para desacelerar, receber e criar atmosfera com sofisticação silenciosa.",
    richDescription: "Cera vegetal premium, pavio de algodão e queima limpa com excelente projeção aromática.",
    featured: true,
    rating: 4.9,
    reviews: 61,
    notes: ["Flor de laranjeira", "Musk", "Mel"]
  },
  {
    id: "royal-gift-set",
    name: "Royal Gift Set",
    slug: "royal-gift-set",
    category: "Kits Presente",
    categorySlug: "kits-presente",
    brand: "ZION AROMAS",
    price: 529.9,
    stock: 15,
    sku: "ZION-GIFT-ROYAL",
    volume: "Kit",
    weight: "1,1 kg",
    status: "active",
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=85"
    ],
    shortDescription: "Perfume, vela e difusor em embalagem presenteável.",
    description: "Curadoria completa para surpreender com presença, cuidado e acabamento impecável.",
    richDescription: "Acompanha embalagem rígida, cartão de mensagem e seleção harmonizada de fragrâncias.",
    bestSeller: true,
    rating: 4.8,
    reviews: 49,
    notes: ["Curadoria", "Presente", "Ritual"]
  },
  {
    id: "white-musk-linen-spray",
    name: "White Musk Linen Spray",
    slug: "white-musk-linen-spray",
    category: "Aromas de Ambiente",
    categorySlug: "aromas-de-ambiente",
    brand: "ZION AROMAS",
    price: 149.9,
    stock: 57,
    sku: "ZION-LINEN-200",
    volume: "200 ml",
    weight: "0,33 kg",
    status: "active",
    image: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=85"
    ],
    shortDescription: "Spray para tecidos com musk limpo, algodão e íris.",
    description: "Toque final para roupas de cama, toalhas e cortinas com frescor refinado.",
    richDescription: "Fórmula delicada, secagem rápida e fragrância elegante para uso diário.",
    isNew: true,
    rating: 4.6,
    reviews: 37,
    notes: ["Musk", "Algodão", "Íris"]
  }
];

export const testimonials = [
  {
    name: "Marina L.",
    text: "A apresentação é impecável e o perfume tem um rastro elegante, nada óbvio.",
    role: "Cliente ZION"
  },
  {
    name: "Rafael C.",
    text: "Comprei o kit para presente e parecia uma experiência de boutique internacional.",
    role: "Cliente ZION"
  },
  {
    name: "Bianca A.",
    text: "O difusor mudou a atmosfera da casa sem ficar enjoativo. Luxo discreto.",
    role: "Cliente ZION"
  }
];

export const orderStatuses = ["Recebido", "Pago", "Separação", "Enviado", "Entregue", "Cancelado"];

export function findProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
