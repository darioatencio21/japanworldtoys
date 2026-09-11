import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  badge: z.string().trim().max(30, "La etiqueta no puede superar los 30 caracteres").optional(),
  titulo: z.string().trim().min(1, "El título es obligatorio").max(80, "El título no puede superar los 80 caracteres").optional(),
  descripcion: z.string().trim().max(300, "La descripción no puede superar los 300 caracteres").optional(),
  backgroundImage: z.string().trim().max(500, "La imagen de fondo no puede superar los 500 caracteres").optional(),
  backgroundImageMobile: z.string().trim().max(500, "La imagen de fondo móvil no puede superar los 500 caracteres").optional(),
  textoCTA: z.string().trim().max(30, "El texto del CTA no puede superar los 30 caracteres").optional(),
  linkCTA: z.string().trim().max(500, "El enlace no puede superar los 500 caracteres").optional(),
  orden: z.coerce.number().int().min(0).max(999).optional(),
  activo: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const allow = ["ADMIN", "SUPERADMIN", "EDITOR"];
  if (!session?.user || !allow.includes(session.user.rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const existing = await prisma.promoBlock.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "El bloque no existe" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const data: Record<string, unknown> = {};
    if (typeof d.badge === "string") data.badge = d.badge || null;
    if (typeof d.titulo === "string") data.titulo = d.titulo;
    if (typeof d.descripcion === "string") data.descripcion = d.descripcion || null;
    if (typeof d.backgroundImage === "string") data.backgroundImage = d.backgroundImage || null;
    if (typeof d.backgroundImageMobile === "string") data.backgroundImageMobile = d.backgroundImageMobile || null;
    if (typeof d.textoCTA === "string") data.textoCTA = d.textoCTA || null;
    if (typeof d.linkCTA === "string") data.linkCTA = d.linkCTA || null;
    if (typeof d.orden === "number") data.orden = d.orden;
    if (typeof d.activo === "boolean") data.activo = d.activo;

    const promoBlock = await prisma.promoBlock.update({
      where: { id },
      data,
    });

    return NextResponse.json({ ok: true, promoBlock });
  } catch (error) {
    console.error("PromoBlock update error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const allow = ["ADMIN", "SUPERADMIN"];
  if (!session?.user || !allow.includes(session.user.rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const existing = await prisma.promoBlock.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "El bloque no existe" }, { status: 404 });
    }

    await prisma.promoBlock.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PromoBlock delete error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}