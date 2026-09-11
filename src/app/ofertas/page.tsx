import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/product-card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { auth } from "@/lib/auth";
import { priceForUser } from "@/lib/price";
import { Tag, Flame } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OfertasPage() {
  const session = await auth();
  const rol = session?.user?.rol;

  // Máximo 6 ofertas en pantalla; el resto se ve con "Ver más"
  const [products, totalOfertas] = await Promise.all([
    prisma.product.findMany({
      where: { precioComparativo: { not: null } },
      include: {
        marca: true,
        categoria: { include: { parent: true } },
        imagenes: { orderBy: { orden: "asc" } },
      },
      orderBy: [{ destacado: "desc" }, { createdAt: "desc" }],
      take: 7, // 6 visibles + 1 para saber si hay más
    }),
    prisma.product.count({ where: { precioComparativo: { not: null } } }),
  ]);

  const sortedByDiscount = [...products].sort((a, b) => {
    const da = a.precioComparativo
      ? Number(a.precioComparativo) - Number(a.precio)
      : 0;
    const db = b.precioComparativo
      ? Number(b.precioComparativo) - Number(b.precio)
      : 0;
    return db - da;
  });

  const visibleProducts = sortedByDiscount.slice(0, 6);
  const hasMore = sortedByDiscount.length > 6;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Ofertas" }]} />

      {/* Hero */}
      <section className="relative mt-6 mb-12 rounded-3xl bg-gradient-to-br from-jw-red via-red-800 to-red-950 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.35) 0%, transparent 40%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.25) 0%, transparent 45%)",
          }}
        />
        <div className="relative px-8 md:px-14 py-14 md:py-20 text-white">
          <Badge variant="oferta" className="mb-4">
            <Flame className="h-3.5 w-3.5 mr-1" />
            Ofertas por tiempo limitado
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-display)] mb-4 drop-shadow">
            ¡Aprovechá las ofertas!
          </h1>
          <p className="max-w-2xl text-white/90 md:text-lg mb-8">
            Descuentos reales en figuras, Funkos, mangas y merchandising.
            Todo lo que amás, a mejores precios.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#ofertas"
              className="inline-flex items-center h-12 px-7 rounded-xl bg-white text-jw-red text-sm font-bold hover:bg-jw-off-white transition-colors shadow-lg"
            >
              <Tag className="h-4 w-4 mr-2" />
              Ver ofertas
            </a>
            <span className="inline-flex items-center h-12 px-6 rounded-xl text-sm font-semibold bg-white/10 backdrop-blur border border-white/20">
              {totalOfertas} productos en oferta
            </span>
          </div>
        </div>
      </section>

      {/* Products grid */}
      <section id="ofertas">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold font-[family-name:var(--font-display)] text-jw-black">
            Productos en oferta
          </h2>
          <span className="h-px flex-1 bg-gradient-to-r from-jw-red to-transparent"></span>
        </div>

        {sortedByDiscount.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-jw-gray-200">
            <p className="text-5xl mb-4">🏷️</p>
            <h3 className="text-xl font-semibold text-jw-black mb-2">
              No hay ofertas activas por ahora
            </h3>
            <p className="text-jw-gray-500 mb-6">
              Volvé pronto; estamos preparando grandes descuentos.
            </p>
            <a
              href="/productos"
              className="inline-flex h-11 px-6 items-center rounded-lg bg-jw-red text-white text-sm font-semibold hover:bg-jw-red-dark transition-colors"
            >
              Explorar catálogo
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {visibleProducts.map((p) => {
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
                  precioComparativoEfectivo={effective.precioComparativo ?? undefined}
                />
              );
            })}
          </div>
        )}

        {hasMore && (
          <div className="mt-10 text-center">
            <a
              href="/productos?promo=true&todos=1"
              className="inline-flex h-12 px-8 items-center rounded-xl border border-jw-gray-300 bg-white text-sm font-semibold text-jw-black hover:border-jw-red hover:text-jw-red transition-colors"
            >
              Ver más ofertas
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
