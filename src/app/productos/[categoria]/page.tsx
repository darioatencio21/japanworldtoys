import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/product-card";
import { auth } from "@/lib/auth";
import { priceForUser } from "@/lib/price";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;

  const category = await prisma.category.findUnique({
    where: { slug: categoria },
    include: {
      children: true,
      parent: true,
    },
  });

  if (!category) notFound();

  const [products, childProducts, siblings] = await Promise.all([
    prisma.product.findMany({
      where: { categoriaId: category.id, estado: { not: "DESCONTINUADO" } },
      include: {
        imagenes: { orderBy: { orden: "asc" } },
      },
      orderBy: [{ destacado: "desc" }, { createdAt: "desc" }],
      take: 48,
    }),
    prisma.product.findMany({
      where: {
        categoria: { parentId: category.id },
        estado: { not: "DESCONTINUADO" },
      },
      include: {
        imagenes: { orderBy: { orden: "asc" } },
      },
      orderBy: [{ destacado: "desc" }, { createdAt: "desc" }],
      take: 48,
    }),
    prisma.category.findMany({
      where: { parentId: category.parentId },
      orderBy: { orden: "asc" },
    }),
  ]);

  const allProducts = [...products, ...childProducts];

  const session = await auth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: "Productos", href: "/productos" },
          ...(category.parent
            ? [{ label: category.parent.nombre, href: `/productos/${category.parent.slug}` }]
            : []),
          { label: category.nombre },
        ]}
      />

      {/* Category Header */}
      <div className="relative mt-6 mb-10 rounded-2xl overflow-hidden bg-gradient-to-r from-jw-red to-jw-red-dark p-8 md:p-12 text-white">
        {/* Decorative shapes */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none">
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 h-48 border-4 border-white rounded-full" />
          <div className="absolute right-24 top-8 w-16 h-16 border-2 border-white rotate-45" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            {category.parent && (
              <Badge variant="gold">{category.parent.nombre}</Badge>
            )}
            <Badge className="bg-white/20 text-white">{allProducts.length} productos</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)]">
            {category.nombre}
          </h1>
          {category.descripcion && (
            <p className="text-white/80 mt-2 max-w-lg">{category.descripcion}</p>
          )}
        </div>
      </div>

      {/* Subcategories */}
      {category.children.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-jw-black mb-4">
            Categorías relacionadas
          </h2>
          <div className="flex flex-wrap gap-3">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/productos/${child.slug}`}
                className="group flex items-center gap-2 px-5 py-3 rounded-xl border border-jw-gray-200 hover:border-jw-red hover:bg-jw-red/5 transition-all"
              >
                <span className="text-sm font-semibold text-jw-black group-hover:text-jw-red transition-colors">
                  {child.nombre}
                </span>
                <ChevronRight className="h-4 w-4 text-jw-gray-400 group-hover:text-jw-red group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {allProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📦</p>
          <h2 className="text-xl font-semibold text-jw-black mb-2">
            Próximamente en la categoría
          </h2>
          <p className="text-jw-gray-500 mb-6">
            Estamos sumando productos nuevos a {category.nombre}. ¡Volvé pronto!
          </p>
          <Link
            href="/productos"
            className="inline-flex h-11 px-6 items-center rounded-lg bg-jw-red text-white text-sm font-semibold hover:bg-jw-red-dark transition-colors"
          >
            Ver todo el catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {allProducts.map((p) => {
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

      {/* Siblings navigation */}
      {siblings.length > 1 && (
        <div className="mt-12 pt-8 border-t border-jw-gray-200">
          <h2 className="text-sm font-bold uppercase tracking-wider text-jw-gray-500 mb-4">
            Otras categorías
          </h2>
          <div className="flex flex-wrap gap-3">
            {siblings
              .filter((s) => s.id !== category.id)
              .map((sib) => (
                <Link
                  key={sib.id}
                  href={`/productos/${sib.slug}`}
                  className="group flex items-center gap-2 px-4 py-2 rounded-lg border border-jw-gray-200 hover:border-jw-red hover:bg-jw-red/5 transition-all text-sm"
                >
                  <span className="text-jw-gray-700 group-hover:text-jw-red transition-colors font-medium">
                    {sib.nombre}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-jw-gray-400 group-hover:text-jw-red group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}