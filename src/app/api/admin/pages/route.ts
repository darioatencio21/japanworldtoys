import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SLUG_OK = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET() {
  const session = await auth();
  const allow = ["ADMIN", "SUPERADMIN", "EDITOR"];
  if (!session?.user || !allow.includes(session.user.rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ pages });
}

export async function POST(req: Request) {
  const session = await auth();
  const allow = ["ADMIN", "SUPERADMIN", "EDITOR"];
  if (!session?.user || !allow.includes(session.user.rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { slug, titulo, contenido, metaTitle, metaDesc, activo } = body;

    if (!titulo?.trim()) {
      return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });
    }
    if (!slug?.trim()) {
      return NextResponse.json({ error: "El slug es obligatorio" }, { status: 400 });
    }
    if (!SLUG_OK.test(slug.trim())) {
      return NextResponse.json(
        { error: "El slug solo admite minúsculas, números y guiones (ej: politica-envios)" },
        { status: 400 }
      );
    }
    if (!contenido?.trim()) {
      return NextResponse.json({ error: "El contenido es obligatorio" }, { status: 400 });
    }

    const slugFinal = slug.trim();
    const existing = await prisma.page.findUnique({ where: { slug: slugFinal } });
    if (existing) {
      return NextResponse.json({ error: "Ya existe una página con ese slug" }, { status: 409 });
    }

    const page = await prisma.page.create({
      data: {
        slug: slugFinal,
        titulo: titulo.trim(),
        contenido,
        metaTitle: metaTitle?.trim() || null,
        metaDesc: metaDesc?.trim() || null,
        activo: activo !== false,
      },
    });

    return NextResponse.json({ ok: true, page }, { status: 201 });
  } catch (error) {
    console.error("Page create error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}