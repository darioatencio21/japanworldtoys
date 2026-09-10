"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  id: string;
  titulo: string;
  subtitulo: string | null;
  imagenDesktop: string;
  imagenMobile: string | null;
  textoCTA: string | null;
  linkCTA: string | null;
};

const BADGES = ["NUEVOS INGRESOS", "EDICIÓN LIMITADA", "COLECCIÓN"];

export function HomeHero({ slides }: { slides: HeroSlide[] }) {
  const [current, setCurrent] = useState(0);
  const total = slides.length;

  useEffect(() => {
    if (total <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, 7000);
    return () => clearInterval(interval);
  }, [total]);

  if (total === 0) return null;

  const go = (index: number) => setCurrent((index + total) % total);
  const slide = slides[current];

  return (
    <section className="relative overflow-hidden">
      <div className="relative bg-gradient-to-r from-jw-red to-jw-red-dark transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 py-14 md:py-20 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-white z-10 text-center md:text-left">
            <Badge variant="gold" className="mb-3">
              {BADGES[current % BADGES.length]}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold font-[family-name:var(--font-display)] leading-tight mb-4">
              {slide.titulo}
            </h1>
            {slide.subtitulo && (
              <p className="text-base md:text-lg text-white/80 mb-7 max-w-lg mx-auto md:mx-0">
                {slide.subtitulo}
              </p>
            )}
            {slide.linkCTA && (
              <Button
                size="xl"
                variant="gold"
                asChild
                className={cn(!slide.textoCTA && "hidden")}
              >
                <Link href={slide.linkCTA} className="inline-flex items-center gap-2">
                  {slide.textoCTA || "Ver más"}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>

          <div className="flex-1 relative h-48 md:h-72 w-full max-w-sm md:max-w-none">
            <Image
              src={slide.imagenDesktop}
              alt={slide.titulo}
              fill
              priority
              className="object-contain drop-shadow-2xl"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full" />
          <div className="absolute bottom-10 right-20 w-48 h-48 border border-white rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 border border-white rotate-45" />
        </div>
      </div>

      {total > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
          <button
            onClick={() => go(current - 1)}
            className="h-8 w-8 rounded-full bg-white/90 text-jw-black flex items-center justify-center hover:bg-white transition-colors shadow"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => go(idx)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  idx === current ? "w-6 bg-white" : "w-2 bg-white/50"
                )}
                aria-label={`Ir al slide ${idx + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => go(current + 1)}
            className="h-8 w-8 rounded-full bg-white/90 text-jw-black flex items-center justify-center hover:bg-white transition-colors shadow"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
}