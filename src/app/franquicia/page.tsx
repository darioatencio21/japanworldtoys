import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { existsSync } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SITE_NAME } from "@/lib/constants";
import { MoveRight } from "lucide-react";

export const dynamic = "force-dynamic";

function publicFileExists(url: string | null): string | null {
  if (!url) return null;
  try {
    return existsSync(path.join(process.cwd(), "public", url)) ? url : null;
  } catch {
    return null;
  }
}

export const metadata: Metadata = {
  title: `Franquicias | ${SITE_NAME}`,
  description:
    "Explorá todas las franquicias disponibles en JapanWorld Toys: One Piece, Naruto, Dragon Ball, Demon Slayer y más.",
};

export default async function FranchisesPage() {
  const franchises = await prisma.franchise.findMany({
    include: {
      _count: {
        select: {
          productos: { where: { estado: { not: "DESCONTINUADO" } } },
        },
      },
    },
    orderBy: [{ nombre: "asc" }],
  });

  const withProducts = franchises.filter((f) => f._count.productos > 0);
  const withoutProducts = franchises.filter((f) => f._count.productos === 0);

  const cards = [...withProducts, ...withoutProducts].map((f) => ({
    ...f,
    imagen: publicFileExists(f.imagen),
    imagenMobile: publicFileExists(f.imagenMobile),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Franquicias" }]} />

      {/* Header */}
      <div className="mt-6 mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-jw-red mb-3">
            <span className="h-px w-10 bg-jw-red" />
            Colecciones
          </span>
          <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] text-jw-black">
            Franquicias
          </h1>
          <p className="text-jw-gray-500 mt-2 max-w-xl">
            Explorá todas nuestras colecciones por franquicia.
          </p>
        </div>
        <span className="shrink-0 self-start md:self-auto inline-flex items-center gap-2 rounded-full bg-jw-off-white border border-jw-gray-200 px-4 py-2 text-sm font-medium text-jw-gray-700">
          <span className="h-2 w-2 rounded-full bg-jw-red animate-pulse" />
          {cards.length} {cards.length === 1 ? "franquicia" : "franquicias"}
        </span>
      </div>

      {franchises.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🎬</p>
          <h2 className="text-xl font-semibold text-jw-black mb-2">
            Próximamente
          </h2>
          <p className="text-jw-gray-500">
            Estamos armando las colecciones. ¡Volvé en un rato!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {cards.map((f) => {
            const mobile = f.imagenMobile || f.imagen;
            const desktop = f.imagen || f.imagenMobile;
            const hasProducts = f._count.productos > 0;
            return (
              <Link
                key={f.id}
                href={`/franquicia/${f.slug}`}
                className="group relative flex flex-col justify-end aspect-[4/5] min-h-[200px] rounded-2xl overflow-hidden p-4 md:p-5 text-white shadow-md ring-1 ring-black/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jw-red focus-visible:ring-offset-2"
                style={{
                  background: `linear-gradient(160deg, ${f.color || "#E10600"} 0%, #0E0E0F 90%)`,
                }}
              >
                {mobile && (
                  <Image
                    src={mobile}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] md:hidden"
                  />
                )}
                {desktop && (
                  <Image
                    src={desktop}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] hidden md:block"
                  />
                )}
                {(mobile || desktop) && (
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10"
                  />
                )}

                {/* Letra decorativa para franquicias sin imagen */}
                {!(mobile || desktop) && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-3 -bottom-8 select-none text-[130px] leading-none font-bold text-white/10 font-[family-name:var(--font-display)]"
                  >
                    {f.nombre.charAt(0)}
                  </span>
                )}

                {/* Badge "Ver" siempre visible */}
                <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 px-2.5 py-1 text-[11px] font-semibold text-white transition-all duration-300 group-hover:bg-white group-hover:text-jw-black">
                  Ver
                  <MoveRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>

                {/* Badge para franquicias sin productos */}
                {!hasProducts && (
                  <span className="absolute left-3 top-3 z-10 rounded-full bg-jw-gold px-2.5 py-1 text-[11px] font-bold text-jw-black">
                    Próximamente
                  </span>
                )}

                <div className="relative z-10">
                  <span className="block text-[10px] uppercase tracking-[0.2em] text-jw-gold font-bold mb-1.5">
                    Colección
                  </span>
                  <h2 className="text-lg md:text-xl leading-tight font-bold font-[family-name:var(--font-display)] line-clamp-2">
                    {f.nombre}
                  </h2>
                  <span className="mt-2 block text-xs font-medium text-white/80">
                    {hasProducts
                      ? `${f._count.productos} ${f._count.productos === 1 ? "producto" : "productos"}`
                      : "En camino"}
                  </span>
                  {f.mensaje && (
                    <span className="mt-1.5 hidden md:block text-[11px] leading-snug text-white/70 line-clamp-2">
                      {f.mensaje}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}