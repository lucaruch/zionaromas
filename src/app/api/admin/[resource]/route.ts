import { NextResponse } from "next/server";
import { isAdminUnlocked } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

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
  return (prisma as unknown as Record<string, { findMany: Function; create: Function; update: Function; delete: Function }>)[modelName];
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
  const { resource } = await params;
  const model = getModel(resource);
  if (!model) return NextResponse.json({ error: "Recurso não encontrado." }, { status: 404 });
  const data = await request.json();
  try {
    const created = await model.create({ data });
    return NextResponse.json({ data: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Banco de dados indisponível." }, { status: 503 });
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  if (!(await isAdminUnlocked())) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const { resource } = await params;
  const model = getModel(resource);
  if (!model) return NextResponse.json({ error: "Recurso não encontrado." }, { status: 404 });
  const { id, ...data } = await request.json();
  try {
    const updated = await model.update({ where: { id }, data });
    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Banco de dados indisponível." }, { status: 503 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  if (!(await isAdminUnlocked())) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const { resource } = await params;
  const model = getModel(resource);
  if (!model) return NextResponse.json({ error: "Recurso não encontrado." }, { status: 404 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
  try {
    await model.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Banco de dados indisponível." }, { status: 503 });
  }
}
