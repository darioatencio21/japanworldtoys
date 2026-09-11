import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(50, "El nombre no puede superar los 50 caracteres"),
  color: z.string().trim().max(20, "El color no puede superar los 20 caracteres").optional().default(""),
  imagen: z.string().trim().max(500, "La imagen no puede superar los 500 caracteres").optional().default(""),
  imagenMobile: z.string().trim().max(500, "La imagen celular no puede superar los 500 caracteres").optional().default(""),
  mensaje: z.string().trim().max(200, "El mensaje no puede superar los 200 caracteres").optional().default(""),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

export async function GET() {
  const session = await auth();
  const allow = ["ADMIN", "SUPERADMIN", "EDITOR"];
  if (!session?.user || !allow.includes(session.user.rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const franchises = await prisma.franchise.findMany({
    include: { _count: { select: { productos: true } } },
    orderBy: { nombre: "asc" },
  });
  return NextResponse.json({ franchises });
}

export async function POST(request: Request) {
  const session = await auth();
  const allow = ["ADMIN", "SUPERADMIN", "EDITOR"];
  if (!session?.user || !allow.includes(session.user.rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }

    const nombre = parsed.data.nombre;
    const slug = slugify(nombre);

    const existing = await prisma.franchise.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una franquicia con ese nombre." },
        { status: 409 }
      );
    }

    const franchise = await prisma.franchise.create({
      data: {
        nombre,
        slug,
        color: parsed.data.color || null,
        imagen: parsed.data.imagen || null,
        imagenMobile: parsed.data.imagenMobile || null,
        mensaje: parsed.data.mensaje || null,
      },
    });
    return NextResponse.json({ ok: true, franchise });
  } catch (error) {
    console.error("Admin crear franquicia error:", error);
    return NextResponse.json({ error: "Error interno al crear la franquicia" }, { status: 500 });
  }
}