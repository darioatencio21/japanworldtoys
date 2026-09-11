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
  imagenDesktop: string | null;
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
  const mobile = slide.imagenMobile || slide.imagenDesktop;
  const desktop = slide.imagenDesktop || slide.imagenMobile;
  const both = mobile && desktop && mobile !== desktop;

  if (!mobile && !desktop) return null;

  return (
    <section className="relative overflow-hidden bg-jw-red">
      <div className="relative h-[340px] sm:h-[400px] md:h-[460px] lg:h-[540px]">
        {both ? (
          <>
            <Image
              src={mobile!}
              alt={slide.titulo}
              fill
              priority
              className="object-cover md:hidden"
              sizes="100vw"
            />
            <Image
              src={desktop!}
              alt={slide.titulo}
              fill
              priority
              className="object-cover hidden md:block"
              sizes="100vw"
            />
          </>
        ) : (
          (mobile || desktop) && (
            <Image
              src={(mobile || desktop)!}
              alt={slide.titulo}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          )
        )}

        {/* Scrim para legibilidad del texto */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent md:bg-gradient-to-r md:from-black/70 md:via-black/25 md:to-transparent"
        />

        {/* Contenido */}
        <div className="absolute inset-0 z-10">
          <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end md:justify-center">
            <div className="max-w-2xl pb-16 md:pb-0 md:pr-4">
              <Badge variant="gold" className="mb-3">
                {BADGES[current % BADGES.length]}
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-[family-name:var(--font-display)] leading-tight mb-4 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                {slide.titulo}
              </h1>
              {slide.subtitulo && (
                <p className="text-base sm:text-lg text-white/85 mb-6 md:mb-8 max-w-lg drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                  {slide.subtitulo}
                </p>
              )}
              {slide.linkCTA && (
                <Button size="xl" variant="gold" asChild>
                  <Link href={slide.linkCTA} className="inline-flex items-center gap-2">
                    {slide.textoCTA || "Ver más"}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
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