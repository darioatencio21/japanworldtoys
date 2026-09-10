"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { classifySource, trackEvent } from "@/lib/analytics";

// Dedupe de doble montaje en dev y de navegaciones repetidas al mismo path
let lastPage = "";
let lastProductView = "";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const fuenteRef = useRef<string | null>(null);

  useEffect(() => {
    if (fuenteRef.current === null) {
      try {
        fuenteRef.current = classifySource(document.referrer);
        sessionStorage.setItem("jw_source", fuenteRef.current);
      } catch {
        fuenteRef.current = "Directo";
      }
    } else {
      const stored = sessionStorage.getItem("jw_source");
      if (stored) fuenteRef.current = stored;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname === "/login") return;
    const fuente = fuenteRef.current || "Directo";

    if (pathname !== lastPage) {
      lastPage = pathname;
      trackEvent("page_view", pathname, fuente);
    }

    if (/^\/producto\//.test(pathname) && pathname !== lastProductView) {
      lastProductView = pathname;
      trackEvent("product_view", pathname, fuente);
    }
  }, [pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const link = target?.closest('a[href*="wa.me"], a[data-wa]') as HTMLAnchorElement | null;
      if (!link) return;
      const path = window.location.pathname;
      if (path.startsWith("/admin")) return;
      const fuente = fuenteRef.current || "Directo";
      trackEvent("whatsapp_click", path, fuente);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return null;
}