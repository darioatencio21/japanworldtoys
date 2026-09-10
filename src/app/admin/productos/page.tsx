import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductsManager } from "@/components/admin/products-manager";

export const dynamic = "force-dynamic";

export default async function AdminProductosPage() {
  const session = await auth();
  if (!session?.user) return null;

  const [products, categories, brands, franchises] = await Promise.all([
    prisma.product.findMany({
      include: {
        marca: true,
        categoria: {
          include: { parent: { select: { id: true, nombre: true } } },
        },
        imagenes: { orderBy: { orden: "asc" } },
        franquicias: { select: { id: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.category.findMany({
      include: { parent: { select: { id: true, nombre: true } } },
      orderBy: [{ parentId: "asc" }, { orden: "asc" }],
    }),
    prisma.brand.findMany({ orderBy: { nombre: "asc" } }),
    prisma.franchise.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  const canDelete = ["ADMIN", "SUPERADMIN"].includes(session.user.rol || "");

  return (
    <ProductsManager
      initialProducts={products.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        slug: p.slug,
        sku: p.sku,
        descripcion: p.descripcion,
        precio: Number(p.precio),
        precioComparativo: p.precioComparativo ? Number(p.precioComparativo) : null,
        stock: p.stock,
        categoriaId: p.categoriaId,
        categoriaNombre: p.categoria.nombre,
        categoriaPadre: p.categoria.parent?.nombre || null,
        marcaId: p.marcaId,
        marcaNombre: p.marca?.nombre || null,
        estado: p.estado,
        destacado: p.destacado,
        esNovedad: p.esNovedad,
        franquiciaIds: p.franquicias.map((f) => f.id),
        imagenes: p.imagenes.map((img) => ({ url: img.url, alt: img.alt || "" })),
        ventas: p._count.items,
      }))}
      categories={categories.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        parentId: c.parentId,
        padreNombre: c.parent?.nombre || null,
      }))}
      brands={brands}
      franchises={franchises}
      canDelete={canDelete}
    />
  );
}