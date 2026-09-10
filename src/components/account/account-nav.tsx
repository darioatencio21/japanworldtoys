"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { ShieldCheck, LogOut } from "lucide-react";

export function AccountNav({ rol }: { rol: string }) {
  const pathname = usePathname();
  const isStaff = ["ADMIN", "SUPERADMIN", "EDITOR", "DEPOSITO"].includes(rol);
  const isAdminActive = pathname === "/admin" || pathname.startsWith("/admin");

  return (
    <nav className="bg-white rounded-2xl border border-jw-gray-200 overflow-hidden">
      <div className="p-3 space-y-1">
        {isStaff && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors",
              isAdminActive
                ? "bg-jw-red text-white shadow-sm"
                : "text-jw-gray-700 hover:bg-jw-off-white"
            )}
          >
            <ShieldCheck className="h-4 w-4" />
            Admin
          </Link>
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-jw-error hover:bg-jw-error/5 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}