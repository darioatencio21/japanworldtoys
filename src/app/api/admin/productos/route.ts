import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { EstadoProducto } from "@prisma/client";

export const dynamic = "force-dynamic";

const productSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(50, "El nombre no puede superar los 50 caracteres"),
  slug: z.string().trim().min(1).max(50, "El slug no puede superar los 50 caracteres"),
  descripcion: z.string().trim().max(300, "La descripción no puede superar los 300 caracteres").optional().default(""),
  sku: z.string().trim().min(1, "El SKU es obligatorio"),
  precio: z.coerce.number().int("El precio debe ser un número entero").min(0, "El precio no puede ser negativo").max(99999999, "El precio no puede superar los 8 dígitos"),
  precioComparativo: z.coerce.number().int().min(0).max(99999999).nullable().optional(),
  stock: z.coerce.number().int().min(0).default(0),
  categoriaId: z.string().min(1, "Seleccioná una categoría"),
  marcaId: z.string().nullable().optional(),
  estado: z.nativeEnum(EstadoProducto).default(EstadoProducto.ACTIVO),
  destacado: z.boolean().default(false),
  esNovedad: z.boolean().default(false),
  franquiciaIds: z.array(z.string()).optional().default([]),
  imagenes: z
    .array(
      z.object({
        url: z.string().trim().min(1),
        alt: z.string().trim().max(150).optional().default(""),
      })
    )
    .max(4, "Se permiten hasta 4 imágenes")
    .optional()
    .default([]),
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

  const products = await prisma.product.findMany({
    include: {
      marca: true,
      categoria: {
        include: { parent: { select: { id: true, nombre: true } } },
      },
      imagenes: { orderBy: { orden: "asc" } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const session = await auth();
  const allow = ["ADMIN", "SUPERADMIN", "EDITOR"];
  if (!session?.user || !allow.includes(session.user.rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existing = await prisma.product.findFirst({
      where: {
        OR: [{ slug: data.slug }, { sku: data.sku }],
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un producto con ese slug o SKU." },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: {
        nombre: data.nombre,
        slug: slugify(data.slug) || slugify(data.nombre),
        descripcion: data.descripcion || null,
        sku: data.sku,
        precio: data.precio,
        precioComparativo: data.precioComparativo ?? null,
        stock: data.stock,
        categoriaId: data.categoriaId,
        marcaId: data.marcaId || null,
        estado: data.estado,
        destacado: data.destacado,
        esNovedad: data.esNovedad,
        franquicias: data.franquiciaIds.length
          ? { connect: data.franquiciaIds.map((id) => ({ id })) }
          : undefined,
        imagenes: data.imagenes.length
          ? {
              create: data.imagenes.map((img, i) => ({
                url: img.url,
                alt: img.alt || data.nombre,
                orden: i,
                esPrincipal: i === 0,
              })),
            }
          : undefined,
      },
      include: {
        marca: true,
        categoria: {
          include: { parent: { select: { id: true, nombre: true } } },
        },
        imagenes: { orderBy: { orden: "asc" } },
      },
    });

    return NextResponse.json({ ok: true, product });
  } catch (error) {
    console.error("Admin crear producto error:", error);
    return NextResponse.json({ error: "Error interno al crear el producto" }, { status: 500 });
  }
}