import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { priceForUser } from "@/lib/price";
import { ProductGallery } from "@/components/product/product-gallery-full";
import { ProductInfo } from "@/components/product/product-info";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { RelatedProducts } from "@/components/product/related-products";
import { SITE_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      nombre: true,
      descripcion: true,
      metaTitle: true,
      metaDescription: true,
      precio: true,
      imagenes: {
        orderBy: { orden: "asc" },
        take: 1,
        select: { url: true },
      },
    },
  });

  if (!product) return {};
  const mainImage = product.imagenes[0]?.url;

  return {
    title: product.metaTitle || product.nombre,
    description: product.metaDescription || product.descripcion?.slice(0, 155) || undefined,
    openGraph: {
      title: product.metaTitle || product.nombre,
      description: product.metaDescription || undefined,
      images: mainImage ? [{ url: mainImage }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      marca: true,
      categoria: { include: { parent: true } },
      franquicias: true,
      imagenes: { orderBy: { orden: "asc" } },
      reviews: {
        where: { aprobado: true },
        include: { user: { select: { nombre: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) notFound();

  const session = await auth();
  const effective = priceForUser(product, session?.user?.rol);

  const related = await prisma.product.findMany({
    where: {
      estado: { not: "DESCONTINUADO" },
      OR: [
        { categoriaId: product.categoriaId },
        { franquicias: { some: { id: { in: product.franquicias.map((f) => f.id) } } } },
      ],
      id: { not: product.id },
    },
    include: {
      imagenes: { orderBy: { orden: "asc" } },
    },
    orderBy: [{ destacado: "desc" }, { createdAt: "desc" }],
    take: 6,
  });

  const breadcrumbs = [
    { label: "Productos", href: "/productos" },
    ...(product.categoria?.parent
      ? [
          { label: product.categoria.parent.nombre, href: `/productos/${product.categoria.parent.slug}` },
        ]
      : []),
    { label: product.categoria?.nombre || "Producto", href: product.categoria ? `/productos/${product.categoria.slug}` : undefined },
    { label: product.nombre },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbs} className="mb-8" />

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* Gallery */}
        <ProductGallery
          images={product.imagenes.map((img) => ({
            url: img.url,
            alt: img.alt || product.nombre,
          }))}
          nombre={product.nombre}
        />

        {/* Info */}
        <ProductInfo
          product={{
            id: product.id,
            nombre: product.nombre,
            slug: product.slug,
            descripcion: product.descripcion,
            precio: Number(product.precio),
            precioComparativo: product.precioComparativo
              ? Number(product.precioComparativo)
              : undefined,
            stock: product.stock,
            estado: product.estado,
            marca: product.marca?.nombre,
            categoria: product.categoria?.nombre,
            imagenPrincipal: product.imagenes[0]?.url,
            franquicias: product.franquicias.map((f) => ({
              nombre: f.nombre,
              slug: f.slug,
            })),
            reviewCount: product.reviews.length,
            averageRating: product.reviews.length
              ? product.reviews.reduce((acc, r) => acc + r.puntuacion, 0) /
                product.reviews.length
              : 0,
            reviews: product.reviews.map((r) => ({
              id: r.id,
              nombre: r.user.nombre,
              puntuacion: r.puntuacion,
              titulo: r.titulo,
              comentario: r.comentario,
              fecha: r.createdAt,
            })),
          }}
          precioEfectivo={effective.precioComparativo ? effective.precio : undefined}
          precioComparativoEfectivo={effective.precioComparativo ?? undefined}
        />
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <RelatedProducts
          products={related.map((p) => ({
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
          }))}
          precioEfectivos={Object.fromEntries(
            related.map((p) => {
              const eff = priceForUser(p, session?.user?.rol);
              return [
                p.id,
                {
                  precio: eff.precioComparativo ? eff.precio : undefined,
                  precioComparativo: eff.precioComparativo ?? null,
                },
              ];
            })
          )}
        />
      )}

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.nombre,
            description: product.descripcion,
            sku: product.sku,
            image: product.imagenes.map((img) => `${process.env.NEXT_PUBLIC_APP_URL || ""}${img.url}`),
            brand: product.marca ? { "@type": "Brand", name: product.marca.nombre } : undefined,
            offers: {
              "@type": "Offer",
              url: `${process.env.NEXT_PUBLIC_APP_URL || ""}/producto/${product.slug}`,
              priceCurrency: "ARS",
              price: Number(product.precio),
              availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              seller: { "@type": "Organization", name: SITE_NAME },
            },
          }),
        }}
      />
    </div>
  );
}