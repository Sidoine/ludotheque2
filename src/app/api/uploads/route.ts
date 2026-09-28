import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const allowedTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

export async function POST(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Aucune image sélectionnée." },
        { status: 400 },
      );
    }

    const extension = allowedTypes.get(file.type);
    if (!extension) {
      return NextResponse.json(
        { error: "Format accepté : JPG, PNG, WEBP ou GIF." },
        { status: 400 },
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "L’image ne doit pas dépasser 5 Mo." },
        { status: 400 },
      );
    }

    const directory = path.join(process.cwd(), "public", "uploads");
    await mkdir(directory, { recursive: true });
    const filename = `${randomUUID()}${extension}`;
    await writeFile(
      path.join(directory, filename),
      Buffer.from(await file.arrayBuffer()),
    );

    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Impossible d’enregistrer cette image." },
      { status: 400 },
    );
  }
}
