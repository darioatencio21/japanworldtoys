type PriceProduct = {
  precio: number | string | { toNumber(): number };
};

const toNumber = (v: number | string | { toNumber(): number } | null | undefined): number =>
  v == null ? 0 : typeof v === "number" ? v : typeof v === "string" ? Number(v) : v.toNumber();

export function priceForUser(
  product: PriceProduct,
  _rol?: string
): { precio: number; precioComparativo: null } {
  return { precio: toNumber(product.precio), precioComparativo: null };
}