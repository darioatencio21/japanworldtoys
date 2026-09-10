import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SITE_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Franquicias" }]} />

      <div className="mt-4 mb-10">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] text-jw-black">
          Franquicias
        </h1>
        <p className="text-jw-gray-500 mt-2">
          Explorá todas nuestras colecciones por franquicia.
        </p>
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
          {[...withProducts, ...withoutProducts].map((f) => (
            <Link
              key={f.id}
              href={`/franquicia/${f.slug}`}
              className="group relative flex flex-col justify-end min-h-[120px] rounded-xl overflow-hidden p-4 text-white transition-transform hover:scale-[1.02]"
              style={{
                background: `linear-gradient(135deg, ${f.color || "#E10600"} 0%, #0E0E0F 100%)`,
              }}
            >
              <span className="text-xs uppercase tracking-[0.15em] text-white/60 font-bold mb-1">
                Colección
              </span>
              <span className="text-lg font-bold font-[family-name:var(--font-display)] leading-tight">
                {f.nombre}
              </span>
              <span className="text-xs text-white/75 mt-1">
                {f._count.productos}{" "}
                {f._count.productos === 1 ? "producto" : "productos"}
              </span>
              <span className="absolute right-3 top-3 text-xs font-semibold px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Ver →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
