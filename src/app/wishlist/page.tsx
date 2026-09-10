import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/product-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="h-20 w-20 rounded-full bg-jw-off-white flex items-center justify-center mx-auto mb-6">
          <Heart className="h-10 w-10 text-jw-gray-300" />
        </div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-jw-black mb-2">
          Tu lista de favoritos
        </h1>
        <p className="text-jw-gray-500 mb-8 max-w-md mx-auto">
          Inicia sesión para guardar tus figuras favoritas y seguirlas cuando quieras.
        </p>
        <Button size="lg" asChild>
          <Link href="/login?callbackUrl=/wishlist">Iniciar sesión</Link>
        </Button>
      </div>
    );
  }

  const wishlist = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { imagenes: { orderBy: { orden: "asc" } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-6 w-6 text-jw-red" />
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-jw-black">
            Mis favoritos
          </h1>
          <p className="text-sm text-jw-gray-500">
            {wishlist.length} {wishlist.length === 1 ? "producto guardado" : "productos guardados"}
          </p>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white rounded-2xl border border-jw-gray-200 p-16 text-center">
          <p className="text-4xl mb-4">💖</p>
          <p className="font-semibold text-jw-black mb-2">Tu lista está vacía</p>
          <p className="text-sm text-jw-gray-500 mb-6">
            Tocá el corazón en cualquier figura para guardarla acá.
          </p>
          <Button asChild>
            <Link href="/productos">Explorar productos</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {wishlist.map((item) => (
            <ProductCard
              key={item.id}
              product={{
                id: item.product.id,
                nombre: item.product.nombre,
                slug: item.product.slug,
                precio: Number(item.product.precio),
                precioComparativo: item.product.precioComparativo
                  ? Number(item.product.precioComparativo)
                  : undefined,
                stock: item.product.stock,
                estado: item.product.estado,
                destacado: item.product.destacado,
                esNovedad: item.product.esNovedad,
                imagenes: item.product.imagenes.map((img) => ({
                  url: img.url,
                  alt: img.alt,
                  esPrincipal: img.esPrincipal,
                })),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}