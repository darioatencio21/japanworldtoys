import { prisma } from "@/lib/prisma";

export type FeaturedProductImage = {
  url: string;
  alt?: string | null;
  esPrincipal?: boolean;
};

export type FeaturedProduct = {
  id: string;
  nombre: string;
  slug: string;
  precio: number;
  precioComparativo: number | null;
  imagen: string;
  imagenes: FeaturedProductImage[];
  badge: string | null;
  stock: number;
  estado: string;
  destacado: boolean;
  esNovedad: boolean;
};

export async function getFeatured(): Promise<FeaturedProduct[]> {
  const products = await prisma.product.findMany({
    where: {
      estado: { not: "DESCONTINUADO" },
      destacado: true,
    },
    include: {
      imagenes: { orderBy: { orden: "asc" } },
    },
    orderBy: [{ destacado: "desc" }, { createdAt: "desc" }],
    take: 6,
  });

  if (products.length === 0) return [];

  return products.map((p) => {
    let badge: string | null = null;
    if (p.esNovedad) badge = "NUEVO";
    else if (p.estado === "AGOTADO") badge = "SIN STOCK";
    else if (p.estado === "PREVENTA") badge = "PREVENTA";
    else if (p.estado === "PROXIMAMENTE") badge = "PROXIMAMENTE";
    else if (p.precioComparativo) badge = "OFERTA";

    const imagenes = p.imagenes.map((img) => ({
      url: img.url,
      alt: img.alt,
      esPrincipal: img.esPrincipal,
    }));

    return {
      id: p.id,
      nombre: p.nombre,
      slug: p.slug,
      precio: Number(p.precio),
      precioComparativo: p.precioComparativo ? Number(p.precioComparativo) : null,
      imagen: imagenes[0]?.url || "/images/placeholders/figure-placeholder.svg",
      imagenes,
      badge,
      stock: p.stock,
      estado: p.estado,
      destacado: p.destacado,
      esNovedad: p.esNovedad,
    };
  });
}
