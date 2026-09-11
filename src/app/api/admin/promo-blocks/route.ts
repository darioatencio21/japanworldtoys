import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  badge: z.string().trim().max(30, "La etiqueta no puede superar los 30 caracteres").optional().default(""),
  titulo: z.string().trim().min(1, "El título es obligatorio").max(80, "El título no puede superar los 80 caracteres"),
  descripcion: z.string().trim().max(300, "La descripción no puede superar los 300 caracteres").optional().default(""),
  backgroundImage: z.string().trim().max(500, "La imagen de fondo no puede superar los 500 caracteres").optional().default(""),
  backgroundImageMobile: z.string().trim().max(500, "La imagen de fondo móvil no puede superar los 500 caracteres").optional().default(""),
  textoCTA: z.string().trim().max(30, "El texto del CTA no puede superar los 30 caracteres").optional().default(""),
  linkCTA: z.string().trim().max(500, "El enlace no puede superar los 500 caracteres").optional().default(""),
  orden: z.coerce.number().int().min(0).max(999).optional().default(0),
  activo: z.boolean().optional().default(true),
});

export async function GET() {
  const session = await auth();
  const allow = ["ADMIN", "SUPERADMIN", "EDITOR"];
  if (!session?.user || !allow.includes(session.user.rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const promoBlocks = await prisma.promoBlock.findMany({
    orderBy: [{ orden: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ promoBlocks });
}

export async function POST(req: Request) {
  const session = await auth();
  const allow = ["ADMIN", "SUPERADMIN", "EDITOR"];
  if (!session?.user || !allow.includes(session.user.rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const promoBlock = await prisma.promoBlock.create({
      data: {
        badge: d.badge || null,
        titulo: d.titulo,
        descripcion: d.descripcion || null,
        backgroundImage: d.backgroundImage || null,
        backgroundImageMobile: d.backgroundImageMobile || null,
        textoCTA: d.textoCTA || null,
        linkCTA: d.linkCTA || null,
        orden: d.orden,
        activo: d.activo,
      },
    });

    return NextResponse.json({ ok: true, promoBlock }, { status: 201 });
  } catch (error) {
    console.error("PromoBlock create error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}