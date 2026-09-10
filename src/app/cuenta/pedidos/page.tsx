import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Package, ChevronRight } from "lucide-react";

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

export default async function PedidosPage() {
  const session = await auth();
  if (!session?.user) return null;

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-jw-black mb-5">
        Mis pedidos
      </h2>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-jw-gray-200 p-10 text-center">
          <div className="h-14 w-14 rounded-full bg-jw-off-white flex items-center justify-center mx-auto mb-4">
            <Package className="h-7 w-7 text-jw-gray-300" />
          </div>
          <p className="font-semibold text-jw-black mb-1">Todavía no hiciste pedidos</p>
          <p className="text-sm text-jw-gray-500">
            Explorá el catálogo y encontrá tu próxima figura.
          </p>
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
                  {new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(
                    order.createdAt
                  )}{" "}
                  · {order.items.reduce((acc, i) => acc + i.cantidad, 0)} artículos
                </p>
                <p className="text-xs text-jw-gray-500 mt-0.5">
                  {order.metodoEnvio === "retiro" && "Retiro en el local"}
                  {order.metodoEnvio === "correo" && "Correo Argentino"}
                  {order.metodoEnvio === "coordinar" && "Envío a coordinar"}
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
  );
}