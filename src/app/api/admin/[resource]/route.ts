import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminUnlocked } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/security";

type AdminModel = {
  findMany(args: { take: number }): Promise<unknown[]>;
  create(args: { data: Record<string, unknown> }): Promise<unknown>;
  update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<unknown>;
  delete(args: { where: { id: string } }): Promise<unknown>;
};

const modelMap = {
  produtos: "product",
  categorias: "category",
  marcas: "brand",
  cupons: "coupon",
  banners: "banner",
  pedidos: "order",
  clientes: "customer",
  configuracoes: "storeSetting"
} as const;

const nullableDecimal = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => {
    if (value === null || value === undefined || value === "") return null;
    return String(value).replace(",", ".");
  });

const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(140),
  shortDescription: z.string().trim().min(2).max(500),
  description: z.string().trim().min(2).max(20_000),
  richDescription: z.string().trim().min(2).max(20_000),
  price: z.union([z.string(), z.number()]).transform((value) => String(value).replace(",", ".")),
  salePrice: nullableDecimal,
  stock: z.coerce.number().int().min(0).max(999_999),
  sku: z.string().trim().min(2).max(80),
  weight: nullableDecimal,
  volume: z.string().trim().max(40).optional().default(""),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("ACTIVE"),
  mainImage: z.string().trim().min(1).max(500),
  gallery: z.array(z.string().trim().min(1).max(500)).max(12).default([]),
  seoTitle: z.string().trim().max(160).optional().default(""),
  seoDescription: z.string().trim().max(240).optional().default(""),
  featured: z.coerce.boolean().default(false),
  bestSeller: z.coerce.boolean().default(false),
  isNew: z.coerce.boolean().default(false),
  categoryId: z.string().trim().min(1),
  brandId: z.string().trim().min(1)
});

const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(100),
  description: z.string().trim().max(5_000).optional().default(""),
  image: z.string().trim().max(500).optional().nullable().default(null)
});

const brandSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(100),
  image: z.string().trim().max(500).optional().nullable().default(null)
});

const couponSchema = z.object({
  code: z.string().trim().min(2).max(40).transform((value) => value.toUpperCase()),
  description: z.string().trim().max(2_000).optional().default(""),
  discountRate: z.union([z.string(), z.number(), z.null(), z.undefined()]).transform((value) => {
    if (value === null || value === undefined || value === "") return null;
    return Number(value);
  }),
  discountValue: nullableDecimal,
  maxUses: z.union([z.string(), z.number(), z.null(), z.undefined()]).transform((value) => {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }),
  expiresAt: z.string().trim().max(20).optional().default(""),
  active: z.coerce.boolean().default(true)
});

const bannerSchema = z.object({
  title: z.string().trim().min(2).max(120),
  subtitle: z.string().trim().max(2_000).optional().default(""),
  image: z.string().trim().min(1).max(500),
  ctaLabel: z.string().trim().max(80).optional().default(""),
  ctaHref: z.string().trim().max(200).optional().default(""),
  location: z.string().trim().min(2).max(80).default("home"),
  active: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0)
});

const orderSchema = z.object({
  status: z.enum(["RECEBIDO", "PAGO", "SEPARACAO", "ENVIADO", "ENTREGUE", "CANCELADO"]),
  paymentStatus: z.string().trim().max(40).optional(),
  trackingCode: z.string().trim().max(80).optional().nullable()
});

const customerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().max(30).optional().nullable(),
  document: z.string().trim().max(30).optional().nullable()
});

function getModel(resource: string) {
  const modelName = modelMap[resource as keyof typeof modelMap];
  if (!modelName) return null;
  return (prisma as unknown as Record<string, AdminModel>)[modelName];
}

async function readAdminPayload(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (!contentType.includes("application/json") || contentLength > 512_000) return null;

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  return payload as Record<string, unknown>;
}

function prepareResourceData(resource: string, payload: Record<string, unknown>) {
  if (resource === "produtos") {
    const parsed = productSchema.safeParse(payload);
    if (!parsed.success) return null;
    const data = parsed.data;
    return {
      ...data,
      salePrice: data.salePrice || null,
      weight: data.weight || null,
      volume: data.volume || null,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      gallery: data.gallery.length ? data.gallery : [data.mainImage]
    };
  }

  if (resource === "categorias") {
    const parsed = categorySchema.safeParse(payload);
    if (!parsed.success) return null;
    return { ...parsed.data, image: parsed.data.image || null };
  }

  if (resource === "marcas") {
    const parsed = brandSchema.safeParse(payload);
    if (!parsed.success) return null;
    return { ...parsed.data, image: parsed.data.image || null };
  }

  if (resource === "cupons") {
    const parsed = couponSchema.safeParse(payload);
    if (!parsed.success) return null;
    return {
      ...parsed.data,
      discountRate: parsed.data.discountRate || null,
      discountValue: parsed.data.discountValue || null,
      maxUses: parsed.data.maxUses || null,
      expiresAt: parsed.data.expiresAt ? new Date(`${parsed.data.expiresAt}T23:59:59.000Z`) : null
    };
  }

  if (resource === "banners") {
    const parsed = bannerSchema.safeParse(payload);
    if (!parsed.success) return null;
    return {
      ...parsed.data,
      subtitle: parsed.data.subtitle || null,
      ctaLabel: parsed.data.ctaLabel || null,
      ctaHref: parsed.data.ctaHref || null
    };
  }

  if (resource === "pedidos") {
    const parsed = orderSchema.safeParse(payload);
    if (!parsed.success) return null;
    return parsed.data;
  }

  if (resource === "clientes") {
    const parsed = customerSchema.safeParse(payload);
    if (!parsed.success) return null;
    return parsed.data;
  }

  return null;
}

type RouteContext = { params: Promise<{ resource: string }> };

export async function GET(_: Request, { params }: RouteContext) {
  if (!(await isAdminUnlocked())) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const { resource } = await params;
  const model = getModel(resource);
  if (!model) return NextResponse.json({ error: "Recurso não encontrado." }, { status: 404 });
  try {
    const data = await model.findMany({ take: 100 });
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ data: [], warning: "Banco de dados indisponível." }, { status: 200 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  if (!(await isAdminUnlocked())) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  if (isRateLimited(request, "admin-crud", 80, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas." }, { status: 429 });
  }

  const { resource } = await params;
  const model = getModel(resource);
  if (!model) return NextResponse.json({ error: "Recurso não encontrado." }, { status: 404 });

  const payload = await readAdminPayload(request);
  if (!payload) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  const data = prepareResourceData(resource, payload);
  if (!data) return NextResponse.json({ error: "Revise os campos informados." }, { status: 400 });

  try {
    const created = await model.create({ data });
    return NextResponse.json({ data: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Banco de dados indisponível." }, { status: 503 });
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  if (!(await isAdminUnlocked())) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  if (isRateLimited(request, "admin-crud", 80, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas." }, { status: 429 });
  }

  const { resource } = await params;
  const model = getModel(resource);
  if (!model) return NextResponse.json({ error: "Recurso não encontrado." }, { status: 404 });

  const payload = await readAdminPayload(request);
  if (!payload || typeof payload.id !== "string" || !payload.id) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { id, ...rawData } = payload;
  const data = prepareResourceData(resource, rawData);
  if (!data) return NextResponse.json({ error: "Revise os campos informados." }, { status: 400 });

  try {
    const updated = await model.update({ where: { id }, data });
    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Banco de dados indisponível." }, { status: 503 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  if (!(await isAdminUnlocked())) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  if (isRateLimited(request, "admin-crud", 80, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas." }, { status: 429 });
  }

  const { resource } = await params;
  const model = getModel(resource);
  if (!model) return NextResponse.json({ error: "Recurso não encontrado." }, { status: 404 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID obrigatorio." }, { status: 400 });
  try {
    await model.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Banco de dados indisponível." }, { status: 503 });
  }
}
