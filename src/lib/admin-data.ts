import { prisma } from "@/lib/prisma";
import { resolveProductImage } from "@/lib/media";

export type AdminStats = {
  products: number;
  openOrders: number;
  customers: number;
  activeCoupons: number;
  newMessages: number;
};

export type AdminBrand = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  productCount: number;
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  productCount: number;
};

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  richDescription: string;
  price: string;
  salePrice: string;
  stock: number;
  sku: string;
  weight: string;
  volume: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  mainImage: string;
  gallery: string[];
  seoTitle: string;
  seoDescription: string;
  featured: boolean;
  bestSeller: boolean;
  isNew: boolean;
  categoryId: string;
  brandId: string;
  categoryName: string;
  brandName: string;
};

export type AdminCoupon = {
  id: string;
  code: string;
  description: string;
  discountRate: string;
  discountValue: string;
  maxUses: string;
  usedCount: number;
  expiresAt: string;
  active: boolean;
};

export type AdminOrder = {
  id: string;
  code: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerDocument: string;
  items: number;
  itemLines: Array<{
    productName: string;
    sku: string;
    quantity: number;
    price: string;
  }>;
  postalCode: string;
  addressLine: string;
  total: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  trackingCode: string;
  stockReducedAt: string;
  createdAt: string;
};

export type AdminContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "NOVO" | "RESPONDIDO" | "ARQUIVADO";
  createdAt: string;
};

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  orders: number;
  createdAt: string;
};

export type AdminBanner = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ctaLabel: string;
  ctaHref: string;
  location: string;
  active: boolean;
  sortOrder: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  try {
    const [products, openOrders, customers, activeCoupons, newMessages] = await Promise.all([
      prisma.product.count(),
      prisma.order.count({ where: { status: { in: ["RECEBIDO", "PAGO", "SEPARACAO", "ENVIADO"] } } }),
      prisma.customer.count(),
      prisma.coupon.count({ where: { active: true } }),
      prisma.contactMessage.count({ where: { status: "NOVO" } })
    ]);

    return { products, openOrders, customers, activeCoupons, newMessages };
  } catch {
    return { products: 0, openOrders: 0, customers: 0, activeCoupons: 0, newMessages: 0 };
  }
}

export async function getAdminBrands(): Promise<AdminBrand[]> {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } }
    });

    return brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      image: brand.image,
      productCount: brand._count.products
    }));
  } catch {
    return [];
  }
}

export async function getAdminCategories(): Promise<AdminCategory[]> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } }
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      productCount: category._count.products
    }));
  } catch {
    return [];
  }
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  try {
    const products = await prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      include: { brand: true, category: true }
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      description: product.description,
      richDescription: product.richDescription,
      price: product.price.toString(),
      salePrice: product.salePrice?.toString() ?? "",
      stock: product.stock,
      sku: product.sku,
      weight: product.weight?.toString() ?? "",
      volume: product.volume ?? "",
      status: product.status,
      mainImage: resolveProductImage(product.mainImage, product.brand.slug, product.category.slug),
      gallery: Array.isArray(product.gallery)
        ? (product.gallery as string[]).map((image) => resolveProductImage(image, product.brand.slug, product.category.slug))
        : [],
      seoTitle: product.seoTitle ?? "",
      seoDescription: product.seoDescription ?? "",
      featured: product.featured,
      bestSeller: product.bestSeller,
      isNew: product.isNew,
      categoryId: product.categoryId,
      brandId: product.brandId,
      categoryName: product.category.name,
      brandName: product.brand.name
    }));
  } catch {
    return [];
  }
}

export async function getAdminCoupons(): Promise<AdminCoupon[]> {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { orders: true } } }
    });

    return coupons.map((coupon) => ({
      id: coupon.id,
      code: coupon.code,
      description: coupon.description ?? "",
      discountRate: coupon.discountRate?.toString() ?? "",
      discountValue: coupon.discountValue?.toString() ?? "",
      maxUses: coupon.maxUses?.toString() ?? "",
      usedCount: coupon._count.orders,
      expiresAt: coupon.expiresAt?.toISOString().slice(0, 10) ?? "",
      active: coupon.active
    }));
  } catch {
    return [];
  }
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        address: true,
        items: { include: { product: true } }
      }
    });

    return orders.map((order) => ({
      id: order.id,
      code: order.code,
      customerName: order.customer.name,
      customerEmail: order.customer.email,
      customerPhone: order.customer.phone ?? "",
      customerDocument: order.customer.document ?? "",
      items: order.items.reduce((total, item) => total + item.quantity, 0),
      itemLines: order.items.map((item) => ({
        productName: item.product.name,
        sku: item.product.sku,
        quantity: item.quantity,
        price: item.price.toString()
      })),
      postalCode: order.address?.postalCode ?? "",
      addressLine: order.address
        ? `${order.address.street}, ${order.address.number}${order.address.complement ? ` - ${order.address.complement}` : ""} - ${order.address.neighborhood} - ${order.address.city}/${order.address.state}`
        : "Endereço não informado",
      total: order.total.toString(),
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      status: order.status,
      trackingCode: order.trackingCode ?? "",
      stockReducedAt: order.stockReducedAt?.toISOString() ?? "",
      createdAt: order.createdAt.toISOString()
    }));
  } catch {
    return [];
  }
}

export async function getAdminContactMessages(): Promise<AdminContactMessage[]> {
  try {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

    return messages.map((message) => ({
      id: message.id,
      name: message.name,
      email: message.email,
      phone: message.phone ?? "",
      subject: message.subject,
      message: message.message,
      status: message.status,
      createdAt: message.createdAt.toISOString()
    }));
  } catch {
    return [];
  }
}

export async function getAdminCustomers(): Promise<AdminCustomer[]> {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { orders: true } } }
    });

    return customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone ?? "",
      document: customer.document ?? "",
      orders: customer._count.orders,
      createdAt: customer.createdAt.toISOString()
    }));
  } catch {
    return [];
  }
}

export async function getAdminBanners(): Promise<AdminBanner[]> {
  try {
    const banners = await prisma.banner.findMany({ orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }] });

    return banners.map((banner) => ({
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle ?? "",
      image: banner.image,
      ctaLabel: banner.ctaLabel ?? "",
      ctaHref: banner.ctaHref ?? "",
      location: banner.location,
      active: banner.active,
      sortOrder: banner.sortOrder
    }));
  } catch {
    return [];
  }
}
