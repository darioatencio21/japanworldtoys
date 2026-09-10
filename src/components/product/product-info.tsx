"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Heart,
  Star,
  Truck,
  Store,
  CreditCard,
  Shield,
  MessageCircle,
  Check,
} from "lucide-react";
import { WHATSAPP_LINK, INSTAGRAM_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ReviewData {
  id: string;
  nombre: string;
  puntuacion: number;
  titulo?: string | null;
  comentario?: string | null;
  fecha: Date;
}

export interface ProductInfoData {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string | null;
  precio: number;
  precioComparativo?: number | null;
  stock: number;
  estado: string;
  marca?: string | null;
  categoria?: string | null;
  franquicias: { nombre: string; slug: string }[];
  reviewCount: number;
  averageRating: number;
  reviews: ReviewData[];
  imagenPrincipal?: string;
}

const CATEGORY_MAP: Record<string, string> = {
  Funkos: "/productos/figuras/funkos",
  "S.H.Figuarts": "/productos/figuras/sh-figuarts",
  McFarlane: "/productos/figuras/mcfarlane",
  "Banpresto / Bandai": "/productos/figuras/banpresto-bandai",
  Comics: "/productos/comics",
  Mangas: "/productos/mangas",
  Sanrio: "/productos/sanrio",
  Peluches: "/productos/peluches",
  Videojuegos: "/productos/videojuegos",
};

function Stars({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
            star <= Math.round(rating)
              ? "fill-jw-gold text-jw-gold"
              : "fill-jw-gray-200 text-jw-gray-200"
          )}
        />
      ))}
    </div>
  );
}

export function ProductInfo({
  product,
  precioEfectivo,
  precioComparativoEfectivo,
}: {
  product: ProductInfoData;
  precioEfectivo?: number;
  precioComparativoEfectivo?: number;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const price = precioEfectivo ?? product.precio;
  const priceComparativo = precioComparativoEfectivo ?? product.precioComparativo;

  const discount = priceComparativo
    ? Math.round((1 - price / priceComparativo) * 100)
    : 0;
  const installmentPrice = Math.ceil(price / 12);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      nombre: product.nombre,
      imagen: product.imagenPrincipal || "/images/placeholders/figure-placeholder.svg",
      precio: price,
      stock: product.stock,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
    openCart();
  };

  const estadoBadge = {
    ACTIVO: null,
    PREVENTA: { label: "PREVENTA", variant: "preventa" as const },
    PROXIMAMENTE: { label: "PRÓXIMAMENTE", variant: "proximamente" as const },
    AGOTADO: { label: "SIN STOCK", variant: "sin-stock" as const },
  };

  return (
    <div className="flex flex-col">
      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] text-jw-black leading-snug mb-2">
        {product.nombre}
      </h1>

      {/* Rating + marca */}
      <div className="flex items-center gap-3 mb-4">
        {product.reviewCount > 0 && (
          <Link
            href="#reviews"
            className="flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity"
          >
            <Stars rating={product.averageRating} size="sm" />
            <span className="text-jw-gray-500 underline underline-offset-2">
              {product.averageRating.toFixed(1)} ({product.reviewCount} reseñas)
            </span>
          </Link>
        )}
        {product.marca && (
          <Badge variant="outline" className="text-xs">
            {product.marca}
          </Badge>
        )}
      </div>

      {/* Tags: franquicia + categoria */}
      <div className="flex flex-wrap gap-2 mb-6">
        {product.franquicias.map((f) => (
          <Link
            key={f.slug}
            href={`/franquicia/${f.slug}`}
            className="px-3 py-1 rounded-full bg-jw-red/5 border border-jw-red/20 text-jw-red text-xs font-semibold hover:bg-jw-red hover:text-white transition-colors"
          >
            {f.nombre}
          </Link>
        ))}
        {product.categoria && CATEGORY_MAP[product.categoria] && (
          <Link
            href={CATEGORY_MAP[product.categoria]}
            className="px-3 py-1 rounded-full bg-jw-gray-100 border border-jw-gray-200 text-jw-gray-700 text-xs font-semibold hover:bg-jw-gray-200 transition-colors"
          >
            {product.categoria}
          </Link>
        )}
      </div>

      {/* Price block */}
      <div className="bg-jw-off-white rounded-2xl p-5">
        {product.estado !== "AGOTADO" && (
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl md:text-4xl font-extrabold text-jw-red">
              {formatPrice(price)}
            </span>
            {priceComparativo && discount > 0 && (
              <>
                <span className="text-base text-jw-gray-500 line-through">
                  {formatPrice(priceComparativo)}
                </span>
                <Badge variant="oferta">{discount}% OFF</Badge>
              </>
            )}
          </div>
        )}

        {/* Installments */}
        <div className="mt-3">
          <p className="text-sm text-jw-black font-medium">
            Hasta 12 cuotas fijas de{" "}
            <span className="font-bold text-jw-gold-dark">
              {formatPrice(installmentPrice)}
            </span>
          </p>
          <p className="text-xs text-jw-gray-500 mt-1">
            sujeto al plan de tu tarjeta · ver medios de pago
          </p>
        </div>

        {/* Stock */}
        <div
          className={cn(
            "mt-4 flex items-center gap-2 text-sm font-medium",
            product.stock > 0 ? "text-jw-success" : "text-jw-error"
          )}
        >
          <span className={cn("h-2 w-2 rounded-full", product.stock > 0 ? "bg-jw-success" : "bg-jw-error")} />
          {product.stock > 0
            ? product.stock <= 3
              ? `¡Últimas ${product.stock} unidades!`
              : "Disponible"
            : "Sin stock — consultanos por reposición"}
        </div>
      </div>

      {/* Estado badge */}
      {estadoBadge[product.estado as keyof typeof estadoBadge] && (
        <div className="mt-3">
          <Badge variant={estadoBadge[product.estado as keyof typeof estadoBadge]!.variant}>
            {estadoBadge[product.estado as keyof typeof estadoBadge]!.label}
          </Badge>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 mt-6">
        <Button
          size="xl"
          className="w-full"
          onClick={handleAddToCart}
          disabled={product.stock <= 0 || product.estado === "AGOTADO"}
        >
          {isAdded ? (
            <span className="flex items-center gap-2">
              <Check className="h-5 w-5" /> ¡Agregado!
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Agregar al carrito
            </span>
          )}
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsWishlisted(!isWishlisted)}
          >
            <Heart
              className={cn(
                "h-5 w-5",
                isWishlisted ? "fill-jw-red text-jw-red" : "text-jw-gray-500"
              )}
            />
            Favoritos
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5 text-jw-success" />
              Consultar
            </a>
          </Button>
        </div>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-2 gap-3 mt-8">
        {[
          { icon: Truck, title: "Envío a todo el país", desc: "Correo Argentino" },
          { icon: Store, title: "Retiro en el local", desc: "San Martín 650, Tucumán" },
          { icon: CreditCard, title: "Medios de pago", desc: "MP, tarjetas, transferencia" },
          { icon: Shield, title: "Compra protegida", desc: "Arrepentimiento 424/2020" },
        ].map((item) => (
          <div key={item.title} className="flex items-center gap-2.5 p-3 rounded-xl border border-jw-gray-200">
            <item.icon className="h-5 w-5 text-jw-gray-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-jw-black leading-tight">{item.title}</p>
              <p className="text-[11px] text-jw-gray-500 leading-tight">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Description */}
      {product.descripcion && (
        <div className="mt-8">
          <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-jw-black mb-3">
            Descripción
          </h2>
          <p className="text-jw-gray-700 leading-relaxed text-sm whitespace-pre-line">
            {product.descripcion}
          </p>
        </div>
      )}

      {/* Reviews section */}
      <div id="reviews" className="mt-10 pt-6 border-t border-jw-gray-200 scroll-mt-32">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-jw-black">
            Reseñas de clientes
          </h2>
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-2">
              <Stars rating={product.averageRating} />
              <span className="text-sm font-semibold text-jw-black">
                {product.averageRating.toFixed(1)}
              </span>
              <span className="text-xs text-jw-gray-500">({product.reviewCount})</span>
            </div>
          )}
        </div>

        {product.reviews.length === 0 ? (
          <p className="text-sm text-jw-gray-500">
            Todavía no hay reseñas para este producto.{" "}
            <Link href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-jw-red hover:underline">
              Compartí tu experiencia en Instagram
            </Link>
            .
          </p>
        ) : (
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="bg-jw-off-white rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-jw-black">
                    {review.nombre}
                  </span>
                  <span className="text-xs text-jw-gray-500">
                    {new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(review.fecha)}
                  </span>
                </div>
                <Stars rating={review.puntuacion} size="sm" />
                {review.titulo && (
                  <p className="text-sm font-semibold text-jw-black mt-2">{review.titulo}</p>
                )}
                {review.comentario && (
                  <p className="text-sm text-jw-gray-700 mt-1">{review.comentario}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}