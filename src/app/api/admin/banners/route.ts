import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["hero", "promo", "category"];

export async function GET() {
  const session = await auth();
  const allow = ["ADMIN", "SUPERADMIN", "EDITOR"];
  if (!session?.user || !allow.includes(session.user.rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const banners = await prisma.banner.findMany({
    orderBy: [{ orden: "asc" }, { createdAt: "desc" }],
    include: { franchise: { select: { id: true, nombre: true } } },
  });
  return NextResponse.json({ banners });
}

export async function POST(req: Request) {
  const session = await auth();
  const allow = ["ADMIN", "SUPERADMIN", "EDITOR"];
  if (!session?.user || !allow.includes(session.user.rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { titulo, subtitulo, imagenDesktop, imagenMobile, textoCTA, linkCTA, tipo, orden, activo, activoDesde, activoHasta, franchiseId } = body;

    if (!titulo?.trim()) {
      return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });
    }
    if (!imagenDesktop?.trim()) {
      return NextResponse.json({ error: "La imagen desktop es obligatoria" }, { status: 400 });
    }
    if (tipo && !ALLOWED_TYPES.includes(tipo)) {
      return NextResponse.json({ error: "Tipo de banner inválido" }, { status: 400 });
    }

    const banner = await prisma.banner.create({
      data: {
        titulo: titulo.trim(),
        subtitulo: subtitulo?.trim() || null,
        imagenDesktop: imagenDesktop.trim(),
        imagenMobile: imagenMobile?.trim() || null,
        textoCTA: textoCTA?.trim() || null,
        linkCTA: linkCTA?.trim() || null,
        tipo: tipo || "hero",
        orden: typeof orden === "number" ? orden : 0,
        activo: activo !== false,
        activoDesde: activoDesde ? new Date(activoDesde) : null,
        activoHasta: activoHasta ? new Date(activoHasta) : null,
        franchiseId: franchiseId || null,
      },
    });

    return NextResponse.json({ ok: true, banner }, { status: 201 });
  } catch (error) {
    console.error("Banner create error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}