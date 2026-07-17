import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { isAdminUnlocked } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/security";

const MAX_FILES = 8;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  if (!(await isAdminUnlocked())) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  if (isRateLimited(request, "upload", 20, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um instante." }, { status: 429 });
  }

  try {
    const form = await request.formData();
    const files = form.getAll("files").filter((file): file is File => file instanceof File);

    if (!files.length) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: "Envie no maximo 8 imagens por vez." }, { status: 400 });
    }

    const uploaded = await Promise.all(
      files.map(async (file) => {
        if (!allowedTypes.has(file.type) || file.size > MAX_FILE_SIZE) {
          throw new Error("invalid-file");
        }

        const filename = `${randomUUID()}.webp`;
        const input = Buffer.from(await file.arrayBuffer());
        const bytes = await sharp(input, { animated: false })
          .rotate()
          .resize({
            width: 1400,
            height: 1400,
            fit: "inside",
            withoutEnlargement: true
          })
          .webp({ quality: 82, effort: 5 })
          .toBuffer();
        const asset = await prisma.mediaAsset.create({
          data: {
            filename,
            mimeType: "image/webp",
            size: bytes.length,
            data: bytes
          },
          select: { id: true }
        });
        return `/api/media/${asset.id}.webp`;
      })
    );

    return NextResponse.json({ files: uploaded });
  } catch {
    return NextResponse.json({ error: "Envie apenas imagens JPG, PNG, WEBP ou GIF validas." }, { status: 400 });
  }
}
