"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";

export function CartDrawer() {
  const pathname = usePathname();
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } =
    useCartStore();

  if (pathname.startsWith("/admin") || pathname === "/login") return null;
  if (!isOpen) return null;

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
      `Total: ${formatPrice(totalPrice())}`,
      "",
      "¿Me ayudan con la compra?",
    ].join("\n");
  };

  const handleWhatsApp = () => {
    const msg = buildWhatsAppMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-jw-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-jw-red" />
            <h2 className="text-lg font-bold font-[family-name:var(--font-display)]">
              Tu carrito
            </h2>
            <span className="text-sm text-jw-gray-500">
              ({items.length} {items.length === 1 ? "producto" : "productos"})
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-jw-off-white rounded-lg transition-colors"
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="h-16 w-16 text-jw-gray-300 mb-4" />
              <p className="text-lg font-semibold text-jw-gray-700">
                Tu carrito está vacío
              </p>
              <p className="text-sm text-jw-gray-500 mt-1 mb-6">
                ¡Explorá nuestro catálogo y encontrá tu figura favorita!
              </p>
              <Button onClick={closeCart} asChild>
                <Link href="/productos">Ver productos</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="flex gap-4 p-3 rounded-xl border border-jw-gray-100 hover:border-jw-gray-200 transition-colors"
                >
                  {/* Image */}
                  <div className="relative h-20 w-20 rounded-lg bg-jw-gray-100 overflow-hidden flex-shrink-0">
                    <Image
                      src={item.imagen}
                      alt={item.nombre}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/producto/${item.slug}`}
                      className="text-sm font-semibold text-jw-black hover:text-jw-red transition-colors line-clamp-2"
                      onClick={closeCart}
                    >
                      {item.nombre}
                    </Link>
                    <p className="text-sm font-bold text-jw-red mt-1">
                      {formatPrice(item.precio)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 border border-jw-gray-200 rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.cantidad - 1,
                              item.variantId
                            )
                          }
                          className="h-7 w-7 flex items-center justify-center hover:bg-jw-off-white transition-colors rounded-l-lg"
                          disabled={item.cantidad <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="h-7 w-8 flex items-center justify-center text-xs font-medium">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.cantidad + 1,
                              item.variantId
                            )
                          }
                          className="h-7 w-7 flex items-center justify-center hover:bg-jw-off-white transition-colors rounded-r-lg"
                          disabled={item.cantidad >= item.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="p-1.5 text-jw-gray-500 hover:text-jw-error hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-jw-gray-200 px-6 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-jw-gray-500">Total estimado</span>
              <span className="text-lg font-bold text-jw-black">
                {formatPrice(totalPrice())}
              </span>
            </div>
            <p className="text-xs text-jw-gray-500">
              Enviás tu pedido por WhatsApp y coordinás el pago y envío con nosotros.
            </p>
            <Button
              className="w-full !bg-[#25D366] hover:!bg-[#1faf55]"
              size="lg"
              data-wa
              onClick={handleWhatsApp}
            >
              <WhatsAppIcon className="h-5 w-5" />
              Comprar por WhatsApp
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
