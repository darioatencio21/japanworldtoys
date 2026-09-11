"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Eye, ShoppingCart } from "lucide-react";
import { ProductGalleryModal } from "./product-gallery";

export type ProductCardData = {
  id: string;
  nombre: string;
  slug: string;
  precio: number;
  precioComparativo?: number | null;
  stock: number;
  estado?: string;
  badge?: string | null;
  destacado?: boolean;
  esNovedad?: boolean;
  imagenes: { url: string; alt?: string | null; esPrincipal?: boolean }[];
};

export function ProductCard({
  product,
  precioEfectivo,
  precioComparativoEfectivo,
  className,
}: {
  product: ProductCardData;
  precioEfectivo?: number;
  precioComparativoEfectivo?: number;
  className?: string;
}) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const [isAdded, setIsAdded] = useState(false);

  const price = precioEfectivo ?? product.precio;
  const priceComparativo = precioComparativoEfectivo ?? product.precioComparativo ?? 0;

  const mainImage =
    product.imagenes?.find((img) => img.esPrincipal) || product.imagenes?.[0];
  const hoverImage = product.imagenes?.find((img) => img.url !== mainImage?.url);
  const hasHoverSwap = Boolean(hoverImage && hoverImage.url !== mainImage?.url);

  const displayBadge =
    product.badge ||
    (product.esNovedad ? "NUEVO" : null) ||
    (product.estado === "AGOTADO"
      ? "SIN STOCK"
      : product.estado === "PREVENTA"
        ? "PREVENTA"
        : null);

  const badgeVariantMap: Record<string, "nuevo" | "preventa" | "exclusivo" | "oferta" | "pocas-unidades" | "sin-stock" | "proximamente"> = {
    NUEVO: "nuevo",
    PREVENTA: "preventa",
    EXCLUSIVO: "exclusivo",
    OFERTA: "oferta",
    "POCAS UNIDADES": "pocas-unidades",
    "SIN STOCK": "sin-stock",
    PROXIMAMENTE: "proximamente",
  };

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      nombre: product.nombre,
      imagen: mainImage?.url || "/images/placeholders/figure-placeholder.svg",
      precio: price,
      stock: product.stock,
    });
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      openCart();
    }, 400);
  };

  return (
    <>
      <div className={cn("product-card group relative bg-white rounded-2xl overflow-hidden flex flex-col", className)}>
        {/* Image Container */}
        <Link href={`/producto/${product.slug}`} className="relative aspect-square bg-jw-gray-100 overflow-hidden block">
          {mainImage && (
            <>
              <Image
                src={mainImage.url}
                alt={product.nombre}
                fill
                priority={product.destacado}
                className={cn(
                  "object-cover transition-all duration-300",
                  hasHoverSwap && "group-hover:opacity-0"
                )}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
              {hasHoverSwap && hoverImage && (
                <Image
                  src={hoverImage.url}
                  alt={`${product.nombre} - vista alternativa`}
                  fill
                  className="object-cover opacity-0 group-hover:opacity-100 transition-all duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
              )}
            </>
          )}

          {/* Badge */}
          {displayBadge && (
            <div className="absolute top-3 left-3 z-10">
              <Badge variant={badgeVariantMap[displayBadge] || "default"}>
                {displayBadge}
              </Badge>
            </div>
          )}

          {/* Quick View */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsQuickViewOpen(true);
            }}
            className="hidden md:flex absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white/85 backdrop-blur-sm shadow-sm items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110"
            aria-label="Vista rápida"
          >
            <Eye className="h-4 w-4 text-jw-gray-700" />
          </button>

          {/* Stock indicator */}
          {product.stock <= 3 && product.stock > 0 && (
            <div className="absolute bottom-3 left-3 z-10">
              <Badge variant="warning">Solo {product.stock} u.</Badge>
            </div>
          )}

          {/* Add to Cart: botón flotante en mobile / barra deslizante en desktop */}
          <div className="add-to-cart-btn absolute bottom-2 right-2 md:bottom-3 md:left-3 md:right-3 z-10">
            <Button
              size="icon"
              className="md:hidden h-10 w-10 rounded-full shadow-lg"
              onClick={(e) => {
                e.preventDefault();
                handleAddToCart();
              }}
              disabled={product.stock <= 0}
              aria-label={product.stock <= 0 ? "Agotado" : "Agregar al carrito"}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="hidden md:flex w-full shadow-lg"
              onClick={(e) => {
                e.preventDefault();
                handleAddToCart();
              }}
              disabled={product.stock <= 0}
            >
              <ShoppingCart className="h-4 w-4" />
              {product.stock <= 0 ? "Agotado" : "Agregar al carrito"}
            </Button>
          </div>
        </Link>

        {/* Info */}
        <Link href={`/producto/${product.slug}`} className="p-3 sm:p-4 sm:pt-3 flex flex-col flex-1">
          <h3 className="text-[13px] sm:text-sm font-semibold text-jw-black line-clamp-2 group-hover:text-jw-red transition-colors leading-snug">
            {product.nombre}
          </h3>

          {/* Price */}
          <div className="mt-2">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-lg font-bold text-jw-red">
                {formatPrice(price)}
              </span>
              {priceComparativo > price && (
                <span className="text-xs text-jw-gray-500 line-through">
                  {formatPrice(priceComparativo)}
                </span>
              )}
              {priceComparativo > price && (
                <span className="text-[10px] font-bold text-jw-success">
                  {Math.round((1 - price / priceComparativo) * 100)}%
                </span>
              )}
            </div>
          </div>

          {/* Installments */}
          <div className="mt-1.5">
            <span className="text-[10px] sm:text-xs font-medium text-jw-gold-dark bg-jw-gold/15 rounded px-1.5 py-0.5">
              Hasta 12 cuotas de {formatPrice(Math.ceil(price / 12))}
            </span>
          </div>
        </Link>
      </div>

      {/* Quick View Modal */}
      <ProductGalleryModal
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        product={product}
      />
    </>
  );
}