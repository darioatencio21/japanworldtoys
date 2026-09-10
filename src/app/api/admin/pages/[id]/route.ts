import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SLUG_OK = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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
    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Página no existe" }, { status: 404 });
    }

    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (typeof body.titulo === "string") data.titulo = body.titulo.trim() || undefined;
    if (typeof body.contenido === "string") data.contenido = body.contenido;
    if (typeof body.metaTitle === "string") data.metaTitle = body.metaTitle.trim() || null;
    if (typeof body.metaDesc === "string") data.metaDesc = body.metaDesc.trim() || null;
    if (typeof body.activo === "boolean") data.activo = body.activo;

    if (typeof body.slug === "string") {
      const slug = body.slug.trim();
      if (!SLUG_OK.test(slug)) {
        return NextResponse.json(
          { error: "El slug solo admite minúsculas, números y guiones" },
          { status: 400 }
        );
      }
      if (slug !== existing.slug) {
        const dup = await prisma.page.findUnique({ where: { slug } });
        if (dup) {
          return NextResponse.json({ error: "Ya existe una página con ese slug" }, { status: 409 });
        }
      }
      data.slug = slug;
    }

    const page = await prisma.page.update({ where: { id }, data });
    return NextResponse.json({ ok: true, page });
  } catch (error) {
    console.error("Page update error:", error);
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
    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Página no existe" }, { status: 404 });
    }

    await prisma.page.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Page delete error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}