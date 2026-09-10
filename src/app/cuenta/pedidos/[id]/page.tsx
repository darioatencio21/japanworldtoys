import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  MapPin,
  Truck,
  Store,
  Handshake,
  ArrowLeft,
  MessageCircle,
  AlertCircle,
} from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/constants";

export const dynamic = "force-dynamic";

const ESTADO_LABEL: Record<string, { label: string; variant: "success" | "warning" | "error" | "default" | "info" }> = {
  NUEVO: { label: "Nuevo", variant: "warning" },
  PAGADO: { label: "Pagado", variant: "success" },
  PREPARANDO: { label: "En preparación", variant: "default" },
  ENVIADO: { label: "Enviado", variant: "info" },
  ENTREGADO: { label: "Entregado", variant: "success" },
  CANCELADO: { label: "Cancelado", variant: "error" },
  DEVUELTO: { label: "Devuelto", variant: "default" },
} as const;

const STEP_ORDER = ["NUEVO", "PAGADO", "PREPARANDO", "ENVIADO", "ENTREGADO"];

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return null;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { include: { imagenes: { orderBy: { orden: "asc" } } } } } },
      historial: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order || (order.userId && order.userId !== session.user.id && !["ADMIN", "SUPERADMIN", "DEPOSITO"].includes(session.user.rol))) {
    notFound();
  }

  const currentStepIndex = STEP_ORDER.indexOf(order.estado);
  const canceled = order.estado === "CANCELADO" || order.estado === "DEVUELTO";

  const ShippingIcon =
    order.metodoEnvio === "retiro" ? Store : order.metodoEnvio === "correo" ? Truck : Handshake;
  const shippingLabel =
    order.metodoEnvio === "retiro"
      ? "Retiro en el local"
      : order.metodoEnvio === "correo"
      ? "Correo Argentino"
      : "Envío a coordinar";

  return (
    <div>
      <Link
        href="/cuenta/pedidos"
        className="inline-flex items-center gap-2 text-sm text-jw-gray-500 hover:text-jw-red transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a mis pedidos
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
        <div>
          <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-jw-black">
            Pedido {order.numeroOrden}
          </h2>
          <p className="text-sm text-jw-gray-500">
            {new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(order.createdAt)}
          </p>
        </div>
        <Badge variant={ESTADO_LABEL[order.estado]?.variant || "default"}>
          {ESTADO_LABEL[order.estado]?.label || order.estado}
        </Badge>
      </div>

      {/* Progress timeline */}
      {!canceled && currentStepIndex >= 0 && (
        <div className="bg-white rounded-2xl border border-jw-gray-200 p-6 mb-6">
          <div className="flex items-center">
            {STEP_ORDER.map((step, idx) => {
              const label = ESTADO_LABEL[step]?.label;
              const isDone = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step} className="flex-1 relative">
                  {idx > 0 && (
                    <div
                      className={`absolute top-4 left-0 right-0 h-0.5 -translate-y-1/2 ${
                        idx <= currentStepIndex ? "bg-jw-red" : "bg-jw-gray-200"
                      }`}
                      style={{ left: "-50%" }}
                    />
                  )}
                  <div className="flex flex-col items-center gap-2 relative z-10">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                        isDone
                          ? "bg-jw-red border-jw-red text-white"
                          : "bg-white border-jw-gray-200 text-jw-gray-400"
                      } ${isCurrent ? "ring-4 ring-jw-red/20" : ""}`}
                    >
                      {isDone ? "✓" : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] font-semibold text-center ${
                        isDone ? "text-jw-black" : "text-jw-gray-400"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {canceled && (
        <div className="flex items-start gap-3 bg-jw-error/5 border border-jw-error/20 rounded-xl p-4 mb-6">
          <AlertCircle className="h-5 w-5 text-jw-error flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-jw-error">
              Este pedido fue {order.estado === "CANCELADO" ? "cancelado" : "devuelto"}
            </p>
            <p className="text-xs text-jw-gray-700 mt-1">
              {order.estado === "CANCELADO"
                ? "Se canceló el pedido. No se realizaron cargos o se procesó el reembolso."
                : "El pedido fue devuelto conforme a los términos de venta."}
            </p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Items */}
        <div className="bg-white rounded-2xl border border-jw-gray-200 p-6">
          <h3 className="font-bold font-[family-name:var(--font-display)] text-jw-black mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-jw-red" />
            Artículos
          </h3>
          <div className="space-y-4">
            {order.items.map((item) => {
              const img = item.product.imagenes[0];
              return (
                <div key={item.id} className="flex gap-3">
                  <div className="relative h-16 w-16 rounded-lg bg-jw-gray-100 overflow-hidden flex-shrink-0">
                    {img && (
                      <Image
                        src={img.url}
                        alt={item.product.nombre}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/producto/${item.product.slug}`}
                      className="text-sm font-semibold text-jw-black hover:text-jw-red line-clamp-1 transition-colors"
                    >
                      {item.product.nombre}
                    </Link>
                    <p className="text-xs text-jw-gray-500">
                      {formatPrice(Number(item.precioUnitario))} × {item.cantidad}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-jw-black">
                    {formatPrice(Number(item.precioUnitario) * item.cantidad)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-jw-gray-100 mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-jw-gray-500">
              <span>Subtotal</span>
              <span>{formatPrice(Number(order.subtotal))}</span>
            </div>
            {Number(order.descuento) > 0 && (
              <div className="flex justify-between text-jw-success">
                <span>Descuento</span>
                <span>-{formatPrice(Number(order.descuento))}</span>
              </div>
            )}
            <div className="flex justify-between text-jw-gray-500">
              <span>Envío</span>
              <span>{Number(order.costoEnvio) === 0 ? "Gratis" : formatPrice(Number(order.costoEnvio))}</span>
            </div>
            <div className="flex justify-between font-bold text-jw-black pt-1">
              <span>Total</span>
              <span className="text-jw-red">{formatPrice(Number(order.total))}</span>
            </div>
          </div>
        </div>

        {/* Shipping + payment */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-jw-gray-200 p-6">
            <h3 className="font-bold font-[family-name:var(--font-display)] text-jw-black mb-4 flex items-center gap-2">
              <ShippingIcon className="h-4 w-4 text-jw-red" />
              Envío
            </h3>
            <p className="text-sm text-jw-gray-700 font-medium">{shippingLabel}</p>
            {order.direccionEnvio && (
              <p className="text-sm text-jw-gray-500 mt-2 flex items-start gap-1.5">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                {order.direccionEnvio}
              </p>
            )}
            {order.metodoEnvio === "retiro" && (
              <p className="text-sm text-jw-gray-500 mt-2">
                San Martín 650, Galería Pezza (locales 46-47), San Miguel de Tucumán
              </p>
            )}
            {order.metodoEnvio === "coordinar" && (
              <p className="text-xs text-jw-gray-500 mt-2">
                Te contactamos para coordinar el envío.
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-jw-gray-200 p-6">
            <h3 className="font-bold font-[family-name:var(--font-display)] text-jw-black mb-4">
              Estado del pedido
            </h3>
            <div className="space-y-3">
              {order.historial.length === 0 ? (
                <p className="text-sm text-jw-gray-500">Sin movimientos registrados.</p>
              ) : (
                order.historial
                  .slice()
                  .reverse()
                  .map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-jw-red mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-jw-black">
                          {ESTADO_LABEL[entry.estado]?.label || entry.estado}
                        </p>
                        <p className="text-xs text-jw-gray-500">
                          {new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(
                            entry.createdAt
                          )}
                          {entry.nota ? ` — ${entry.nota}` : ""}
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          <Button variant="outline" className="w-full" asChild>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5 text-jw-success" />
              Consultar por WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}