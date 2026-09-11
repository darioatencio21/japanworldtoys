import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ALLOWED = new Map([
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
  [".svg", "image/svg+xml"],
]);

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  const session = await auth();
  const allow = ["ADMIN", "SUPERADMIN", "EDITOR"];
  if (!session?.user || !allow.includes(session.user.rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "El archivo está vacío." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "La imagen supera los 5 MB." },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name).toLowerCase();
    const expectedType = ALLOWED.get(ext);
    if (!expectedType || !file.type.startsWith(expectedType.split("/")[0])) {
      return NextResponse.json(
        { error: "Formato no permitido. Usá PNG, JPG, WebP, GIF o SVG." },
        { status: 400 }
      );
    }

    const fileName = `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, fileName), buffer);

    return NextResponse.json({ ok: true, url: `/uploads/${fileName}` }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Error interno al subir la imagen." }, { status: 500 });
  }
}