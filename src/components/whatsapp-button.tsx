"use client";

import { usePathname } from "next/navigation";
import { WHATSAPP_LINK } from "@/lib/constants";
export function WhatsAppButton() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin") || pathname === "/login") return null;

  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 group"
      aria-label="Contactanos por WhatsApp"
    >
      {/* Tooltip */}
      <span className="hidden sm:block bg-white text-jw-black text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        ¡Escribinos!
      </span>

      {/* Button */}
      <div className="h-14 w-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200 animate-pulse-glow">
        <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white">
          <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.132 6.744 3.058 9.374L1.054 31.25l6.114-1.98C9.722 30.82 12.764 32 16.004 32 24.83 32 32 24.822 32 16S24.83 0 16.004 0zm9.322 22.608c-.39 1.1-1.932 2.014-3.168 2.28-.84.18-1.936.322-5.626-1.21-4.724-1.962-7.764-6.764-7.998-7.076-.226-.312-1.896-2.524-1.896-4.814 0-2.29 1.2-3.416 1.628-3.872.39-.416.952-.54 1.264-.54.314 0 .626.002.898.016.29.014.678-.11 1.058.808.39.946 1.324 3.224 1.438 3.46.114.236.19.51.038.822-.152.312-.228.506-.454.822-.226.316-.476.704-.678.94-.226.264-.46.55-.196.946.264.396 1.172 1.936 2.514 3.136 1.728 1.544 3.184 2.024 3.638 2.25.39.196.616.164.842-.098.226-.264.964-1.124 1.222-1.514.256-.39.512-.326.864-.196.352.13 2.22 1.05 2.602 1.24.382.19.636.286.732.444.094.156.094.92-.298 1.994z" />
        </svg>
      </div>
    </a>
  );
}
