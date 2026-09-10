"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Tag,
  ImageIcon,
  FileText,
  Settings,
  LogOut,
  PieChart,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Productos", href: "/admin/productos", icon: Package },
  { label: "Cupones", href: "/admin/cupones", icon: Tag },
  { label: "Banners", href: "/admin/banners", icon: ImageIcon },
  { label: "Páginas", href: "/admin/paginas", icon: FileText },
  { label: "Reportes", href: "/admin/reportes", icon: PieChart },
  { label: "Configuración", href: "/admin/configuracion", icon: Settings },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {adminNav.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-jw-red text-white shadow-sm"
                  : "text-jw-gray-700 hover:bg-jw-off-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-jw-gray-100 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-jw-gray-700 hover:bg-jw-off-white transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Ver tienda
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-jw-error hover:bg-jw-error/5 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </>
  );
}

export function AdminShell({
  children,
  rol,
}: {
  children: React.ReactNode;
  rol: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      {/* Background image */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/backgrounds/fondo-panel-admin.png)" }}
        aria-hidden="true"
      />

      {/* Top bar */}
      <header className="relative z-20 bg-white shadow-sm flex-shrink-0">
        <div className="h-12 px-4 flex items-center justify-between">
          {/* Left: hamburger (mobile) + logo */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-jw-off-white transition-colors text-jw-gray-700"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/admin" className="flex items-center gap-2 font-bold text-sm">
              <img
                src="/images/logo/logo-japan-world-toys.png"
                alt="JapanWorld Toys"
                className="h-7 w-auto object-contain"
              />
              <span className="hidden sm:inline text-jw-black">Admin</span>
            </Link>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xs text-jw-gray-700 hover:text-jw-black transition-colors px-2 py-1.5 rounded-lg hover:bg-jw-off-white"
            >
              Tienda
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs text-jw-gray-700 hover:text-jw-black transition-colors px-2 py-1.5 rounded-lg hover:bg-jw-off-white"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Body: sidebar (desktop) + main */}
      <div className="relative z-10 flex flex-1 min-h-0">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-56 flex-shrink-0 bg-white border-r border-jw-gray-200">
          <SidebarNav />
        </aside>

        {/* Main content (scrolls internally) */}
        <main className="flex-1 min-w-0 overflow-y-auto px-4 md:px-6 py-6">
          {children}
        </main>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl flex flex-col animate-slide-in-left">
            <div className="h-12 px-4 flex items-center justify-between border-b border-jw-gray-100 flex-shrink-0">
              <span className="text-sm font-bold text-jw-black">Menú admin</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 -mr-1.5 rounded-lg hover:bg-jw-off-white transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5 text-jw-gray-700" />
              </button>
            </div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </div>
  );
}