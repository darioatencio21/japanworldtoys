"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  SITE_NAME,
  STORE_ADDRESS,
  STORE_CONTACT,
  INSTAGRAM_URL,
  WHATSAPP_LINK,
} from "@/lib/constants";
import {
  Instagram,
  MessageCircle,
  Mail,
  MapPin,
  Phone,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const footerLinks = {
  tienda: [
    { label: "Todos los productos", href: "/productos" },
    { label: "Figuras Funko", href: "/productos/figuras/funkos" },
    { label: "Mangas", href: "/productos/mangas" },
    { label: "Comics", href: "/productos/comics" },
    { label: "Sanrio", href: "/productos/sanrio" },
    { label: "Ofertas", href: "/ofertas" },
  ],
  ayuda: [
    { label: "Sobre nosotros", href: "/pagina/nosotros" },
    { label: "Política de envíos", href: "/pagina/politica-envios" },
    { label: "Política de devoluciones", href: "/pagina/politica-devoluciones" },
    { label: "Términos y condiciones", href: "/pagina/terminos-y-condiciones" },
    { label: "Arrepentimiento de compra", href: "/arrepentimiento" },
  ],
};

type ColumnKey = keyof typeof footerLinks;

const COLUMN_TITLES: Record<ColumnKey, string> = {
  tienda: "Tienda",
  ayuda: "Ayuda",
};

function FooterColumn({
  title,
  links,
  open,
  onToggle,
}: {
  title: string;
  links: { label: string; href: string }[];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-white/10 lg:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 lg:py-0 lg:mb-4 lg:pointer-events-none text-left"
        aria-expanded={open}
      >
        <h4 className="text-sm font-bold uppercase tracking-wider text-jw-gold">
          {title}
        </h4>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-jw-gray-400 lg:hidden transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <ul
        className={cn(
          "space-y-2.5 pb-4 lg:pb-0 overflow-hidden transition-all duration-300 lg:space-y-2.5 lg:block",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0 lg:max-h-none lg:opacity-100"
        )}
      >
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-jw-gray-300 hover:text-white hover:underline transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const pathname = usePathname();
  // ⚠️ Los hooks SIEMPRE antes de cualquier return condicional (Rules of Hooks)
  const [openColumns, setOpenColumns] = useState<Record<ColumnKey, boolean>>({
    tienda: false,
    ayuda: false,
  });

  const toggleColumn = (key: ColumnKey) =>
    setOpenColumns((prev) => ({ ...prev, [key]: !prev[key] }));

  const columnState = (key: ColumnKey) => openColumns[key];

  if (pathname.startsWith("/admin") || pathname === "/login") return null;

  return (
    <footer className="bg-jw-black text-white relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40 bg-[url('/images/footer/fondo-footer-mobile.webp')] md:bg-[url('/images/footer/fondo-footer.webp')]"
        aria-hidden
      />

      {/* Newsletter Banner */}
      <div className="bg-jw-red relative">
        <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold font-[family-name:var(--font-display)]">
              ¡No te pierdas las novedades!
            </h3>
            <p className="text-white/80 text-sm mt-1">
              Suscribite para recibir ofertas exclusivas y nuevos ingresos.
            </p>
          </div>
          <form className="flex w-full md:w-auto gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Tu email"
              className="flex-1 md:w-72 h-11 px-4 rounded-lg bg-white text-jw-black placeholder:text-jw-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-jw-gold min-w-0"
            />
            <button className="h-11 px-6 rounded-lg bg-jw-black text-white text-sm font-semibold hover:bg-jw-gray-700 transition-colors flex-shrink-0">
              Suscribirme
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/images/logo/logo-japan-world-toys.webp"
                alt={SITE_NAME}
                width={180}
                height={45}
                className="h-12 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-jw-gray-300 text-sm leading-relaxed mb-6">
              La gran comiquería y tienda de mangas de Tucumán. Figuras,
              coleccionables, mangas, comics y todo para los fans del anime.
            </p>

            {/* Contact */}
            <div className="space-y-3 text-sm">
              <a
                href={`https://maps.google.com/?q=${STORE_ADDRESS.street}, ${STORE_ADDRESS.city}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 text-jw-gray-300 hover:text-white transition-colors"
              >
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  {STORE_ADDRESS.street}, {STORE_ADDRESS.gallery}
                  <br />
                  {STORE_ADDRESS.city}
                </span>
              </a>
              <a
                href={`tel:${STORE_CONTACT.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 text-jw-gray-300 hover:text-white transition-colors"
              >
                <Phone className="h-4 w-4 flex-shrink-0" />
                {STORE_CONTACT.phone}
              </a>
              <a
                href={`mailto:${STORE_CONTACT.email}`}
                className="flex items-center gap-2 text-jw-gray-300 hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4 flex-shrink-0" />
                {STORE_CONTACT.email}
              </a>
            </div>

            {/* Social */}
            <div className="flex gap-3 mt-6">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-jw-red transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#25D366] transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
<div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-0 lg:gap-6"> 
            {(Object.keys(footerLinks) as ColumnKey[]).map((key) => (
              <FooterColumn
                key={key}
                title={COLUMN_TITLES[key]}
                links={footerLinks[key]}
                open={columnState(key)}
                onToggle={() => toggleColumn(key)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col items-center justify-between gap-4 text-center lg:flex-row lg:text-left">
          <p className="text-xs text-jw-gray-300">
            © {new Date().getFullYear()} JapanWorld Toys. Todos los derechos reservados.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-jw-gray-300 text-[11px]">
            <Link href="/pagina/terminos-y-condiciones" className="hover:text-white transition-colors underline-offset-2 hover:underline">
              Términos
            </Link>
            <span className="text-white/30">|</span>
            <Link href="/pagina/politica-devoluciones" className="hover:text-white transition-colors underline-offset-2 hover:underline">
              Privacidad
            </Link>
            <span className="text-white/30">|</span>
            <span>Visa · Mastercard · Mercado Pago</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
