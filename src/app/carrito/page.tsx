"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Truck,
  Store,
  Shield,
} from "lucide-react";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalPrice = useCartStore((s) => s.totalPrice());

  const total = totalPrice;

  const buildWhatsAppMessage = () => {
    if (items.length === 0) return "";
    const lines = items.map(
      (item) => `• ${item.cantidad}x ${item.nombre} — ${formatPrice(item.precio * item.cantidad)}`
    );
    return [
      "¡Hola JapanWorld Toys! 👋 Quiero hacer un pedido:",
      "",
      ...lines,
      "",
      `Total: ${formatPrice(total)}`,
      "",
      "¿Me ayudan con la compra?",
    ].join("\n");
  };

  const handleWhatsApp = () => {
    const msg = buildWhatsAppMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center text-center">
        <div className="h-24 w-24 rounded-full bg-jw-off-white flex items-center justify-center mb-6">
          <ShoppingBag className="h-12 w-12 text-jw-gray-300" />
        </div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-jw-black mb-2">
          Tu carrito está vacío
        </h1>
        <p className="text-jw-gray-500 mb-8 max-w-md">
          ¡Explorá nuestro catálogo y encontrá tu próxima figura favorita!
        </p>
        <Button size="lg" asChild>
          <Link href="/productos">Explorar productos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] text-jw-black">
            Tu carrito
          </h1>
          <p className="text-jw-gray-500 mt-1">
            {items.reduce((acc, i) => acc + i.cantidad, 0)} artículos
          </p>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/productos" className="inline-flex items-center gap-2">
            Seguir comprando
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">

          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId}`}
              className="flex gap-4 p-4 rounded-2xl border border-jw-gray-200 bg-white hover:border-jw-gray-300 transition-colors"
            >
              {/* Image */}
              <div className="relative h-28 w-28 rounded-xl bg-jw-gray-100 overflow-hidden flex-shrink-0">
                <Image
                  src={item.imagen}
                  alt={item.nombre}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/producto/${item.slug}`}
                    className="text-sm font-semibold text-jw-black hover:text-jw-red transition-colors line-clamp-2"
                  >
                    {item.nombre}
                  </Link>
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="p-1.5 text-jw-gray-400 hover:text-jw-error hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    aria-label="Eliminar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-sm font-bold text-jw-red mt-1">
                  {formatPrice(item.precio)}
                </p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1 border border-jw-gray-200 rounded-lg">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.cantidad - 1, item.variantId)
                      }
                      disabled={item.cantidad <= 1}
                      className="h-8 w-8 flex items-center justify-center hover:bg-jw-off-white transition-colors rounded-l-lg disabled:opacity-40"
                      aria-label="Restar"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="h-8 w-9 flex items-center justify-center text-sm font-semibold">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.cantidad + 1, item.variantId)
                      }
                      disabled={item.cantidad >= item.stock}
                      className="h-8 w-8 flex items-center justify-center hover:bg-jw-off-white transition-colors rounded-r-lg disabled:opacity-40"
                      aria-label="Sumar"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <p className="text-sm font-bold text-jw-black">
                    {formatPrice(item.precio * item.cantidad)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-white rounded-2xl border border-jw-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-jw-black">
              Resumen del pedido
            </h2>

            {/* Lines */}
            <div className="border-t border-jw-gray-100 pt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-jw-gray-500">Productos</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-jw-gray-100 pt-4 flex items-center justify-between">
              <span className="text-base font-semibold text-jw-black">Total estimado</span>
              <span className="text-2xl font-extrabold text-jw-red">{formatPrice(total)}</span>
            </div>

            <p className="text-xs text-jw-gray-500 text-center">
              Enviás tu pedido por WhatsApp y coordinás el pago y envío con nosotros.
            </p>

            <Button
              size="xl"
              className="w-full !bg-[#25D366] hover:!bg-[#1faf55]"
              data-wa
              onClick={handleWhatsApp}
            >
              <WhatsAppIcon className="h-5 w-5" />
              Comprar por WhatsApp
            </Button>

            <p className="text-xs text-jw-gray-500 text-center">
              Respondemos en el horario comercial para confirmar stock y coordinar la entrega.
            </p>

            {/* Trust */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-jw-gray-100">
              {[
                { icon: Store, label: "Retiro local" },
                { icon: Truck, label: "Envíos" },
                { icon: Shield, label: "Atención" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-1.5 text-jw-gray-500 py-2 rounded-lg bg-jw-off-white">
                  <item.icon className="h-4 w-4" />
                  <span className="text-[10px] font-medium text-center">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}