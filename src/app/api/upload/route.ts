import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdminUnlocked } from "@/lib/admin-auth";
import { isRateLimited } from "@/lib/security";

const MAX_FILES = 8;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const allowedTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"]
]);

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

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const uploaded = await Promise.all(
      files.map(async (file) => {
        const extension = allowedTypes.get(file.type);
        if (!extension || file.size > MAX_FILE_SIZE) {
          throw new Error("invalid-file");
        }

        const filename = `${randomUUID()}${extension}`;
        const bytes = Buffer.from(await file.arrayBuffer());
        await writeFile(path.join(uploadDir, filename), bytes);
        return `/uploads/${filename}`;
      })
    );

    return NextResponse.json({ files: uploaded });
  } catch {
    return NextResponse.json({ error: "Arquivo invalido." }, { status: 400 });
  }
}
