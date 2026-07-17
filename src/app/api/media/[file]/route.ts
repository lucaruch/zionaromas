import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ file: string }> };

export async function GET(_: Request, { params }: RouteContext) {
  const { file } = await params;
  const id = file.replace(/\.[^.]+$/, "");

  if (!/^[a-z0-9]+$/i.test(id)) {
    return NextResponse.json({ error: "Imagem nao encontrada." }, { status: 404 });
  }

  const asset = await prisma.mediaAsset.findUnique({
    where: { id },
    select: { data: true, mimeType: true, size: true }
  });

  if (!asset) {
    return NextResponse.json({ error: "Imagem nao encontrada." }, { status: 404 });
  }

  return new Response(Buffer.from(asset.data), {
    headers: {
      "Content-Type": asset.mimeType,
      "Content-Length": String(asset.size),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
