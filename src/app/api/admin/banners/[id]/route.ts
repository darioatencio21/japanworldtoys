import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["hero", "promo", "category"];

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
    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Banner no existe" }, { status: 404 });
    }

    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (typeof body.titulo === "string") data.titulo = body.titulo.trim() || undefined;
    if (typeof body.subtitulo === "string") data.subtitulo = body.subtitulo.trim() || null;
    if (typeof body.imagenDesktop === "string") data.imagenDesktop = body.imagenDesktop.trim() || undefined;
    if (typeof body.imagenMobile === "string") data.imagenMobile = body.imagenMobile.trim() || null;
    if (typeof body.textoCTA === "string") data.textoCTA = body.textoCTA.trim() || null;
    if (typeof body.linkCTA === "string") data.linkCTA = body.linkCTA.trim() || null;
    if (typeof body.orden === "number") data.orden = body.orden;
    if (typeof body.tipo === "string" && ALLOWED_TYPES.includes(body.tipo)) data.tipo = body.tipo;
    if (typeof body.activo === "boolean") data.activo = body.activo;
    if ("activoDesde" in body) data.activoDesde = body.activoDesde ? new Date(body.activoDesde) : null;
    if ("activoHasta" in body) data.activoHasta = body.activoHasta ? new Date(body.activoHasta) : null;
    if ("franchiseId" in body) data.franchiseId = body.franchiseId || null;

    const banner = await prisma.banner.update({
      where: { id },
      data,
      include: { franchise: { select: { id: true, nombre: true } } },
    });

    return NextResponse.json({ ok: true, banner });
  } catch (error) {
    console.error("Banner update error:", error);
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
    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Banner no existe" }, { status: 404 });
    }

    await prisma.banner.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Banner delete error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}