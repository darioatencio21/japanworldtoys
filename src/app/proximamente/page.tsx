import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/product-card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { auth } from "@/lib/auth";
import { priceForUser } from "@/lib/price";

export const dynamic = "force-dynamic";

export default async function ProximamentePage() {
  const session = await auth();
  const rol = session?.user?.rol;

  const products = await prisma.product.findMany({
    where: { estado: "PROXIMAMENTE" },
    include: {
      marca: true,
      categoria: { include: { parent: true } },
      franquicias: true,
      imagenes: { orderBy: { orden: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Próximamente" }]} />

      {/* Hero */}
      <section className="relative mt-6 mb-12 rounded-3xl bg-gradient-to-br from-jw-black via-red-950 to-jw-red overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.3) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.2) 0%, transparent 45%)",
          }}
        />
        <div className="relative px-8 md:px-14 py-14 md:py-20 text-white">
          <Badge variant="preventa" className="mb-4">
            Lanzamientos a la vista
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-display)] mb-4 drop-shadow">
            Próximamente
          </h1>
          <p className="max-w-2xl text-white/90 md:text-lg mb-8">
            Todo lo que se viene a Japan World Toys. Reservá con anticipación
            tus figuras, Funkos y merchandising favorito antes de que lleguen.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#lanzamientos"
              className="inline-flex items-center h-12 px-7 rounded-xl bg-white text-jw-red text-sm font-bold hover:bg-jw-off-white transition-colors shadow-lg"
            >
              Ver lanzamientos
            </a>
            <span className="inline-flex items-center h-12 px-6 rounded-xl text-sm font-semibold bg-white/10 backdrop-blur border border-white/20">
              {products.length} productos en camino
            </span>
          </div>
        </div>
      </section>

      {/* Products grid */}
      <section id="lanzamientos">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold font-[family-name:var(--font-display)] text-jw-black">
            Lanzamientos próximos
          </h2>
          <span className="h-px flex-1 bg-gradient-to-r from-jw-red to-transparent"></span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-jw-gray-200">
            <p className="text-5xl mb-4">🎌</p>
            <h3 className="text-xl font-semibold text-jw-black mb-2">
              No hay lanzamientos por ahora
            </h3>
            <p className="text-jw-gray-500 mb-6">
              Volvé pronto para descubrir todo lo que estamos preparando.
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
            {products.map((p) => {
              const effective = priceForUser(p, rol);
              return (
                <div key={p.id} className="relative">
                  <ProductCard
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
                      imagenes: p.imagenes.map((img) => ({
                        url: img.url,
                        alt: img.alt,
                        esPrincipal: img.esPrincipal,
                      })),
                    }}
                    precioEfectivo={effective.precioComparativo ? effective.precio : undefined}
                    precioComparativoEfectivo={effective.precioComparativo ?? undefined}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}