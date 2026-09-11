import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(50, "El nombre no puede superar los 50 caracteres").optional(),
  slug: z.string().trim().min(1).max(50).optional(),
  color: z.string().trim().max(20, "El color no puede superar los 20 caracteres").optional(),
  imagen: z.string().trim().max(500, "La imagen no puede superar los 500 caracteres").optional(),
  imagenMobile: z.string().trim().max(500, "La imagen celular no puede superar los 500 caracteres").optional(),
  mensaje: z.string().trim().max(200, "El mensaje no puede superar los 200 caracteres").optional(),
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
    const existing = await prisma.franchise.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Franquicia no existe" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (typeof parsed.data.nombre === "string") data.nombre = parsed.data.nombre;
    if (typeof parsed.data.slug === "string") data.slug = parsed.data.slug;
    if (typeof parsed.data.color === "string") data.color = parsed.data.color || null;
    if (typeof parsed.data.imagen === "string") data.imagen = parsed.data.imagen || null;
    if (typeof parsed.data.imagenMobile === "string") data.imagenMobile = parsed.data.imagenMobile || null;
    if (typeof parsed.data.mensaje === "string") data.mensaje = parsed.data.mensaje || null;

    const franchise = await prisma.franchise.update({
      where: { id },
      data,
    });

    return NextResponse.json({ ok: true, franchise });
  } catch (error) {
    console.error("Franchise update error:", error);
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
    const existing = await prisma.franchise.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Franquicia no existe" }, { status: 404 });
    }

    await prisma.franchise.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Franchise delete error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}