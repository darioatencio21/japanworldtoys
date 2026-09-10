"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

export function ProductGallery({
  images,
  nombre,
}: {
  images: { url: string; alt: string }[];
  nombre: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (images.length === 0) {
    return (
      <div className="relative aspect-square bg-jw-gray-100 rounded-2xl overflow-hidden">
        <Image
          src="/images/placeholders/figure-placeholder.svg"
          alt={nombre}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  const activeImage = images[activeIndex];

  const goTo = (index: number) => {
    setActiveIndex((index + images.length) % images.length);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        className={cn(
          "relative aspect-square bg-jw-gray-100 rounded-2xl overflow-hidden border border-jw-gray-200",
          isZoomed && "cursor-zoom-out"
        )}
        onClick={() => setIsZoomed(!isZoomed)}
        role="button"
        tabIndex={0}
        aria-label="Ampliar imagen"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setIsZoomed(!isZoomed);
        }}
      >
        <Image
          src={activeImage.url}
          alt={activeImage.alt}
          fill
          priority
          className={cn(
            "object-cover transition-transform duration-300",
            isZoomed && "scale-150"
          )}
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Zoom hint */}
        <div className="absolute bottom-4 right-4 h-9 w-9 rounded-full bg-white/85 backdrop-blur-sm shadow-sm flex items-center justify-center">
          <ZoomIn className="h-4 w-4 text-jw-gray-700" />
        </div>

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goTo(activeIndex - 1);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/85 backdrop-blur-sm shadow-sm flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goTo(activeIndex + 1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/85 backdrop-blur-sm shadow-sm flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all",
                idx === activeIndex
                  ? "border-jw-red ring-2 ring-jw-red/20"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
              aria-label={`Ver imagen ${idx + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}