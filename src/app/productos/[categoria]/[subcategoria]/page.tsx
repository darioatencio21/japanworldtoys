import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/product-card";
import { auth } from "@/lib/auth";
import { priceForUser } from "@/lib/price";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function SubcategoryPage({
  params,
}: {
  params: Promise<{ categoria: string; subcategoria: string }>;
}) {
  const { categoria, subcategoria } = await params;

  const category = await prisma.category.findUnique({
    where: { slug: subcategoria },
    include: { parent: true },
  });

  if (!category || !category.parent || category.parent.slug !== categoria) {
    notFound();
  }

  const session = await auth();

  // Máximo 6 productos en pantalla; el resto se ve con "Ver más"
  const allProductsRaw = await prisma.product.findMany({
    where: { categoriaId: category.id, estado: { not: "DESCONTINUADO" } },
    include: {
      imagenes: { orderBy: { orden: "asc" } },
    },
    orderBy: [{ destacado: "desc" }, { createdAt: "desc" }],
    take: 7, // 6 visibles + 1 para saber si hay más
  });
  const products = allProductsRaw.slice(0, 6);
  const hasMore = allProductsRaw.length > 6;

  // Conteo real para el badge del header
  const totalSubcategory = await prisma.product.count({
    where: { categoriaId: category.id, estado: { not: "DESCONTINUADO" } },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: "Productos", href: "/productos" },
          { label: category.parent.nombre, href: `/productos/${category.parent.slug}` },
          { label: category.nombre },
        ]}
      />

      {/* Header */}
      <div className="relative mt-6 mb-10 rounded-2xl overflow-hidden bg-gradient-to-r from-jw-black to-jw-gray-700 p-8 md:p-12 text-white">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none">
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 h-48 border-4 border-white rounded-full" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="gold">{category.parent.nombre}</Badge>
            <Badge className="bg-white/20 text-white">{totalSubcategory} productos</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)]">
            {category.nombre}
          </h1>
          {category.descripcion && (
            <p className="text-white/80 mt-2 max-w-lg">{category.descripcion}</p>
          )}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📦</p>
          <h2 className="text-xl font-semibold text-jw-black mb-2">
            Aún no hay productos en esta categoría
          </h2>
          <p className="text-jw-gray-500">Pronto sumamos novedades.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => {
            const effective = priceForUser(p, session?.user?.rol);
            return (
              <ProductCard
              key={p.id}
              product={{
                id: p.id,
                nombre: p.nombre,
                slug: p.slug,
                precio: Number(p.precio),
                precioComparativo: p.precioComparativo
                  ? Number(p.precioComparativo)
                  : undefined,
                stock: p.stock,
                estado: p.estado,
                destacado: p.destacado,
                esNovedad: p.esNovedad,
                imagenes: p.imagenes.map((img) => ({
                  url: img.url,
                  alt: img.alt,
                  esPrincipal: img.esPrincipal,
                })),
              }}
              precioEfectivo={effective.precioComparativo ? effective.precio : undefined}
              precioComparativoEfectivo={effective.precioComparativo ?? undefined}
            />
          );
        })}
        </div>
      )}

      {hasMore && (
        <div className="mt-10 text-center">
          <Link
            href={`/productos?categoria=${category.parent.slug},${category.slug}&todos=1`}
            className="inline-flex h-12 px-8 items-center rounded-xl border border-jw-gray-300 bg-white text-sm font-semibold text-jw-black hover:border-jw-red hover:text-jw-red transition-colors"
          >
            Ver más productos
          </Link>
        </div>
      )}
    </div>
  );
}