import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPriceWithInstallments(
  price: number,
  installments: number = 12
): { monthly: string; total: string } {
  const monthly = Math.ceil(price / installments);
  return {
    monthly: formatPrice(monthly),
    total: formatPrice(price),
  };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getStockLabel(stock: number): {
  label: string;
  color: string;
} {
  if (stock === 0) return { label: "Sin stock", color: "jw-error" };
  if (stock <= 3) return { label: "Pocas unidades", color: "jw-warning" };
  if (stock <= 5) return { label: "Últimas unidades", color: "jw-warning" };
  return { label: "En stock", color: "jw-success" };
}
