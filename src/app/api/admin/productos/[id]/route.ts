import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { EstadoProducto } from "@prisma/client";

export const dynamic = "force-dynamic";

const productSchema = z
  .object({
    nombre: z.string().trim().min(1, "El nombre es obligatorio").max(50, "El nombre no puede superar los 50 caracteres").optional(),
    slug: z.string().trim().min(1).max(50, "El slug no puede superar los 50 caracteres").optional(),
    descripcion: z.string().trim().max(300, "La descripción no puede superar los 300 caracteres").optional(),
    sku: z.string().trim().min(1, "El SKU es obligatorio").optional(),
    precio: z.coerce.number().int("El precio debe ser un número entero").min(0).max(99999999, "El precio no puede superar los 8 dígitos").optional(),
    precioComparativo: z.coerce.number().int().min(0).max(99999999).nullable().optional(),
    stock: z.coerce.number().int().min(0).optional(),
    categoriaId: z.string().min(1).optional(),
    marcaId: z.string().nullable().optional(),
    estado: z.nativeEnum(EstadoProducto).optional(),
    destacado: z.boolean().optional(),
    esNovedad: z.boolean().optional(),
    franquiciaIds: z.array(z.string()).optional(),
    imagenes: z
      .array(
        z.object({
          url: z.string().trim().min(1),
          alt: z.string().trim().max(150).optional().default(""),
        })
      )
      .max(4, "Se permiten hasta 4 imágenes")
      .optional(),
  })
  .strict();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const allow = ["ADMIN", "SUPERADMIN", "EDITOR"];
  if (!session?.user || !allow.includes(session.user.rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    if (data.slug || data.sku) {
      const conflict = await prisma.product.findFirst({
        where: {
          id: { not: id },
          OR: [
            ...(data.slug ? [{ slug: data.slug }] : []),
            ...(data.sku ? [{ sku: data.sku }] : []),
          ],
        },
      });
      if (conflict) {
        return NextResponse.json(
          { error: "Ya existe un producto con ese slug o SKU." },
          { status: 409 }
        );
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        nombre: data.nombre,
        slug: data.slug ? slugify(data.slug) || slugify(data.nombre || "") : undefined,
        descripcion: data.descripcion === undefined ? undefined : data.descripcion || null,
        sku: data.sku,
        precio: data.precio,
        precioComparativo:
          data.precioComparativo === undefined ? undefined : data.precioComparativo,
        stock: data.stock,
        categoriaId: data.categoriaId,
        marcaId: data.marcaId === undefined ? undefined : data.marcaId,
        estado: data.estado,
        destacado: data.destacado,
        esNovedad: data.esNovedad,
        ...(data.franquiciaIds !== undefined && {
          franquicias: {
            set: data.franquiciaIds.map((fid) => ({ id: fid })),
          },
        }),
        ...(data.imagenes !== undefined && {
          imagenes: {
            deleteMany: {},
            create: data.imagenes.map((img, i) => ({
              url: img.url,
              alt: img.alt || data.nombre || existing.nombre,
              orden: i,
              esPrincipal: i === 0,
            })),
          },
        }),
      },
      include: {
        marca: true,
        categoria: {
          include: { parent: { select: { id: true, nombre: true } } },
        },
        franquicias: true,
        imagenes: { orderBy: { orden: "asc" } },
      },
    });

    return NextResponse.json({ ok: true, product });
  } catch (error) {
    console.error("Admin actualizar producto error:", error);
    return NextResponse.json({ error: "Error interno al actualizar el producto" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const allow = ["ADMIN", "SUPERADMIN"];
  if (!session?.user || !allow.includes(session.user.rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const sold = await prisma.orderItem.count({ where: { productId: id } });
    if (sold > 0) {
      return NextResponse.json(
        { error: "Este producto tiene ventas asociadas. Podés marcarlo como descontinuado." },
        { status: 400 }
      );
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin eliminar producto error:", error);
    return NextResponse.json({ error: "Error interno al eliminar el producto" }, { status: 500 });
  }
}