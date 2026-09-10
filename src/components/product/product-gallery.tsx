"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ProductCardData } from "./product-card";

export function ProductGalleryModal({
  isOpen,
  onClose,
  product,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: ProductCardData;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const mainImage =
    product.imagenes?.find((img) => img.esPrincipal) || product.imagenes?.[0];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-fade-up">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full bg-white/90 shadow-sm flex items-center justify-center hover:bg-jw-off-white transition-colors"
          aria-label="Cerrar vista rápida"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col md:flex-row max-h-[85vh] overflow-y-auto">
          {/* Image */}
          <div className="md:w-1/2 bg-jw-gray-100 relative aspect-square md:aspect-auto md:min-h-[420px]">
            {mainImage && (
              <Image
                src={mainImage.url}
                alt={product.nombre}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
            {product.badge && (
              <div className="absolute top-4 left-4">
                <Badge variant="gold">{product.badge}</Badge>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
            <h2 className="text-xl font-bold font-[family-name:var(--font-display)] text-jw-black leading-snug">
              {product.nombre}
            </h2>

            {/* Price */}
            <div className="mt-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-jw-red">
                  {formatPrice(product.precio)}
                </span>
                {product.precioComparativo && (
                  <span className="text-sm text-jw-gray-500 line-through">
                    {formatPrice(product.precioComparativo)}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-jw-gray-700 mt-2">
                Hasta 12 cuotas de{" "}
                <span className="font-bold text-jw-gold-dark">
                  {formatPrice(Math.ceil(product.precio / 12))}
                </span>
              </p>
            </div>

            {/* Stock */}
            <div
              className={cn(
                "mt-4 flex items-center gap-2 text-sm",
                product.stock > 0 ? "text-jw-success" : "text-jw-error"
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  product.stock > 0 ? "bg-jw-success" : "bg-jw-error"
                )}
              />
              {product.stock > 0 ? `${product.stock} unidades disponibles` : "Sin stock"}
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <Button
                size="lg"
                className="w-full"
                onClick={() => {
                  addItem({
                    productId: product.id,
                    slug: product.slug,
                    nombre: product.nombre,
                    imagen: mainImage?.url || "/images/placeholders/figure-placeholder.svg",
                    precio: product.precio,
                    stock: product.stock,
                  });
                  onClose();
                  openCart();
                }}
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="h-5 w-5" />
                Agregar al carrito
              </Button>
              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link href={`/producto/${product.slug}`} onClick={onClose}>
                  Ver detalle completo
                </Link>
              </Button>
            </div>

            {/* Quick meta */}
            <div className="mt-6 pt-4 border-t border-jw-gray-200 text-xs text-jw-gray-500 space-y-1">
              <p>🚚 Envíos a todo el país</p>
              <p>🏪 Retiro en San Martín 650, Tucumán</p>
              <p>💳 Transferencia, Mercado Pago o tarjeta</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}