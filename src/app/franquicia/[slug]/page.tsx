import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { existsSync } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/product-card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { WHATSAPP_LINK } from "@/lib/constants";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

export const dynamic = "force-dynamic";

function publicFileExists(url: string | null): string | null {
  if (!url) return null;
  try {
    return existsSync(path.join(process.cwd(), "public", url)) ? url : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const franchise = await prisma.franchise.findUnique({ where: { slug } });
  if (!franchise) return {};
  const displayName = franchise.nombre;
  return {
    title: `${displayName} | JapanWorld Toys`,
    description: `Colección completa de figuras y productos de ${displayName} en JapanWorld Toys, la gran comiquería de Tucumán.`,
  };
}

export default async function FranchisePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const franchise = await prisma.franchise.findUnique({
    where: { slug },
    include: {
      productos: {
        where: { estado: { not: "DESCONTINUADO" } },
        include: {
          imagenes: { orderBy: { orden: "asc" } },
        },
        orderBy: [{ destacado: "desc" }, { precio: "asc" }],
        take: 6, // Máximo 6 en pantalla; el resto se ve con "Ver más"
      },
    },
  });

  if (!franchise) notFound();

  const otherFranchises = await prisma.franchise.findMany({
    where: { id: { not: franchise.id } },
    include: { _count: { select: { productos: true } } },
    orderBy: { nombre: "asc" },
    take: 6,
  });

  const [productCount, minPriceAgg] = await Promise.all([
    prisma.product.count({
      where: { franquicias: { some: { id: franchise.id } }, estado: { not: "DESCONTINUADO" } },
    }),
    prisma.product.aggregate({
      where: { franquicias: { some: { id: franchise.id } }, estado: { not: "DESCONTINUADO" } },
      _min: { precio: true },
    }),
  ]);
  const hasMore = productCount > franchise.productos.length;
  const minPrice = minPriceAgg._min.precio ? Number(minPriceAgg._min.precio) : 0;

  const heroMobile = publicFileExists(franchise.imagenMobile) ?? publicFileExists(franchise.imagen);
  const heroDesktop = publicFileExists(franchise.imagen) ?? publicFileExists(franchise.imagenMobile);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Franquicias", href: "/franquicia" }, { label: franchise.nombre }]} />

      {/* Hero */}
      <div
        className="relative mt-6 mb-12 rounded-2xl overflow-hidden p-8 md:p-14 text-white min-h-[260px] md:min-h-[300px] flex items-end"
        style={{
          background: `linear-gradient(135deg, ${franchise.color || "#E10600"} 0%, #0E0E0F 100%)`,
        }}
      >
        {heroMobile && (
          <Image
            src={heroMobile}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover md:hidden"
          />
        )}
        {heroDesktop && (
          <Image
            src={heroDesktop}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover hidden md:block"
          />
        )}
        {(heroMobile || heroDesktop) && (
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20"
          />
        )}
        {/* Decorative */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none">
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-52 h-52 border-4 border-white rounded-full" />
          <div className="absolute right-28 top-10 w-20 h-20 border-2 border-white rotate-45" />
        </div>

        <div className="relative z-10">
          <span className="text-xs uppercase tracking-[0.2em] text-jw-gold font-bold mb-2 block">
            Colección oficial
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-display)]">
            {franchise.nombre}
          </h1>
          <p className="text-white/75 mt-3 max-w-lg">
            {productCount} {productCount === 1 ? "producto" : "productos"} disponibles
            {minPrice > 0 ? ` desde ${new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(minPrice)}` : ""}
          </p>
          {franchise.mensaje && (
            <p className="text-white/85 mt-2 max-w-lg text-sm">
              {franchise.mensaje}
            </p>
          )}
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-white text-jw-black text-sm font-semibold hover:bg-jw-off-white transition-colors"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Pedinos lo que falte por WhatsApp
          </a>
        </div>
      </div>

      {productCount > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-12">
            {franchise.productos.map((p) => (
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
              />
            ))}
          </div>

          {hasMore && (
            <div className="text-center">
              <a
                href={`/productos?franquicia=${franchise.slug}&todos=1`}
                className="inline-flex h-12 px-8 items-center rounded-xl border border-jw-gray-300 bg-white text-sm font-semibold text-jw-black hover:border-jw-red hover:text-jw-red transition-colors"
              >
                Ver más productos
              </a>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 mb-8">
          <p className="text-4xl mb-4">🎬</p>
          <h2 className="text-xl font-semibold text-jw-black mb-2">
            Próximamente productos de {franchise.nombre}
          </h2>
          <p className="text-jw-gray-500 mb-6 max-w-md mx-auto">
            Estamos armando la colección. ¡Seguinos en Instagram para enterarte cuándo llegan!
          </p>
          <a
            href="https://instagram.com/japanworldtoys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 px-6 items-center rounded-lg bg-jw-black text-white text-sm font-semibold hover:bg-jw-gray-700 transition-colors"
          >
            Seguir en Instagram
          </a>
        </div>
      )}

      {/* Other franchises */}
      {otherFranchises.length > 0 && (
        <div className="pt-8 border-t border-jw-gray-200">
          <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-jw-black mb-4">
            Explorá otras franquicias
          </h2>
          <div className="flex flex-wrap gap-3">
            {otherFranchises.map((f) => (
              <a
                key={f.id}
                href={`/franquicia/${f.slug}`}
                className="group flex items-center gap-2 px-4 py-2.5 rounded-lg border border-jw-gray-200 hover:border-jw-red hover:bg-jw-red/5 transition-all text-sm"
                style={{ borderLeft: `4px solid ${f.color || "#E10600"}` }}
              >
                <span className="text-jw-gray-700 group-hover:text-jw-red transition-colors font-medium">
                  {f.nombre}
                </span>
                <span className="text-xs text-jw-gray-400">
                  ({f._count.productos})
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}