import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product/product-card";
import { ArrowRight, Truck, Shield, CreditCard, Store } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getFeatured } from "@/lib/featured-products";
import { HomeHero } from "@/components/home/home-hero";

const CATEGORIES = [
  { nombre: "Funkos", slug: "figuras/funkos", image: "/images/categorias/funkos.png" },
  { nombre: "Peluches", slug: "peluches", image: "/images/categorias/peluches.png" },
  { nombre: "Mangas", slug: "mangas", image: "/images/categorias/mangas.png" },
  { nombre: "Sanrio", slug: "sanrio", image: "/images/categorias/sanrio.png" },
  { nombre: "Comics", slug: "comics", image: "/images/categorias/comics.png" },
  { nombre: "Figuras", slug: "figuras", image: "/images/categorias/figuras.png" },
];

// URL de la imagen del producto que irá dentro del círculo de cada tarjeta promocional
const DEMON_SLAYER_PRODUCT_IMAGE = "";
const SANRIO_PRODUCT_IMAGE = "";

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

  const heroSlides = banners.map((b) => ({
    id: b.id,
    titulo: b.titulo,
    subtitulo: b.subtitulo,
    imagenDesktop: b.imagenDesktop,
    imagenMobile: b.imagenMobile,
    textoCTA: b.textoCTA,
    linkCTA: b.linkCTA,
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
                  src="/images/categorias/fondo-redondo.png"
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

      {/* ─── PROMO BLOCKS ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Block 1 */}
          <div
            className="group relative rounded-2xl overflow-hidden p-8 md:p-10 text-white aspect-[1080/450] flex items-center bg-[length:100%] hover:bg-[length:104%] transition-[background-size] duration-700 ease-out"
            style={{
              backgroundImage: "url('/img/banners/bg_card_demonslayer.png')",
              backgroundPosition: "center",
            }}
          >
            {/* Scrim oscuro para que las letras se vean sólidas */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/45 via-black/20 to-transparent"
            />
            <div className="relative z-10 max-w-xs">
              <Badge variant="gold" className="mb-3">COLECCIÓN</Badge>
              <h3 className="text-2xl font-bold font-[family-name:var(--font-display)] mb-2 drop-shadow-[0_2px_5px_rgba(0,0,0,0.7)]">
                Demon Slayer
              </h3>
              <p className="text-white/90 text-sm mb-6 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                Figuras exclusivas de Kimetsu no Yaiba — Tanjiro, Nezuko, Zenitsu y más.
              </p>
              <Button variant="gold" asChild>
                <Link href="/franquicia/demon-slayer">Explorar colección</Link>
              </Button>
            </div>
            {/* Círculo de producto (calza sobre el círculo del fondo) */}
            <div className="absolute right-[5%] top-1/2 -translate-y-1/2 aspect-square w-[38%] overflow-hidden rounded-full flex items-center justify-center">
              {DEMON_SLAYER_PRODUCT_IMAGE && (
                <img
                  src={DEMON_SLAYER_PRODUCT_IMAGE}
                  alt="Figura de Demon Slayer"
                  className="h-full w-full animate-float object-contain"
                />
              )}
            </div>
          </div>

          {/* Block 2 */}
          <div
            className="group relative rounded-2xl overflow-hidden p-8 md:p-10 text-white aspect-[1080/450] flex items-center bg-[length:100%] hover:bg-[length:104%] transition-[background-size] duration-700 ease-out"
            style={{
              backgroundImage: "url('/img/banners/bg_card_sanrio.png')",
              backgroundPosition: "center",
            }}
          >
            {/* Scrim oscuro para que las letras se vean sólidas */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/45 via-black/20 to-transparent"
            />
            <div className="relative z-10 max-w-xs">
              <Badge variant="gold" className="mb-3">SANRIO</Badge>
              <h3 className="text-2xl font-bold font-[family-name:var(--font-display)] mb-2 drop-shadow-[0_2px_5px_rgba(0,0,0,0.7)]">
                Hello Kitty & Friends
              </h3>
              <p className="text-white/90 text-sm mb-6 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                Peluches, figuras y accesorios de Sanrio — ediciones limitadas disponibles.
              </p>
              <Button variant="gold" asChild>
                <Link href="/productos/sanrio">Ver Sanrio</Link>
              </Button>
            </div>
            {/* Círculo de producto (calza sobre el círculo del fondo) */}
            <div className="absolute right-[5%] top-1/2 -translate-y-1/2 aspect-square w-[38%] overflow-hidden rounded-full flex items-center justify-center">
              {SANRIO_PRODUCT_IMAGE && (
                <img
                  src={SANRIO_PRODUCT_IMAGE}
                  alt="Peluche de Sanrio"
                  className="h-full w-full animate-float object-contain"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST BAR ──────────────────────────── */}
      <section className="bg-jw-off-white border-y border-jw-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: "Envíos a todo el país", desc: "Por Correo Argentino" },
              { icon: Store, title: "Retiro en el local", desc: "Sin costo en San Martín 650" },
              { icon: CreditCard, title: "Hasta 12 cuotas", desc: "Con todas las tarjetas" },
              { icon: Shield, title: "Compra segura", desc: "Mercado Pago / Transferencia" },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-jw-red/10 flex items-center justify-center">
                  <item.icon className="h-6 w-6 text-jw-red" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-jw-black">{item.title}</p>
                  <p className="text-xs text-jw-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
