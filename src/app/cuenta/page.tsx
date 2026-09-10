import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  PackageX,
  Heart,
  TrendingUp,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

const ESTADO_LABEL: Record<string, string> = {
  NUEVO: "Nuevo",
  PAGADO: "Pagado",
  PREPARANDO: "En preparación",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
  DEVUELTO: "Devuelto",
};

export default async function AccountDashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const [orders, wishlistCount] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.wishlistItem.count({ where: { userId: session.user.id } }),
  ]);

  const totalSpent = orders
    .filter((o) => ["PAGADO", "PREPARANDO", "ENVIADO", "ENTREGADO"].includes(o.estado))
    .reduce((acc, o) => acc + Number(o.total), 0);
  const activeOrders = orders.filter(
    (o) => !["CANCELADO", "DEVUELTO", "ENTREGADO"].includes(o.estado)
  ).length;

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-jw-gray-200 p-5">
          <Package className="h-5 w-5 text-jw-red mb-2" />
          <p className="text-2xl font-bold text-jw-black">{orders.length}</p>
          <p className="text-xs text-jw-gray-500">Pedidos totales</p>
        </div>
        <div className="bg-white rounded-2xl border border-jw-gray-200 p-5">
          <PackageX className="h-5 w-5 text-jw-red mb-2" />
          <p className="text-2xl font-bold text-jw-black">{activeOrders}</p>
          <p className="text-xs text-jw-gray-500">Pedidos activos</p>
        </div>
        <div className="bg-white rounded-2xl border border-jw-gray-200 p-5 col-span-2 md:col-span-1">
          <TrendingUp className="h-5 w-5 text-jw-red mb-2" />
          <p className="text-2xl font-bold text-jw-black">
            {formatPrice(totalSpent)}
          </p>
          <p className="text-xs text-jw-gray-500">Total gastado</p>
        </div>
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-jw-black">
            Pedidos recientes
          </h2>
          {orders.length > 0 && (
            <Link
              href="/cuenta/pedidos"
              className="inline-flex items-center gap-1 text-sm font-semibold text-jw-red hover:gap-2 transition-all"
            >
              Ver todos
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-jw-gray-200 p-10 text-center">
            <div className="h-14 w-14 rounded-full bg-jw-off-white flex items-center justify-center mx-auto mb-4">
              <Package className="h-7 w-7 text-jw-gray-300" />
            </div>
            <p className="font-semibold text-jw-black mb-1">Sin pedidos todavía</p>
            <p className="text-sm text-jw-gray-500 mb-5">
              Cuando hagas tu primera compra, vas a verla acá.
            </p>
            <Button asChild>
              <Link href="/productos" className="inline-flex items-center gap-2">
                Explorar catálogo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/cuenta/pedidos/${order.id}`}
                className="flex items-center justify-between gap-4 bg-white rounded-2xl border border-jw-gray-200 p-4 hover:border-jw-gray-300 hover:shadow-sm transition-all"
              >
                <div>
                  <p className="text-sm font-bold text-jw-black">
                    {order.numeroOrden}
                  </p>
                  <p className="text-xs text-jw-gray-500">
                    {new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(order.createdAt)} ·{" "}
                    {order.items.reduce((acc, i) => acc + i.cantidad, 0)} artículos
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant={
                      order.estado === "PAGADO"
                        ? "success"
                        : order.estado === "NUEVO"
                        ? "warning"
                        : order.estado === "CANCELADO"
                        ? "error"
                        : "default"
                    }
                  >
                    {ESTADO_LABEL[order.estado] || order.estado}
                  </Badge>
                  <span className="text-sm font-bold text-jw-black">
                    {formatPrice(Number(order.total))}
                  </span>
                  <ChevronRight className="h-4 w-4 text-jw-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Favorites hint */}
      {wishlistCount > 0 && (
        <div className="flex items-center justify-between bg-jw-off-white rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-jw-red" />
            <div>
              <p className="text-sm font-semibold text-jw-black">
                {wishlistCount} {wishlistCount === 1 ? "favorito" : "favoritos"}
              </p>
              <p className="text-xs text-jw-gray-500">
                Volvé a ver los productos que guardaste.
              </p>
            </div>
          </div>
          <Link
            href="/wishlist"
            className="text-sm font-semibold text-jw-red hover:underline"
          >
            Ver
          </Link>
        </div>
      )}
    </div>
  );
}