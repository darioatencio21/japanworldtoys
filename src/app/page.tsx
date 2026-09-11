import Link from "next/link";
import Image from "next/image";
import { existsSync } from "node:fs";
import path from "node:path";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product/product-card";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getFeatured } from "@/lib/featured-products";
import { HomeHero } from "@/components/home/home-hero";

function publicFileExists(url: string | null): string | null {
  if (!url) return null;
  try {
    return existsSync(path.join(process.cwd(), "public", url)) ? url : null;
  } catch {
    return null;
  }
}

const CATEGORIES = [
  { nombre: "Funkos", slug: "figuras/funkos", image: "/images/categorias/funkos.webp" },
  { nombre: "Peluches", slug: "peluches", image: "/images/categorias/peluches.webp" },
  { nombre: "Mangas", slug: "mangas", image: "/images/categorias/mangas.webp" },
  { nombre: "Sanrio", slug: "sanrio", image: "/images/categorias/sanrio.webp" },
  { nombre: "Comics", slug: "comics", image: "/images/categorias/comics.webp" },
  { nombre: "Figuras", slug: "figuras", image: "/images/categorias/figuras.webp" },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const now = new Date();

  const featured = await getFeatured();

  const banners = await prisma.banner.findMany({
    where: {
      tipo: "hero",
      activo: true,
      AND: [
        { OR: [{ activoDesde: null }, { activoDesde: { lte: now } }] },
        { OR: [{ activoHasta: null }, { activoHasta: { gte: now } }] },
      ],
    },
    orderBy: [{ orden: "asc" }, { createdAt: "desc" }],
  });

  const heroSlides = banners.map((b) => {
    // Solo usamos imágenes que existen en /public (evita 400 en /_next/image
    // cuando el admin dejó una ruta mobile que nunca se subió)
    const desktop = publicFileExists(b.imagenDesktop) ?? publicFileExists(b.imagenMobile);
    const mobile = publicFileExists(b.imagenMobile) ?? desktop;
    return {
      id: b.id,
      titulo: b.titulo,
      subtitulo: b.subtitulo,
      imagenDesktop: desktop,
      imagenMobile: mobile,
      textoCTA: b.textoCTA,
      linkCTA: b.linkCTA,
    };
  });

  const promoBlocksRaw = await prisma.promoBlock.findMany({
    where: { activo: true },
    orderBy: [{ orden: "asc" }, { createdAt: "desc" }],
  });

  // Solo renderizamos imágenes que existen en /public (evita 404 y layouts rotos)
  const promoBlocks = promoBlocksRaw.map((b) => ({
    ...b,
    backgroundImage: publicFileExists(b.backgroundImage),
    backgroundImageMobile: publicFileExists(b.backgroundImageMobile),
  }));

  return (
    <div>
      {/* ─── HERO CAROUSEL (desde banners) ──────── */}
      <HomeHero slides={heroSlides} />

      {/* ─── CATEGORIES GRID ────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)]">
            Explorá por categoría
          </h2>
          <p className="text-jw-gray-500 mt-2">
            Encontrá todo lo que buscás, organizado para vos
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/productos/${cat.slug}`}
              className="group flex flex-col items-center gap-3"
            >
              <div className="relative h-36 w-36 sm:h-40 sm:w-40 rounded-full overflow-hidden bg-white shadow-md ring-1 ring-jw-gray-200 transition-transform duration-200 group-hover:scale-105 group-hover:shadow-xl">
                {/* Circular background */}
                <Image
                  src="/images/categorias/fondo-redondo.webp"
                  alt=""
                  fill
                  sizes="(max-width: 640px) 144px, 160px"
                  className="object-cover"
                />
                {/* Category image in front */}
                <Image
                  src={cat.image}
                  alt={cat.nombre}
                  fill
                  sizes="(max-width: 640px) 144px, 160px"
                  className="object-contain scale-90 p-2 transition-transform duration-200 group-hover:scale-95"
                />
              </div>
              <span className="text-sm font-semibold text-jw-black group-hover:text-jw-red transition-colors text-center">
                {cat.nombre}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ──────────────────── */}
      <section className="bg-jw-off-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)]">
                Elegidos para vos
              </h2>
              <p className="text-jw-gray-500 mt-1">
                Las figuras más buscadas por nuestros clientes
              </p>
            </div>
            <Button variant="outline" asChild className="hidden sm:inline-flex">
              <Link href="/productos" className="inline-flex items-center gap-2">
                Ver todo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  nombre: product.nombre,
                  slug: product.slug,
                  precio: product.precio,
                  precioComparativo: product.precioComparativo ?? undefined,
                  stock: product.stock,
                  estado: product.estado,
                  destacado: product.destacado,
                  esNovedad: product.esNovedad,
                  imagenes: product.imagenes,
                }}
              />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/productos" className="inline-flex items-center gap-2">
                Ver todos los productos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── PROMO BLOCKS (desde DB) ─────────────── */}
      {promoBlocks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-6">
            {promoBlocks.map((block) => {
              const mobileBg = block.backgroundImageMobile || block.backgroundImage;
              return (
              <div
                key={block.id}
                className="group relative rounded-2xl overflow-hidden p-5 sm:p-8 md:p-10 text-white min-h-[270px] sm:min-h-[300px] md:min-h-0 md:aspect-[12/5] flex items-end md:items-center bg-gradient-to-br from-jw-gray-900 via-jw-gray-700 to-jw-black"
              >
                {/* Fondo mobile */}
                {mobileBg && (
                  <Image
                    src={mobileBg}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] md:hidden"
                  />
                )}
                {/* Fondo desktop */}
                {block.backgroundImage && (
                  <Image
                    src={block.backgroundImage}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] hidden md:block"
                  />
                )}
                {/* Scrim oscuro para que las letras se vean sólidas */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black/60"
                />
                <div className="relative z-10 max-w-[90%] md:max-w-xl lg:max-w-md">
                  {block.badge && (
                    <Badge variant="gold" className="mb-2 sm:mb-3">{block.badge}</Badge>
                  )}
                  <h3 className="text-lg sm:text-2xl font-bold font-[family-name:var(--font-display)] mb-1.5 sm:mb-2 drop-shadow-[0_2px_5px_rgba(0,0,0,0.7)]">
                    {block.titulo}
                  </h3>
                  {block.descripcion && (
                    <p className="text-white/90 text-sm mb-4 sm:mb-6 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                      {block.descripcion}
                    </p>
                  )}
                  {block.textoCTA && block.linkCTA && (
                    <Button variant="gold" size="sm" className="sm:h-10 sm:px-6 sm:text-sm" asChild>
                      <Link href={block.linkCTA}>{block.textoCTA}</Link>
                    </Button>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── TRUST BAR ──────────────────────────── */}
      <section className="relative bg-jw-black border-y border-jw-gray-200 overflow-hidden">
        {/* Fondo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-[url('/images/envios/fondo-envios-mobile.webp')] md:bg-[url('/images/envios/fondo-envios.webp')]"
          aria-hidden
        />

        <div className="relative w-full px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 items-center">
            {[
              { src: "/images/envios/envios-a-todo-el-pais.webp", size: "w-[72%] md:w-[55%]" },
              { src: "/images/envios/retiro-en-el-local.webp", size: "w-[66%] md:w-[48%]" },
              { src: "/images/envios/hasta-12-cuotas.webp", size: "w-[72%] md:w-[55%]" },
              { src: "/images/envios/compra-segura.webp", size: "w-[72%] md:w-[55%]" },
            ].map((item, i) => (
              <div key={item.src} className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt=""
                  className={`${item.size} animate-float-sm object-contain`}
                  style={{ animationDelay: `${i * 0.6}s` }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
