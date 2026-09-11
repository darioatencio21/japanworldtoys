"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  Sparkles,
  ImageIcon,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Upload,
  Loader2,
} from "lucide-react";
import { uploadImage } from "./image-upload-field";

type ProductRow = {
  id: string;
  nombre: string;
  slug: string;
  sku: string;
  descripcion: string | null;
  precio: number;
  precioComparativo: number | null;
  stock: number;
  categoriaId: string;
  categoriaNombre: string;
  categoriaPadre: string | null;
  marcaId: string | null;
  marcaNombre: string | null;
  estado: string;
  destacado: boolean;
  esNovedad: boolean;
  franquiciaIds: string[];
  imagenes: { url: string; alt: string }[];
  ventas: number;
};

type CategoriaOption = {
  id: string;
  nombre: string;
  parentId: string | null;
  padreNombre: string | null;
};

type MarcaOption = {
  id: string;
  nombre: string;
};

type FranquiciaOption = {
  id: string;
  nombre: string;
};

const ESTADO_BADGES: Record<string, { variant: "default" | "success" | "warning" | "error"; label: string }> = {
  ACTIVO: { variant: "success", label: "Activo" },
  PREVENTA: { variant: "warning", label: "Preventa" },
  PROXIMAMENTE: { variant: "warning", label: "Próximamente" },
  AGOTADO: { variant: "error", label: "Agotado" },
  DESCONTINUADO: { variant: "default", label: "Descontinuado" },
};

const ESTADO_OPTIONS = [
  { value: "ACTIVO", label: "Activo" },
  { value: "PREVENTA", label: "Preventa" },
  { value: "PROXIMAMENTE", label: "Próximamente" },
  { value: "AGOTADO", label: "Agotado" },
  { value: "DESCONTINUADO", label: "Descontinuado" },
];

type FormState = {
  nombre: string;
  slug: string;
  sku: string;
  descripcion: string;
  precio: string;
  precioComparativo: string;
  stock: string;
  categoriaId: string;
  marcaId: string;
  nuevaMarca: string;
  estado: string;
  destacado: boolean;
  esNovedad: boolean;
  franquiciaIds: string[];
  nuevaFranquicia: string;
  imagenes: { url: string; alt: string }[];
};

const EMPTY_FORM: FormState = {
  nombre: "",
  slug: "",
  sku: "",
  descripcion: "",
  precio: "",
  precioComparativo: "",
  stock: "0",
  categoriaId: "",
  marcaId: "",
  nuevaMarca: "",
  estado: "ACTIVO",
  destacado: false,
  esNovedad: false,
  franquiciaIds: [],
  nuevaFranquicia: "",
  imagenes: [],
};

const MAX_IMAGES = 4;

// Máximo de productos visibles por defecto; el resto se ve con "Ver más"
const PAGE_SIZE = 6;

const INPUT_LIMITS = {
  nombre: 50,
  slug: 50,
  descripcion: 300,
  precio: 8,
  stock: 6,
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function sanitizeNombre(value: string): string {
  return value.slice(0, INPUT_LIMITS.nombre);
}

function sanitizeDescripcion(value: string): string {
  return value.slice(0, INPUT_LIMITS.descripcion);
}

function sanitizeNumero(value: string, maxDigits: number): string {
  const cleaned = value.replace(/[^\d]/g, "");
  return cleaned.slice(0, maxDigits);
}

function formatPrice(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductsManager({
  initialProducts,
  categories,
  brands,
  franchises,
  canDelete,
}: {
  initialProducts: ProductRow[];
  categories: CategoriaOption[];
  brands: MarcaOption[];
  franchises: FranquiciaOption[];
  canDelete: boolean;
}) {
  const [products, setProducts] = useState<ProductRow[]>(initialProducts);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [categoriesList, setCategoriesList] = useState<CategoriaOption[]>(categories);
  const [brandsList, setBrandsList] = useState<MarcaOption[]>(brands);
  const [franchisesList, setFranchisesList] = useState<FranquiciaOption[]>(franchises);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("nuevo") === "1") {
      openCreate();
      const url = new URL(window.location.href);
      url.searchParams.delete("nuevo");
      window.history.replaceState({}, "", url.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (product: ProductRow) => {
    setEditingId(product.id);
    setForm({
      nombre: product.nombre,
      slug: product.slug,
      sku: product.sku,
      descripcion: product.descripcion || "",
      precio: String(product.precio),
      precioComparativo: product.precioComparativo != null ? String(product.precioComparativo) : "",
      stock: String(product.stock),
      categoriaId: product.categoriaId || "",
      marcaId: product.marcaId || "",
      nuevaMarca: "",
      estado: product.estado,
      destacado: product.destacado,
      esNovedad: product.esNovedad,
      franquiciaIds: product.franquiciaIds,
      nuevaFranquicia: "",
      imagenes: product.imagenes.map((img) => ({ url: img.url, alt: img.alt })),
    });
    setIsModalOpen(true);
  };

  const toggleFranquicia = (id: string) => {
    setForm((prev) => ({
      ...prev,
      franquiciaIds: prev.franquiciaIds.includes(id)
        ? prev.franquiciaIds.filter((f) => f !== id)
        : [...prev.franquiciaIds, id],
    }));
  };

  const moveImagen = (index: number, direction: -1 | 1) => {
    setForm((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.imagenes.length) return prev;
      const next = [...prev.imagenes];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return { ...prev, imagenes: next };
    });
  };

  const handleImageFile = async (index: number, file: File | undefined) => {
    if (!file) return;
    setUploadingIndex(index);
    try {
      const url = await uploadImage(file);
      setForm((prev) => {
        const next = [...prev.imagenes];
        if (next[index]) next[index] = { ...next[index], url };
        return { ...prev, imagenes: next };
      });
      toast.success("Imagen subida.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo subir la imagen.");
    } finally {
      setUploadingIndex(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const crearMarca = async (): Promise<string | null> => {
    const nombre = form.nuevaMarca.trim();
    if (!nombre) {
      toast.error("Escribí el nombre de la nueva marca.");
      return null;
    }
    try {
      const res = await fetch("/api/admin/marcas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al crear la marca.");
        return null;
      }
      setBrandsList((prev) => {
        if (prev.some((b) => b.id === data.brand.id)) return prev;
        return [...prev, data.brand];
      });
      toast.success(`Marca "${data.brand.nombre}" creada.`);
      return data.brand.id as string;
    } catch {
      toast.error("Error de conexión.");
      return null;
    }
  };

  const crearFranquicia = async (): Promise<string | null> => {
    const nombre = form.nuevaFranquicia.trim();
    if (!nombre) {
      toast.error("Escribí el nombre de la nueva franquicia.");
      return null;
    }
    try {
      const res = await fetch("/api/admin/franquicias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al crear la franquicia.");
        return null;
      }
      setFranchisesList((prev) => {
        if (prev.some((f) => f.id === data.franchise.id)) return prev;
        return [...prev, data.franchise];
      });
      toast.success(`Franquicia "${data.franchise.nombre}" creada.`);
      return data.franchise.id as string;
    } catch {
      toast.error("Error de conexión.");
      return null;
    }
  };

  const handleSave = async () => {
    if (form.marcaId === "__nueva__") {
      toast.error("Creá la nueva marca para poder continuar.");
      return;
    }
    if (!form.nombre.trim()) {
      toast.error("El nombre es obligatorio.");
      return;
    }
    if (!form.sku.trim()) {
      toast.error("El SKU es obligatorio.");
      return;
    }
    if (!form.categoriaId) {
      toast.error("Seleccioná una categoría.");
      return;
    }
    if (form.precio === "" || Number(form.precio) < 0) {
      toast.error("Ingresá un precio válido.");
      return;
    }
    if (form.stock === "" || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) {
      toast.error("Ingresá un stock válido.");
      return;
    }

    let franquiciaIds = form.franquiciaIds;
    if (form.nuevaFranquicia.trim()) {
      const id = await crearFranquicia();
      if (!id) return;
      franquiciaIds = [...franquiciaIds, id];
      setForm((prev) => ({ ...prev, franquiciaIds, nuevaFranquicia: "" }));
    }

    const cleanImagenes = form.imagenes.slice(0, MAX_IMAGES).filter((img) => img.url.trim() !== "");
    if (cleanImagenes.length === 0) {
      toast.error("Cargá al menos una imagen.");
      return;
    }

    setIsSaving(true);
    const url = editingId ? `/api/admin/productos/${editingId}` : "/api/admin/productos";
    const method = editingId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          slug: form.slug.trim() || form.nombre,
          sku: form.sku.trim(),
          descripcion: form.descripcion.trim(),
          precio: Number(form.precio),
          precioComparativo: form.precioComparativo !== "" ? Number(form.precioComparativo) : null,
          stock: Number(form.stock),
          categoriaId: form.categoriaId,
          marcaId: form.marcaId || null,
          estado: form.estado,
          destacado: form.destacado,
          esNovedad: form.esNovedad,
          franquiciaIds,
          imagenes: cleanImagenes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al guardar el producto.");
        return;
      }

      const saved = data.product;
      const row: ProductRow = {
        id: saved.id,
        nombre: saved.nombre,
        slug: saved.slug,
        sku: saved.sku,
        descripcion: saved.descripcion,
        precio: Number(saved.precio),
        precioComparativo: saved.precioComparativo ? Number(saved.precioComparativo) : null,
        stock: saved.stock,
        categoriaId: saved.categoriaId,
        categoriaNombre: saved.categoria?.nombre || "",
        categoriaPadre: saved.categoria?.parent?.nombre || null,
        marcaId: saved.marcaId,
        marcaNombre: saved.marca?.nombre || null,
        estado: saved.estado,
        destacado: saved.destacado,
        esNovedad: saved.esNovedad,
        franquiciaIds: saved.franquicias?.map((f: { id: string }) => f.id) || franquiciaIds,
        imagenes: (saved.imagenes || []).map(
          (img: { url: string; alt: string }) => ({ url: img.url, alt: img.alt || "" })
        ),
        ventas: editingId
          ? products.find((p) => p.id === editingId)?.ventas || 0
          : 0,
      };

      if (editingId) {
        setProducts((prev) => prev.map((p) => (p.id === editingId ? row : p)));
        toast.success("Producto actualizado.");
      } else {
        setProducts((prev) => [row, ...prev]);
        toast.success("Producto creado.");
      }
      setIsModalOpen(false);
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (product: ProductRow) => {
    if (!window.confirm(`¿Eliminar el producto "${product.nombre}"?`)) return;
    setIsDeleting(product.id);
    try {
      const res = await fetch(`/api/admin/productos/${product.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al eliminar.");
        return;
      }
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast.success("Producto eliminado.");
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setIsDeleting(null);
    }
  };

  const renderActions = (product: ProductRow, className?: string) => (
    <div className={cn("flex flex-shrink-0 items-center gap-1.5", className)}>
      <a
        href={`/producto/${product.slug}`}
        target="_blank"
        className="h-9 w-9 md:h-8 md:w-8 rounded-lg flex items-center justify-center text-jw-gray-600 hover:bg-jw-off-white transition-colors"
        aria-label="Ver producto"
        title="Ver producto"
      >
        <ExternalLink className="h-4 w-4" />
      </a>
      <button
        onClick={() => openEdit(product)}
        className="h-9 w-9 md:h-8 md:w-8 rounded-lg flex items-center justify-center text-jw-gray-600 hover:bg-jw-off-white transition-colors"
        aria-label="Editar"
        title="Editar"
      >
        <Pencil className="h-4 w-4" />
      </button>
      {canDelete && product.ventas === 0 && (
        <button
          onClick={() => handleDelete(product)}
          disabled={isDeleting === product.id}
          className="h-9 w-9 md:h-8 md:w-8 rounded-lg flex items-center justify-center text-jw-error hover:bg-jw-error/10 transition-colors disabled:opacity-50"
          aria-label="Eliminar"
          title="Eliminar"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  const filtered = query.trim()
    ? products.filter(
        (p) =>
          p.nombre.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase())
      )
    : products;

  // Solo se muestran PAGE_SIZE productos; "Ver más" revela de a 6
  const visible = filtered.slice(0, visibleCount);
  const hiddenCount = filtered.length - visible.length;

  const fieldClass =
    "flex h-11 w-full rounded-lg border border-jw-gray-300 bg-white px-3 py-2 text-sm text-jw-black transition-colors " +
    "placeholder:text-jw-gray-400 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jw-red focus-visible:border-jw-red";

  const inputLabel = "text-xs font-semibold text-jw-black mb-1.5 block";

  return (
    <div>
      <Toaster position="top-right" />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-jw-black">
            Productos
          </h1>
          <p className="text-jw-gray-500 text-sm mt-1">
            {products.length} productos en catálogo
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-jw-red text-white text-sm font-semibold px-4 h-11 hover:bg-jw-red-dark transition-colors sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Nuevo producto
        </button>
      </div>

      <div className="mb-4 max-w-md">
        <input
          className={fieldClass}
          placeholder="Buscar por nombre o SKU..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          maxLength={70}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-jw-gray-300 rounded-2xl px-6 py-12 sm:p-16 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-jw-red/10 flex items-center justify-center mb-3">
            <ImageIcon className="h-6 w-6 text-jw-red" />
          </div>
          <p className="font-semibold text-jw-black mb-1">
            {query.trim() ? "Sin resultados" : "No hay productos todavía"}
          </p>
          <p className="text-sm text-jw-gray-500">
            {query.trim()
              ? "Probá con otro nombre o SKU."
              : "Creá tu primer producto con el botón \"Nuevo producto\"."}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: tarjetas */}
          <div className="md:hidden space-y-3">
            {visible.map((product) => {
              const badge = ESTADO_BADGES[product.estado] || {
                variant: "default",
                label: product.estado,
              };
              const img = product.imagenes[0];
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-jw-gray-200 p-4"
                >
                  <div className="flex gap-3">
                    <div className="h-16 w-16 rounded-xl bg-jw-gray-100 overflow-hidden flex-shrink-0 border border-jw-gray-200">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img.url}
                          alt={img.alt || product.nombre}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-jw-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="min-w-0 font-semibold text-jw-black text-sm leading-snug line-clamp-2">
                              {product.nombre}
                            </p>
                            {product.destacado && (
                              <Star className="h-3.5 w-3.5 text-jw-warning fill-jw-warning flex-shrink-0" />
                            )}
                            {product.esNovedad && (
                              <Sparkles className="h-3.5 w-3.5 text-jw-red flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-jw-gray-500 mt-0.5 truncate">
                            {product.sku}
                            {product.marcaNombre ? ` · ${product.marcaNombre}` : ""}
                          </p>
                        </div>
                        <Badge
                          variant={badge.variant}
                          className="flex-shrink-0 whitespace-nowrap"
                        >
                          {badge.label}
                        </Badge>
                      </div>

                      <p className="text-xs text-jw-gray-500 mt-1.5 truncate">
                        {product.categoriaPadre
                          ? `${product.categoriaPadre} > ${product.categoriaNombre}`
                          : product.categoriaNombre}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-3 mt-3 pt-3 border-t border-jw-gray-100">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-jw-black">
                        {formatPrice(product.precio)}
                        {product.precioComparativo != null && (
                          <span className="ml-2 text-[11px] text-jw-gray-400 line-through font-normal">
                            {formatPrice(product.precioComparativo)}
                          </span>
                        )}
                      </p>
                      <p className="text-xs mt-0.5">
                        <span
                          className={cn(
                            "font-semibold",
                            product.stock === 0
                              ? "text-jw-error"
                              : product.stock <= 5
                                ? "text-jw-warning"
                                : "text-jw-success"
                          )}
                        >
                          {product.stock} u.
                        </span>
                        {product.ventas > 0 && (
                          <span className="text-jw-gray-400">
                            {" "}
                            · {product.ventas} vendidos
                          </span>
                        )}
                      </p>
                    </div>
                    {renderActions(product)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: tabla */}
          <div className="hidden md:block bg-white rounded-2xl border border-jw-gray-200 overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-jw-gray-200 text-left text-xs text-jw-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 font-semibold">Producto</th>
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 font-semibold">Precio</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-jw-gray-100">
              {visible.map((product) => {
                const badge = ESTADO_BADGES[product.estado] || {
                  variant: "default",
                  label: product.estado,
                };
                const img = product.imagenes[0];
                return (
                  <tr key={product.id} className="hover:bg-jw-off-white transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-jw-gray-100 overflow-hidden flex-shrink-0 border border-jw-gray-200">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={img.url}
                              alt={img.alt || product.nombre}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-jw-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-jw-black truncate max-w-[220px]">
                              {product.nombre}
                            </p>
                            {product.destacado && (
                              <Star className="h-3.5 w-3.5 text-jw-warning fill-jw-warning" />
                            )}
                            {product.esNovedad && (
                              <Sparkles className="h-3.5 w-3.5 text-jw-red" />
                            )}
                          </div>
                          <p className="text-xs text-jw-gray-500">
                            {product.sku}
                            {product.marcaNombre ? ` · ${product.marcaNombre}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-jw-gray-700">
                      {product.categoriaPadre
                        ? `${product.categoriaPadre} > ${product.categoriaNombre}`
                        : product.categoriaNombre}
                    </td>
                    <td className="px-4 py-3 text-jw-black font-medium">
                      {formatPrice(product.precio)}
                      {product.precioComparativo != null && (
                        <span className="block text-[11px] text-jw-gray-400 line-through font-normal">
                          {formatPrice(product.precioComparativo)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          product.stock === 0
                            ? "text-jw-error"
                            : product.stock <= 5
                              ? "text-jw-warning"
                              : "text-jw-success"
                        )}
                      >
                        {product.stock} u.
                      </span>
                      {product.ventas > 0 && (
                        <span className="block text-[11px] text-jw-gray-400">
                          {product.ventas} vendidos
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {renderActions(product, "justify-end")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>

          {hiddenCount > 0 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="inline-flex h-11 px-6 items-center rounded-lg border border-jw-gray-300 bg-white text-sm font-semibold text-jw-black hover:border-jw-red hover:text-jw-red transition-colors"
              >
                Ver más ({hiddenCount} restantes)
              </button>
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative min-h-full flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90dvh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-jw-gray-200 sticky top-0 bg-white z-10">
                <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-jw-black">
                  {editingId ? "Editar producto" : "Nuevo producto"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-jw-gray-500 hover:bg-jw-off-white transition-colors"
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>

              <div className="px-6 py-5 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={inputLabel}>Nombre *</label>
                    <input
                      className={fieldClass}
                      value={form.nombre}
                      maxLength={INPUT_LIMITS.nombre}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          nombre: sanitizeNombre(e.target.value),
                          slug: e.target.value === form.nombre ? form.slug : e.target.value,
                        })
                      }
                      placeholder="Pop! One Piece Luffy"
                    />
                    <span className="text-[11px] text-jw-gray-400">
                      {form.nombre.length}/{INPUT_LIMITS.nombre}
                    </span>
                  </div>
                  <div>
                    <label className={inputLabel}>SKU *</label>
                    <input
                      className={fieldClass}
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value })}
                      placeholder="OP-001"
                    />
                  </div>
                </div>

                <div>
                  <label className={inputLabel}>
                    Slug{" "}
                    <span className="text-jw-gray-400 font-normal">
                      (si lo dejás vacío se genera desde el nombre)
                    </span>
                  </label>
                  <input
                    className={fieldClass}
                    value={form.slug}
                    maxLength={INPUT_LIMITS.slug}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        slug: slugify(e.target.value).slice(0, INPUT_LIMITS.slug),
                      })
                    }
                    placeholder="pop-one-piece-luffy"
                  />
                  <span className="text-[11px] text-jw-gray-400">
                    {form.slug.length}/{INPUT_LIMITS.slug}
                  </span>
                </div>

                <div>
                  <label className={inputLabel}>Descripción</label>
                  <textarea
                    className="w-full rounded-lg border border-jw-gray-300 bg-white px-3 py-3 text-sm text-jw-black transition-colors placeholder:text-jw-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jw-red focus-visible:border-jw-red min-h-[90px]"
                    value={form.descripcion}
                    maxLength={INPUT_LIMITS.descripcion}
                    onChange={(e) =>
                      setForm({ ...form, descripcion: sanitizeDescripcion(e.target.value) })
                    }
                    placeholder="Descripción del producto..."
                  />
                  <span className="text-[11px] text-jw-gray-400">
                    {form.descripcion.length}/{INPUT_LIMITS.descripcion}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                  <div>
                    <label className={inputLabel}>Precio (ARS) *</label>
                    <input
                      className={fieldClass}
                      type="text"
                      inputMode="numeric"
                      value={form.precio}
                      onChange={(e) =>
                        setForm({ ...form, precio: sanitizeNumero(e.target.value, INPUT_LIMITS.precio) })
                      }
                      placeholder="45000"
                    />
                    <span className="text-[11px] text-jw-gray-400">
                      {form.precio.length}/{INPUT_LIMITS.precio} dígitos
                    </span>
                  </div>
                  <div>
                    <label className={inputLabel}>
                      Precio comparativo{" "}
                      <span className="text-jw-gray-400 font-normal">(tachado)</span>
                    </label>
                    <input
                      className={fieldClass}
                      type="text"
                      inputMode="numeric"
                      value={form.precioComparativo}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          precioComparativo: sanitizeNumero(e.target.value, INPUT_LIMITS.precio),
                        })
                      }
                      placeholder="50000"
                    />
                    <span className="text-[11px] text-jw-gray-400">
                      {form.precioComparativo.length}/{INPUT_LIMITS.precio} dígitos
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={inputLabel}>Categoría *</label>
                    <select
                      className={fieldClass}
                      value={form.categoriaId}
                      onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
                    >
                      <option value="">Seleccionar...</option>
                      {categoriesList.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.padreNombre ? `${cat.padreNombre} > ${cat.nombre}` : cat.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={inputLabel}>Marca</label>
                    <select
                      className={fieldClass}
                      value={form.marcaId}
                      onChange={(e) => setForm({ ...form, marcaId: e.target.value })}
                    >
                      <option value="">Sin marca</option>
                      {brandsList.map((marca) => (
                        <option key={marca.id} value={marca.id}>
                          {marca.nombre}
                        </option>
                      ))}
                      <option value="__nueva__">＋ Crear nueva marca...</option>
                    </select>
                    {form.marcaId === "__nueva__" && (
                      <div className="flex gap-2 mt-2">
                        <input
                          className={fieldClass}
                          value={form.nuevaMarca}
                          maxLength={INPUT_LIMITS.nombre}
                          onChange={(e) =>
                            setForm({ ...form, nuevaMarca: sanitizeNombre(e.target.value) })
                          }
                          placeholder="Nombre de la nueva marca"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            const id = await crearMarca();
                            if (id) setForm((prev) => ({ ...prev, marcaId: id, nuevaMarca: "" }));
                          }}
                          className="flex-shrink-0 rounded-lg bg-jw-red text-white px-3 h-11 text-sm font-semibold hover:bg-jw-red-dark transition-colors"
                        >
                          Crear
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className={inputLabel}>Stock *</label>
                    <input
                      className={fieldClass}
                      type="number"
                      min={0}
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={inputLabel}>Estado</label>
                    <select
                      className={fieldClass}
                      value={form.estado}
                      onChange={(e) => setForm({ ...form, estado: e.target.value })}
                    >
                      {ESTADO_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end pb-1.5">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none h-11">
                        <input
                          type="checkbox"
                          checked={form.destacado}
                          onChange={(e) => setForm({ ...form, destacado: e.target.checked })}
                          className="h-4 w-4 accent-jw-red"
                        />
                        <span className="text-sm font-medium text-jw-black flex items-center gap-1">
                          Destacado <Star className="h-3.5 w-3.5 text-jw-warning fill-jw-warning" />
                        </span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer select-none h-11">
                        <input
                          type="checkbox"
                          checked={form.esNovedad}
                          onChange={(e) => setForm({ ...form, esNovedad: e.target.checked })}
                          className="h-4 w-4 accent-jw-red"
                        />
                        <span className="text-sm font-medium text-jw-black flex items-center gap-1">
                          Novedad <Sparkles className="h-3.5 w-3.5 text-jw-red" />
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {franchises.length > 0 && (
                  <div>
                    <label className={inputLabel}>Franquicias</label>
                    <div className="flex flex-wrap gap-2">
                      {franchisesList.map((f) => {
                        const selected = form.franquiciaIds.includes(f.id);
                        return (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => toggleFranquicia(f.id)}
                            className={cn(
                              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                              selected
                                ? "bg-jw-red text-white border-jw-red"
                                : "bg-white text-jw-gray-700 border-jw-gray-300 hover:border-jw-red hover:text-jw-red"
                            )}
                          >
                            {f.nombre}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <input
                        className={fieldClass}
                        value={form.nuevaFranquicia}
                        maxLength={INPUT_LIMITS.nombre}
                        onChange={(e) =>
                          setForm({ ...form, nuevaFranquicia: sanitizeNombre(e.target.value) })
                        }
                        placeholder="Agregar franquicia nueva..."
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const id = await crearFranquicia();
                          if (id) setForm((prev) => ({
                            ...prev,
                            franquiciaIds: prev.franquiciaIds.includes(id)
                              ? prev.franquiciaIds
                              : [...prev.franquiciaIds, id],
                            nuevaFranquicia: "",
                          }));
                        }}
                        className="flex-shrink-0 rounded-lg bg-jw-red text-white px-4 h-11 text-sm font-semibold hover:bg-jw-red-dark transition-colors"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={inputLabel}>Imágenes *</label>
                    <button
                      type="button"
                      disabled={form.imagenes.length >= MAX_IMAGES}
                      onClick={() =>
                        setForm({ ...form, imagenes: [...form.imagenes, { url: "", alt: "" }] })
                      }
                      className="text-xs font-semibold text-jw-red hover:text-jw-red-dark disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      + Agregar imagen ({form.imagenes.length}/{MAX_IMAGES})
                    </button>
                  </div>
                  <p className="text-[11px] text-jw-gray-400 -mt-2 mb-2">
                    Hasta {MAX_IMAGES} imágenes. La primera con URL (estrella dorada) es la portada.
                  </p>
                  <div className="space-y-3">
                    {form.imagenes.map((img, i) => {
                      const filledBefore = form.imagenes
                        .slice(0, i)
                        .filter((im) => im.url.trim()).length;
                      const hasImage = img.url.trim().length > 0;
                      const isMain = hasImage && filledBefore === 0;
                      return (
                        <div
                          key={i}
                          className={cn(
                            "rounded-xl border p-3 transition-colors",
                            isMain ? "border-jw-gold bg-jw-gold/5" : "border-jw-gray-200 bg-white"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {/* Thumbnail */}
                            <div
                              className={cn(
                                "relative h-14 w-14 rounded-lg overflow-hidden flex-shrink-0 border flex items-center justify-center",
                                hasImage ? "bg-jw-gray-100 border-jw-gray-200" : "bg-jw-off-white border-dashed"
                              )}
                            >
                              {hasImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={img.url}
                                  alt={img.alt || `Imagen ${i + 1}`}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="h-5 w-5 text-jw-gray-400" />
                              )}
                              {isMain && (
                                <span className="absolute -top-1.5 -right-1.5">
                                  <Star className="h-5 w-5 text-jw-gold fill-jw-gold drop-shadow-sm" />
                                </span>
                              )}
                            </div>

                            {/* Position + inputs */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px] font-bold text-jw-gray-500 uppercase tracking-wide">
                                  Imagen {i + 1}
                                  {isMain && (
                                    <span className="ml-2 text-jw-gold-dark">· portada</span>
                                  )}
                                </span>
                                {!hasImage && (
                                  <span className="text-[10px] text-jw-gray-400">sin URL</span>
                                )}
                              </div>
                              <div className="space-y-1.5">
                                <div className="flex gap-1.5">
                                  <input
                                    className={fieldClass}
                                    value={img.url}
                                    onChange={(e) => {
                                      const next = [...form.imagenes];
                                      next[i] = { ...next[i], url: e.target.value };
                                      setForm({ ...form, imagenes: next });
                                    }}
                                    placeholder="URL de la imagen"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setUploadingIndex(i);
                                      imageInputRef.current?.click();
                                    }}
                                    disabled={uploadingIndex !== null}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-jw-gray-300 bg-white px-2.5 h-11 text-xs font-semibold text-jw-gray-700 hover:bg-jw-off-white hover:border-jw-red transition-colors flex-shrink-0 disabled:opacity-50"
                                    title="Subir imagen desde la PC"
                                  >
                                    {uploadingIndex === i ? (
                                      <Loader2 className="h-4 w-4 animate-spin text-jw-red" />
                                    ) : (
                                      <Upload className="h-4 w-4 text-jw-red" />
                                    )}
                                    <span className="hidden sm:inline">
                                      {uploadingIndex === i ? "Subiendo..." : "Subir"}
                                    </span>
                                  </button>
                                </div>
                                <input
                                  className={fieldClass}
                                  value={img.alt}
                                  maxLength={INPUT_LIMITS.descripcion}
                                  onChange={(e) => {
                                    const next = [...form.imagenes];
                                    next[i] = { ...next[i], alt: sanitizeDescripcion(e.target.value) };
                                    setForm({ ...form, imagenes: next });
                                  }}
                                  placeholder="Texto alternativo (alt)"
                                />
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col items-center gap-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => moveImagen(i, -1)}
                                disabled={i === 0}
                                className="h-7 w-7 rounded-md flex items-center justify-center text-jw-gray-600 hover:bg-jw-off-white hover:text-jw-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Subir imagen"
                                title="Mover hacia arriba"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveImagen(i, 1)}
                                disabled={i === form.imagenes.length - 1}
                                className="h-7 w-7 rounded-md flex items-center justify-center text-jw-gray-600 hover:bg-jw-off-white hover:text-jw-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Bajar imagen"
                                title="Mover hacia abajo"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setForm({
                                    ...form,
                                    imagenes: form.imagenes.filter((_, idx) => idx !== i),
                                  })
                                }
                                className="h-7 w-7 rounded-md flex items-center justify-center text-jw-error hover:bg-jw-error/10 transition-colors"
                                aria-label="Quitar imagen"
                                title="Quitar imagen"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {form.imagenes.length > 0 && (
                      <p className="text-xs text-jw-gray-500 pt-1">
                        La imagen con la estrella es la portada en la tienda. Usá las flechas para ordenar.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  handleImageFile(uploadingIndex ?? 0, e.target.files?.[0]);
                }}
              />

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-jw-gray-200 sticky bottom-0 bg-white">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-jw-gray-200 px-5 h-11 text-sm font-semibold text-jw-gray-700 hover:bg-jw-off-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-lg bg-jw-red text-white px-6 h-11 text-sm font-semibold hover:bg-jw-red-dark transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear producto"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}