import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        estado: { not: "DESCONTINUADO" },
        OR: [
          { nombre: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
          { descripcion: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        nombre: true,
        slug: true,
        precio: true,
        precioComparativo: true,
        imagenes: {
          where: { esPrincipal: true },
          take: 1,
          select: { url: true, alt: true },
        },
      },
      orderBy: [{ destacado: "desc" }, { vistas: "desc" }, { createdAt: "desc" }],
      take: 8,
    });

    const results = products.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      slug: p.slug,
      precio: Number(p.precio),
      precioComparativo: p.precioComparativo ? Number(p.precioComparativo) : null,
      imagen: p.imagenes[0]?.url ?? null,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("[/api/search]", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
