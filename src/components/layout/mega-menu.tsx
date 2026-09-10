"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronDown, ArrowRight } from "lucide-react";

interface NavChild {
  label: string;
  href: string;
  /** Ilustración de tarjeta (menú Productos) */
  image?: string;
  /** Texto alternativo descriptivo de la ilustración */
  alt?: string;
  thumbnail?: string;
}

interface NavItem {
  label: string;
  href: string;
  children?: (NavChild | { label: string; href: string; children?: NavChild[] })[];
}

/** Patrón sutil de olas japonesas (seigaiha) repetible para el fondo del panel */
const SEIGAIHA_BG = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="M0 20a20 20 0 0 0 40 0H0z" fill="#E10600" fill-opacity="0.5"/></svg>'
)}")`;

function isCardChild(child: NavChild): child is NavChild & { image: string } {
  return typeof child.image === "string" && child.image.length > 0;
}

function CategoryCard({ child }: { child: NavChild & { image: string } }) {
  return (
    <Link
      href={child.href}
      aria-label={child.label}
      className="group/card block rounded-lg leading-[0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jw-red focus-visible:ring-offset-2"
    >
      <img
        src={child.image}
        alt={child.alt ?? child.label}
        loading="lazy"
        className="block h-auto w-full transition-transform duration-150 group-hover/card:scale-[1.03]"
      />
    </Link>
  );
}

/** Flor de sakura decorativa para las esquinas del panel */
function Sakura({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={className} fill="currentColor">
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d="M24 5c6 4 6 12 0 16-6-4-6-12 0-16z" transform={`rotate(${a} 24 24)`} />
      ))}
      <circle cx="24" cy="24" r="2.4" />
    </svg>
  );
}

export function MegaMenu({
  item,
  title = "Explorá nuestras categorías",
}: {
  item: NavItem;
  title?: string;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const usesCards =
    hasChildren && item.children!.some((c) => "image" in c && isCardChild(c as NavChild));

  const grid = item.children ? (
    <div
      className={cn(
        usesCards
          ? "grid grid-cols-1 sm:grid-cols-2 gap-[18px] sm:gap-5"
          : "grid grid-cols-2 lg:grid-cols-3 gap-3"
      )}
    >
      {item.children.map((child) => {
        if ("children" in child && child.children) {
          return (
            <div key={child.label}>
              <Link
                href={child.href}
                className="block text-sm font-bold text-jw-black hover:text-jw-red transition-colors mb-3 pb-2 border-b border-jw-gray-200"
              >
                {child.label}
              </Link>
              <div className="space-y-1">
                {child.children.map((sub) => (
                  <Link
                    key={sub.label}
                    href={sub.href}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-jw-gray-700 hover:text-jw-black hover:bg-jw-off-white transition-colors font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-jw-red opacity-60"></span>
                    {sub.label}
                  </Link>
                ))}
              </div>
            </div>
          );
        }

        const navChild = child as NavChild;

        // Tarjetas con ilustración (menú Productos)
        if (isCardChild(navChild)) {
          return <CategoryCard key={navChild.label} child={navChild} />;
        }

        // Chips simples (franquicias y otros menús)
        const isRedItem = ["Comics", "Mangas", "Peluches", "Videojuegos", "Funkos", "Sanrio"].includes(navChild.label);

        return (
          <Link
            key={navChild.label}
            href={navChild.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all",
              isRedItem
                ? "text-jw-red bg-red-50 hover:bg-red-100 border border-red-200"
                : "text-jw-gray-700 hover:text-jw-black hover:bg-jw-off-white"
            )}
          >
            {isRedItem && <span className="w-2 h-2 rounded-full bg-jw-red animate-pulse"></span>}
            {navChild.label}
          </Link>
        );
      })}
    </div>
  ) : null;

  return (
    <div className="mega-menu-trigger relative group isolate">
      <Link
        href={item.href}
        className={cn(
          "inline-flex items-center gap-1 px-3 py-2.5 text-sm font-medium text-jw-black",
          "hover:text-jw-red transition-colors rounded-t-lg",
          "border-b-2 border-transparent hover:border-jw-red"
        )}
      >
        {item.label}
        {hasChildren && <ChevronDown className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />}
      </Link>

      {hasChildren && (
        <div
          className={cn(
            "mega-menu-panel absolute left-0 top-full z-[60] overflow-hidden shadow-[0_24px_48px_-12px_rgba(0,0,0,0.22)]",
            usesCards
              ? "isolate w-[min(92vw,600px)] rounded-[20px] bg-[#fdf8f5] bg-gradient-to-b from-white via-[#fdf9f5] to-[#fbedeb] ring-1 ring-jw-red/10"
              : "min-w-[600px] rounded-xl bg-white border border-jw-gray-200 shadow-xl"
          )}
        >
          {usesCards ? (
            <div className="relative px-5 sm:px-8 pt-6 pb-5 sm:pt-8 sm:pb-6">
              {/* Patrón de fondo sutil (olas/seigaiha) */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.06]"
                style={{ backgroundImage: SEIGAIHA_BG, backgroundSize: "40px 40px", backgroundRepeat: "repeat" }}
              />
              {/* Sakuras decorativas en las esquinas */}
              <Sakura className="pointer-events-none absolute -left-2 -top-3 size-14 sm:size-16 text-jw-red/15 -rotate-12" />
              <Sakura className="pointer-events-none absolute -right-3 -bottom-4 size-16 sm:size-20 text-jw-red/15 rotate-[168deg]" />

              {/* Título */}
              <h3 className="text-center font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-jw-black">
                {title}
              </h3>
              <div className="mt-2 flex items-center justify-center gap-2" aria-hidden>
                <span className="h-px w-8 bg-jw-red/30" />
                <span className="h-1.5 w-1.5 rotate-45 bg-jw-red" />
                <span className="h-px w-8 bg-jw-red/30" />
              </div>

              <div className="pt-5 sm:pt-6">{grid}</div>

              {/* Footer: separador + link a todas las categorías */}
              <footer className="mt-5 sm:mt-6 border-t border-jw-black/10 pt-4 flex items-center justify-between gap-3">
                <span className="text-xs font-medium uppercase tracking-wider text-jw-gray-500">
                  Categorías
                </span>
                <Link
                  href={item.href}
                  className="group/footer inline-flex items-center gap-1.5 text-sm font-semibold text-jw-red underline-offset-4 hover:underline"
                >
                  Ver todas las categorías
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover/footer:translate-x-0.5" />
                </Link>
              </footer>
            </div>
          ) : (
            <div className="p-6">{grid}</div>
          )}
        </div>
      )}
    </div>
  );
}