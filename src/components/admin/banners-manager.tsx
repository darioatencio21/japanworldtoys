"use client";

import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Plus,
  Pencil,
  Trash2,
  Power,
  ImageIcon,
  Calendar,
} from "lucide-react";

type BannerFranchise = { id: string; nombre: string };
type BannerData = {
  id: string;
  titulo: string;
  subtitulo: string | null;
  imagenDesktop: string;
  imagenMobile: string | null;
  textoCTA: string | null;
  linkCTA: string | null;
  tipo: string;
  orden: number;
  activo: boolean;
  activoDesde: string | Date | null;
  activoHasta: string | Date | null;
  franchiseId: string | null;
  franchise: BannerFranchise | null;
  createdAt: string | Date;
};

const TIPO_LABEL: Record<string, string> = {
  hero: "Hero",
  promo: "Promo",
  category: "Categoría",
};

const TIPO_VARIANT: Record<string, "info" | "warning" | "gold" | "default"> = {
  hero: "info",
  promo: "warning",
  category: "gold",
};

const EMPTY_FORM = {
  titulo: "",
  subtitulo: "",
  imagenDesktop: "",
  imagenMobile: "",
  textoCTA: "",
  linkCTA: "",
  tipo: "hero",
  orden: 0,
  activo: true,
  activoDesde: "",
  activoHasta: "",
  franchiseId: "",
};

export function BannersManager({
  initialBanners,
  franchises,
  canDelete,
}: {
  initialBanners: BannerData[];
  franchises: BannerFranchise[];
  canDelete: boolean;
}) {
  const [banners, setBanners] = useState<BannerData[]>(initialBanners);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (banner: BannerData) => {
    setEditingId(banner.id);
    setForm({
      titulo: banner.titulo,
      subtitulo: banner.subtitulo || "",
      imagenDesktop: banner.imagenDesktop,
      imagenMobile: banner.imagenMobile || "",
      textoCTA: banner.textoCTA || "",
      linkCTA: banner.linkCTA || "",
      tipo: banner.tipo,
      orden: banner.orden,
      activo: banner.activo,
      activoDesde: banner.activoDesde ? new Date(banner.activoDesde).toISOString().slice(0, 16) : "",
      activoHasta: banner.activoHasta ? new Date(banner.activoHasta).toISOString().slice(0, 16) : "",
      franchiseId: banner.franchiseId || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.titulo.trim()) {
      toast.error("El título es obligatorio.");
      return;
    }
    if (!form.imagenDesktop.trim()) {
      toast.error("La imagen desktop es obligatoria.");
      return;
    }

    setIsSaving(true);
    const url = editingId
      ? `/api/admin/banners/${editingId}`
      : "/api/admin/banners";
    const method = editingId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.titulo,
          subtitulo: form.subtitulo,
          imagenDesktop: form.imagenDesktop,
          imagenMobile: form.imagenMobile,
          textoCTA: form.textoCTA,
          linkCTA: form.linkCTA,
          tipo: form.tipo,
          orden: Number(form.orden) || 0,
          activo: form.activo,
          activoDesde: form.activoDesde || null,
          activoHasta: form.activoHasta || null,
          franchiseId: form.franchiseId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al guardar el banner.");
        return;
      }

      if (editingId) {
        setBanners((prev) =>
          prev.map((b) => (b.id === editingId ? data.banner : b))
        );
        toast.success("Banner actualizado.");
      } else {
        setBanners((prev) => [...prev, data.banner]);
        toast.success("Banner creado.");
      }
      setIsModalOpen(false);
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (banner: BannerData) => {
    setIsToggling(banner.id);
    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !banner.activo }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al cambiar estado.");
        return;
      }
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? data.banner : b))
      );
      toast.success(data.banner.activo ? "Banner activado." : "Banner desactivado.");
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setIsToggling(null);
    }
  };

  const handleDelete = async (banner: BannerData) => {
    if (!window.confirm(`¿Eliminar el banner "${banner.titulo}"?`)) return;
    setIsDeleting(banner.id);
    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al eliminar.");
        return;
      }
      setBanners((prev) => prev.filter((b) => b.id !== banner.id));
      toast.success("Banner eliminado.");
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setIsDeleting(null);
    }
  };

  const fieldClass =
    "flex h-11 w-full rounded-lg border border-jw-gray-300 bg-white px-3 py-2 text-sm text-jw-black transition-colors " +
    "placeholder:text-jw-gray-400 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jw-red focus-visible:border-jw-red";

  const inputLabel = "text-xs font-semibold text-jw-black mb-1.5 block";

  return (
    <div>
      <Toaster position="top-right" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-jw-black">
            Banners
          </h1>
          <p className="text-jw-gray-500 text-sm mt-1">
            {banners.length} banners · Hero, promo y categoría
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-jw-red text-white text-sm font-semibold px-4 h-11 hover:bg-jw-red-dark transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo banner
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="bg-white border border-dashed border-jw-gray-300 rounded-2xl p-16 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-jw-red/10 flex items-center justify-center mb-3">
            <ImageIcon className="h-6 w-6 text-jw-red" />
          </div>
          <p className="font-semibold text-jw-black mb-1">
            No hay banners todavía
          </p>
          <p className="text-sm text-jw-gray-500">
            Creá tu primer banner para el home de la tienda.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-jw-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-jw-gray-200 text-left text-xs text-jw-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 font-semibold">Banner</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Orden</th>
                <th className="px-4 py-3 font-semibold">Franquicia</th>
                <th className="px-4 py-3 font-semibold">Vigencia</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-jw-gray-100">
              {banners.map((banner) => {
                const now = new Date();
                const desde = banner.activoDesde ? new Date(banner.activoDesde) : null;
                const hasta = banner.activoHasta ? new Date(banner.activoHasta) : null;
                const vigente = banner.activo && (!desde || desde <= now) && (!hasta || hasta >= now);
                return (
                  <tr key={banner.id} className="hover:bg-jw-off-white transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-16 rounded-lg bg-jw-gray-100 overflow-hidden flex-shrink-0">
                          {banner.imagenDesktop && (
                            <Image
                              src={banner.imagenDesktop}
                              alt={banner.titulo}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-jw-black truncate max-w-[220px]">
                            {banner.titulo}
                          </p>
                          {banner.subtitulo && (
                            <p className="text-xs text-jw-gray-500 truncate max-w-[220px]">
                              {banner.subtitulo}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={TIPO_VARIANT[banner.tipo] || "default"}>
                        {TIPO_LABEL[banner.tipo] || banner.tipo}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-jw-gray-700">{banner.orden}</td>
                    <td className="px-4 py-3 text-jw-gray-700">
                      {banner.franchise?.nombre || <span className="text-jw-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {desde || hasta ? (
                        <span className="text-xs text-jw-gray-700 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-jw-gray-400" />
                          {desde ? desde.toLocaleDateString("es-AR") : "siempre"} →{" "}
                          {hasta ? hasta.toLocaleDateString("es-AR") : "siempre"}
                        </span>
                      ) : (
                        <span className="text-xs text-jw-gray-400">Permanente</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={vigente ? "success" : banner.activo ? "warning" : "default"}>
                        {!banner.activo ? "Inactivo" : vigente ? "Vigente" : "Programado"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggle(banner)}
                          disabled={isToggling === banner.id}
                          className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                            banner.activo
                              ? "text-jw-success hover:bg-jw-success/10"
                              : "text-jw-gray-400 hover:bg-jw-off-white"
                          )}
                          aria-label={banner.activo ? "Desactivar" : "Activar"}
                          title={banner.activo ? "Desactivar" : "Activar"}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEdit(banner)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-jw-gray-600 hover:bg-jw-off-white transition-colors"
                          aria-label="Editar"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(banner)}
                            disabled={isDeleting === banner.id}
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-jw-error hover:bg-jw-error/10 transition-colors"
                            aria-label="Eliminar"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative min-h-full flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-jw-gray-200 sticky top-0 bg-white z-10">
                <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-jw-black">
                  {editingId ? "Editar banner" : "Nuevo banner"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-jw-gray-500 hover:bg-jw-off-white transition-colors"
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>

              <div className="px-6 py-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={inputLabel}>Título *</label>
                    <input
                      className={fieldClass}
                      value={form.titulo}
                      onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                      placeholder="Nuevos Ingresos Funko"
                    />
                  </div>
                  <div>
                    <label className={inputLabel}>Tipo</label>
                    <select
                      className={fieldClass}
                      value={form.tipo}
                      onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    >
                      <option value="hero">Hero</option>
                      <option value="promo">Promo</option>
                      <option value="category">Categoría</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={inputLabel}>Subtítulo</label>
                  <input
                    className={fieldClass}
                    value={form.subtitulo}
                    onChange={(e) => setForm({ ...form, subtitulo: e.target.value })}
                    placeholder="Descubrí las últimas figuras que llegaron"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={inputLabel}>Imagen desktop *</label>
                    <input
                      className={fieldClass}
                      value={form.imagenDesktop}
                      onChange={(e) => setForm({ ...form, imagenDesktop: e.target.value })}
                      placeholder="/images/banners/banner.jpg"
                    />
                  </div>
                  <div>
                    <label className={inputLabel}>Imagen mobile</label>
                    <input
                      className={fieldClass}
                      value={form.imagenMobile}
                      onChange={(e) => setForm({ ...form, imagenMobile: e.target.value })}
                      placeholder="/images/banners/banner-mobile.jpg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={inputLabel}>Texto del botón (CTA)</label>
                    <input
                      className={fieldClass}
                      value={form.textoCTA}
                      onChange={(e) => setForm({ ...form, textoCTA: e.target.value })}
                      placeholder="Ver colección"
                    />
                  </div>
                  <div>
                    <label className={inputLabel}>Enlace del CTA</label>
                    <input
                      className={fieldClass}
                      value={form.linkCTA}
                      onChange={(e) => setForm({ ...form, linkCTA: e.target.value })}
                      placeholder="/productos?categoria=funkos"
                    />
                  </div>
                </div>

                {form.tipo === "category" && (
                  <div>
                    <label className={inputLabel}>Franquicia</label>
                    <select
                      className={fieldClass}
                      value={form.franchiseId}
                      onChange={(e) => setForm({ ...form, franchiseId: e.target.value })}
                    >
                      <option value="">Sin franquicia</option>
                      {franchises.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={inputLabel}>Orden</label>
                    <input
                      type="number"
                      className={fieldClass}
                      value={form.orden}
                      onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className={inputLabel}>Desde</label>
                    <input
                      type="datetime-local"
                      className={fieldClass}
                      value={form.activoDesde}
                      onChange={(e) => setForm({ ...form, activoDesde: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={inputLabel}>Hasta</label>
                    <input
                      type="datetime-local"
                      className={fieldClass}
                      value={form.activoHasta}
                      onChange={(e) => setForm({ ...form, activoHasta: e.target.value })}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.activo}
                    onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                    className="h-4 w-4 accent-jw-red"
                  />
                  <span className="text-sm font-medium text-jw-black">Banner activo</span>
                </label>
              </div>

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
                  {isSaving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear banner"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}