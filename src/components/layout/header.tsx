"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ProductSearch } from "@/components/ui/product-search";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { NAV_ITEMS, SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { MegaMenu } from "./mega-menu";
import { TopBar } from "./top-bar";
import {
  ShoppingBag,
  Heart,
  Menu,
  X,
  ChevronDown,
  Tag,
  Sparkles,
  Store,
} from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const totalItems = useCartStore((s) => s.totalItems());
  const toggleCart = useCartStore((s) => s.toggleCart);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleSection = (label: string) =>
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));

  if (pathname.startsWith("/admin") || pathname === "/login") return null;

  return (
    <>
      <TopBar />

      {/* Main Header */}
      <header
        className={cn(
          "sticky top-0 z-50 bg-white border-b border-jw-gray-200 transition-shadow duration-300",
          isScrolled && "shadow-md"
        )}
      >
        <div className="max-w-7xl mx-auto px-4">
          {/* Upper Header: Logo + Search + Actions */}
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <Image
                src="/images/logo/logo-japan-world-toys.png"
                alt={SITE_NAME}
                width={160}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>

            {/* Search - Desktop */}
            <div className="hidden md:flex flex-1 max-w-xl mx-6">
              <ProductSearch className="w-full" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant="ghost" size="icon" aria-label="Favoritos">
                <Heart className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Carrito"
                onClick={toggleCart}
                className="relative"
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-jw-red text-[10px] font-bold text-white animate-bounce-subtle">
                    {totalItems}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Search - Mobile */}
          <div className="md:hidden pb-3">
            <ProductSearch placeholder="Buscar productos..." className="w-full" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 -mb-px" aria-label="Navegación principal">
            {NAV_ITEMS.map((item) => (
              <MegaMenu key={item.label} item={item} />
            ))}
          </nav>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-jw-gray-200 bg-white animate-fade-up">
            {/* Mobile menu header */}
            <div className="flex items-center px-4 py-3 border-b border-jw-gray-100">
              <span className="text-xs font-bold uppercase tracking-wider text-jw-gray-500">
                Menú
              </span>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-4 py-4">
              {NAV_ITEMS.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const isOpen = openSections[item.label] || false;

                if (!hasChildren) {
                  const isOffer = item.label === "Ofertas";
                  const isComing = item.label === "Próximamente";
                  const isAbout = item.label === "Nosotros";
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 h-12 px-4 my-1 rounded-xl text-sm font-semibold transition-colors",
                        isOffer
                          ? "bg-jw-red text-white"
                          : isComing
                          ? "bg-jw-black text-white"
                          : "text-jw-gray-700 hover:bg-jw-off-white hover:text-jw-black"
                      )}
                    >
                      {isOffer && <Tag className="h-4 w-4" />}
                      {isComing && <Sparkles className="h-4 w-4 text-jw-gold" />}
                      {isAbout && <Store className="h-4 w-4" />}
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <div key={item.label} className="border-b border-jw-gray-100">
                    <button
                      onClick={() => toggleSection(item.label)}
                      className="flex items-center justify-between w-full h-12 px-4 rounded-xl text-sm font-bold text-jw-black hover:bg-jw-off-white transition-colors"
                      aria-expanded={isOpen}
                      aria-controls={`mobile-${item.label}`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-jw-red transition-transform duration-200",
                          isOpen && "rotate-180"
                        )}
                      />
                    </button>
                    <div
                      id={`mobile-${item.label}`}
                      className={cn(
                        "overflow-hidden transition-all duration-300",
                        isOpen ? "max-h-[600px] opacity-100 pb-2" : "max-h-0 opacity-0"
                      )}
                    >
                      <div className="pl-4 space-y-0.5">
                        {item.children!.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2.5 h-11 px-4 rounded-lg text-sm text-jw-gray-600 hover:text-jw-red hover:bg-jw-off-white transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-jw-red/60 flex-shrink-0"></span>
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile menu footer CTA */}
            <div className="px-4 py-4 border-t border-jw-gray-100">
              <Link
                href="/ofertas"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 h-12 w-full rounded-xl bg-gradient-to-r from-jw-red to-red-700 text-white text-sm font-bold shadow-lg"
              >
                <Tag className="h-4 w-4" />
                Ver ofertas especiales
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
