import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "./product-card";

export function RelatedProducts({
  products,
  precioEfectivos,
  title = "También te puede interesar",
}: {
  products: {
    id: string;
    nombre: string;
    slug: string;
    precio: number;
    precioComparativo?: number | null;
    stock: number;
    estado: string;
    destacado: boolean;
    esNovedad?: boolean;
    imagenes: { url: string; alt?: string | null; esPrincipal?: boolean }[];
  }[];
  precioEfectivos?: Record<string, { precio?: number; precioComparativo?: number | null }>;
  title?: string;
}) {
  return (
    <section className="mt-12 mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-display)] text-jw-black">
          {title}
        </h2>
        <Link
          href="/productos"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-jw-red hover:gap-2.5 transition-all"
        >
          Ver todo
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Horizontal scroll-snap carousel */}
      <div className="scroll-snap-x overflow-x-auto hide-scrollbar flex gap-4 md:gap-6 pb-2 -mx-4 px-4">
        {products.map((product) => {
          const eff = precioEfectivos?.[product.id];
          return (
            <div key={product.id} className="flex-shrink-0 w-[45vw] sm:w-[260px] lg:w-[280px] scroll-snap-align">
              <ProductCard
                product={{
                  id: product.id,
                  nombre: product.nombre,
                  slug: product.slug,
                  precio: product.precio,
                  precioComparativo: product.precioComparativo
                    ? Number(product.precioComparativo)
                    : undefined,
                  stock: product.stock,
                  estado: product.estado,
                  destacado: product.destacado,
                  esNovedad: product.esNovedad,
                  imagenes: product.imagenes.map((img) => ({
                    url: img.url,
                    alt: img.alt,
                    esPrincipal: img.esPrincipal,
                  })),
                }}
                precioEfectivo={eff?.precio}
                precioComparativoEfectivo={eff?.precioComparativo ?? undefined}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}