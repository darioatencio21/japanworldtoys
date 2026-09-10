import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumb({
  items,
  className,
}: {
  items: { label: string; href?: string }[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1.5 text-sm text-jw-gray-500 flex-wrap", className)}
    >
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-jw-red transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        Inicio
      </Link>
      {items.map((item, idx) =>
        // El componente ya renderiza "Inicio": omitir el item redundante
        idx === 0 && item.label === "Inicio" && item.href === "/" ? null : (
        <React.Fragment key={idx}>
          <ChevronRight className="h-3.5 w-3.5 text-jw-gray-300" />
          {item.href ? (
            <Link href={item.href} className="hover:text-jw-red transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-jw-black font-medium">{item.label}</span>
          )}
        </React.Fragment>
        )
      )}
    </nav>
  );
}