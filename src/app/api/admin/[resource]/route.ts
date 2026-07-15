import { NextResponse } from "next/server";
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

function getModel(resource: string) {
  const modelName = modelMap[resource as keyof typeof modelMap];
  if (!modelName) return null;
  return (prisma as unknown as Record<string, AdminModel>)[modelName];
}

async function readAdminPayload(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (!contentType.includes("application/json") || contentLength > 128_000) return null;

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  return payload as Record<string, unknown>;
}

type RouteContext = { params: Promise<{ resource: string }> };

export async function GET(_: Request, { params }: RouteContext) {
  if (!(await isAdminUnlocked())) return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  const { resource } = await params;
  const model = getModel(resource);
  if (!model) return NextResponse.json({ error: "Recurso nao encontrado." }, { status: 404 });
  try {
    const data = await model.findMany({ take: 100 });
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ data: [], warning: "Banco de dados indisponivel." }, { status: 200 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  if (!(await isAdminUnlocked())) return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  if (isRateLimited(request, "admin-crud", 80, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas." }, { status: 429 });
  }

  const { resource } = await params;
  const model = getModel(resource);
  if (!model) return NextResponse.json({ error: "Recurso nao encontrado." }, { status: 404 });

  const data = await readAdminPayload(request);
  if (!data) return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });

  try {
    const created = await model.create({ data });
    return NextResponse.json({ data: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Banco de dados indisponivel." }, { status: 503 });
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  if (!(await isAdminUnlocked())) return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  if (isRateLimited(request, "admin-crud", 80, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas." }, { status: 429 });
  }

  const { resource } = await params;
  const model = getModel(resource);
  if (!model) return NextResponse.json({ error: "Recurso nao encontrado." }, { status: 404 });

  const payload = await readAdminPayload(request);
  if (!payload || typeof payload.id !== "string" || !payload.id) {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const { id, ...data } = payload;

  try {
    const updated = await model.update({ where: { id }, data });
    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Banco de dados indisponivel." }, { status: 503 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  if (!(await isAdminUnlocked())) return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  if (isRateLimited(request, "admin-crud", 80, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas." }, { status: 429 });
  }

  const { resource } = await params;
  const model = getModel(resource);
  if (!model) return NextResponse.json({ error: "Recurso nao encontrado." }, { status: 404 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID obrigatorio." }, { status: 400 });
  try {
    await model.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Banco de dados indisponivel." }, { status: 503 });
  }
}
