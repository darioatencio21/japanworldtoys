import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/product-card";
import { CatalogFilters, SortSelect, type FilterGroup } from "@/components/product/catalog-filters";
import { CategoryTabs, type CategoryTab } from "@/components/product/category-tabs";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/auth";

import { priceForUser } from "@/lib/price";

export const dynamic = "force-dynamic";

const CATEGORY_TABS: CategoryTab[] = [
  { label: "Comics", slug: "comics", image: "/images/categorias/comics.webp" },
  { label: "Figuras", slug: "figuras", image: "/images/categorias/figuras.webp" },
  { label: "Funkos", slug: "funkos", image: "/images/categorias/funkos.webp" },
  { label: "Mangas", slug: "mangas", image: "/images/categorias/mangas.webp" },
  { label: "Peluches", slug: "peluches", image: "/images/categorias/peluches.webp" },
  { label: "Sanrio", slug: "sanrio", image: "/images/categorias/sanrio.webp" },
];

const SORT_OPTIONS = [
  { value: "destacados", label: "Destacados" },
  { value: "precio-asc", label: "Menor precio" },
  { value: "precio-desc", label: "Mayor precio" },
  { value: "nuevos", label: "Más recientes" },
  { value: "nombre-asc", label: "Nombre A-Z" },
];

function getFilterCondition(params: URLSearchParams) {
  const where: Record<string, unknown> = {};
  const andConditions: Record<string, unknown>[] = [];

  const search = params.get("q")?.trim().slice(0, 70) ?? null;
  if (search) {
    const terms = search.trim().split(/\s+/).filter(Boolean).slice(0, 5);
    if (terms.length > 0) {
      where.OR = terms.map((term) => ({
        OR: [
          { nombre: { contains: term, mode: "insensitive" } },
          { descripcion: { contains: term, mode: "insensitive" } },
          { sku: { contains: term, mode: "insensitive" } },
          { marca: { is: { nombre: { contains: term, mode: "insensitive" } } } },
          {
            franquicias: {
              some: { nombre: { contains: term, mode: "insensitive" } } },
          },
          { categoria: { is: { nombre: { contains: term, mode: "insensitive" } } } },
        ],
      }));
    }
  }

  const categoria = params.get("categoria");
  if (categoria) {
    const cats = categoria.split(",").filter(Boolean);
    if (cats.length === 1) {
      andConditions.push({
        categoria: { OR: [{ slug: cats[0] }, { parent: { slug: cats[0] } }] },
      });
    } else if (cats.length > 1) {
      andConditions.push({
        OR: [
          { categoria: { slug: { in: cats } } },
          { categoria: { parent: { slug: { in: cats } } } },
        ],
      });
    }
  }

  const marca = params.get("marca");
  if (marca) {
    const marcaList = marca.split(",").filter(Boolean);
    where.marca = { slug: { in: marcaList } };
  }

  const franquicia = params.get("franquicia");
  if (franquicia) {
    const franquiciaList = franquicia.split(",").filter(Boolean);
    where.franquicias = { some: { slug: { in: franquiciaList } } };
  }

  const estado = params.get("estado");
  if (estado) {
    where.estado = { in: estado.split(",").map((e) => e.toUpperCase()) };
  }

  const promo = params.get("promo");
  if (promo === "true") {
    where.precioComparativo = { not: null };
  }

  const precioMin = params.get("precioMin");
  if (precioMin) where.precio = { ...(where.precio || {}), gte: Number(precioMin) };
  const precioMax = params.get("precioMax");
  if (precioMax) where.precio = { ...(where.precio || {}), lte: Number(precioMax) };

  if (andConditions.length > 0) where.AND = andConditions;

  return where;
}

function getOrderBy(orden: string | null) {
  switch (orden) {
    case "precio-asc":
      return [{ precio: "asc" as const }];
    case "precio-desc":
      return [{ precio: "desc" as const }];
    case "nuevos":
      return [{ createdAt: "desc" as const }];
    case "nombre-asc":
      return [{ nombre: "asc" as const }];
    default:
      return [{ destacado: "desc" as const }, { createdAt: "desc" as const }];
  }
}

async function getCatalog() {
  const [categories, brands, franchises, totalProducts] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      include: { children: true },
      orderBy: { orden: "asc" },
    }),
    prisma.brand.findMany({
      orderBy: { nombre: "asc" },
      include: { _count: { select: { productos: true } } },
    }),
    prisma.franchise.findMany({
      orderBy: { nombre: "asc" },
      include: { _count: { select: { productos: true } } },
    }),
    prisma.product.count(),
  ]);

  return { categories, brands, franchises, totalProducts };
}

async function getProducts(searchParams: URLSearchParams) {
  const where = getFilterCondition(searchParams);
  const orderBy = getOrderBy(searchParams.get("orden"));
  const showAll = searchParams.get("todos") === "1";

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        marca: true,
        categoria: {
          include: { parent: true },
        },
        imagenes: { orderBy: { orden: "asc" } },
      },
      orderBy,
      // 6 visibles + 1 para saber si hay más; con ?todos=1 se muestran todos
      take: showAll ? 48 : 7,
    }),
    prisma.product.count({ where }),
  ]);

  if (showAll) return { products, total, hasMore: false };

  return { products: products.slice(0, 6), total, hasMore: products.length > 6 };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(resolvedParams)) {
    if (value) params.set(key, Array.isArray(value) ? value.join(",") : value);
  }

  const [{ categories, brands, franchises, totalProducts }, { products, total, hasMore }] =
    await Promise.all([getCatalog(), getProducts(params)]);

  const session = await auth();
  const rol = session?.user?.rol;

  const marcaCountMap = Object.fromEntries(
    brands.map((b) => [b.slug, b._count.productos])
  );
  const franchiseCountMap = Object.fromEntries(
    franchises.map((f) => [f.slug, f._count.productos])
  );
  const allProductsCount = await prisma.product.count();

  const filterGroups: FilterGroup[] = [
    {
      key: "categoria",
      label: "Categoría",
      options: categories.map((c) => ({
        value: c.slug,
        label: c.nombre,
        count: undefined,
      })),
    },
    {
      key: "marca",
      label: "Marca",
      options: brands.map((b) => ({
        value: b.slug,
        label: b.nombre,
        count: marcaCountMap[b.slug],
      })),
    },
    {
      key: "franquicia",
      label: "Franquicia",
      options: franchises.map((f) => ({
        value: f.slug,
        label: f.nombre,
        count: franchiseCountMap[f.slug],
      })),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Productos" }]} />

      {/* Title */}
      <div className="mt-4 mb-8">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] text-jw-black">
          Todos los productos
        </h1>
        <p className="text-jw-gray-500 mt-2">
          {total} productos en {totalProducts} disponibles en catálogo
        </p>
      </div>

      {/* Category tabs */}
      <div className="mb-8">
        <Suspense fallback={<Skeleton className="h-32 w-full" />}>
          <CategoryTabs tabs={CATEGORY_TABS} />
        </Suspense>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-28 bg-white rounded-xl border border-jw-gray-200 p-5">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <CatalogFilters
                groups={filterGroups}
                sortOptions={SORT_OPTIONS}
              />
            </Suspense>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 relative">
          {/* Toolbar mobile: filtros + ordenar */}
          <div className="lg:hidden mb-4">
            <Suspense fallback={<Skeleton className="h-9 w-40" />}>
              <CatalogFilters
                groups={filterGroups}
                sortOptions={SORT_OPTIONS}
              />
            </Suspense>
          </div>

          {/* Sort - Desktop */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <Badge variant="outline">{total} resultados</Badge>
            <Suspense fallback={null}>
              <SortSelect options={SORT_OPTIONS} />
            </Suspense>
          </div>

          {/* Grid */}
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <h2 className="text-xl font-semibold text-jw-black mb-2">
                No encontramos productos
              </h2>
              <p className="text-jw-gray-500 mb-6">
                Probá con otros filtros o explorá todo nuestro catálogo.
              </p>
              <a
                href="/productos"
                className="inline-flex h-11 px-6 items-center rounded-lg bg-jw-red text-white text-sm font-semibold hover:bg-jw-red-dark transition-colors"
              >
                Ver todos los productos
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map((p) => {
                const effective = priceForUser(p, rol);
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
                    precioComparativoEfectivo={
                      effective.precioComparativo ?? undefined
                    }
                  />
                );
              })}
            </div>
          )}

          {hasMore && (
            <div className="mt-10 text-center">
              <a
                href={`/productos?${(() => {
                  const q = new URLSearchParams(params);
                  q.set("todos", "1");
                  return q.toString();
                })()}`}
                className="inline-flex h-12 px-8 items-center rounded-xl border border-jw-gray-300 bg-white text-sm font-semibold text-jw-black hover:border-jw-red hover:text-jw-red transition-colors"
              >
                Ver más productos
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}