"use client";

import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Plus, Pencil, Trash2, Power, LayoutTemplate } from "lucide-react";
import { ImageUploadField } from "./image-upload-field";

type PromoBlockData = {
  id: string;
  badge: string | null;
  titulo: string;
  descripcion: string | null;
  backgroundImage: string | null;
  backgroundImageMobile: string | null;
  textoCTA: string | null;
  linkCTA: string | null;
  orden: number;
  activo: boolean;
};

const EMPTY_FORM = {
  badge: "",
  titulo: "",
  descripcion: "",
  backgroundImage: "",
  backgroundImageMobile: "",
  textoCTA: "",
  linkCTA: "",
  orden: 0,
  activo: true,
};

export function PromoBlocksManager({
  initialBlocks,
  canDelete,
}: {
  initialBlocks: PromoBlockData[];
  canDelete: boolean;
}) {
  const [blocks, setBlocks] = useState<PromoBlockData[]>(initialBlocks);
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

  const openEdit = (b: PromoBlockData) => {
    setEditingId(b.id);
    setForm({
      badge: b.badge || "",
      titulo: b.titulo,
      descripcion: b.descripcion || "",
      backgroundImage: b.backgroundImage || "",
      backgroundImageMobile: b.backgroundImageMobile || "",
      textoCTA: b.textoCTA || "",
      linkCTA: b.linkCTA || "",
      orden: b.orden,
      activo: b.activo,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.titulo.trim()) {
      toast.error("El título es obligatorio.");
      return;
    }
    setIsSaving(true);
    const url = editingId
      ? `/api/admin/promo-blocks/${editingId}`
      : "/api/admin/promo-blocks";
    const method = editingId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          badge: form.badge,
          titulo: form.titulo,
          descripcion: form.descripcion,
          backgroundImage: form.backgroundImage,
          backgroundImageMobile: form.backgroundImageMobile,
          textoCTA: form.textoCTA,
          linkCTA: form.linkCTA,
          orden: Number(form.orden) || 0,
          activo: form.activo,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al guardar el bloque.");
        return;
      }

      if (editingId) {
        setBlocks((prev) =>
          prev.map((b) => (b.id === editingId ? data.promoBlock : b))
        );
        toast.success("Bloque actualizado.");
      } else {
        setBlocks((prev) => [...prev, data.promoBlock]);
        toast.success("Bloque creado.");
      }
      setIsModalOpen(false);
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (b: PromoBlockData) => {
    setIsToggling(b.id);
    try {
      const res = await fetch(`/api/admin/promo-blocks/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !b.activo }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al cambiar estado.");
        return;
      }
      setBlocks((prev) =>
        prev.map((x) => (x.id === b.id ? data.promoBlock : x))
      );
      toast.success(data.promoBlock.activo ? "Bloque activado." : "Bloque desactivado.");
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setIsToggling(null);
    }
  };

  const handleDelete = async (b: PromoBlockData) => {
    if (!window.confirm(`¿Eliminar el bloque "${b.titulo}"?`)) return;
    setIsDeleting(b.id);
    try {
      const res = await fetch(`/api/admin/promo-blocks/${b.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al eliminar.");
        return;
      }
      setBlocks((prev) => prev.filter((x) => x.id !== b.id));
      toast.success("Bloque eliminado.");
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
            Bloques home
          </h1>
          <p className="text-jw-gray-500 text-sm mt-1">
            {blocks.length} bloques · tarjetas promocionales grandes de la portada
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-jw-red text-white text-sm font-semibold px-4 h-11 hover:bg-jw-red-dark transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo bloque
        </button>
      </div>

      {blocks.length === 0 ? (
        <div className="bg-white border border-dashed border-jw-gray-300 rounded-2xl p-16 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-jw-red/10 flex items-center justify-center mb-3">
            <LayoutTemplate className="h-6 w-6 text-jw-red" />
          </div>
          <p className="font-semibold text-jw-black mb-1">No hay bloques todavía</p>
          <p className="text-sm text-jw-gray-500">Creá tu primera tarjeta promocional.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-jw-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-jw-gray-200 text-left text-xs text-jw-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 font-semibold">Bloque</th>
                <th className="px-4 py-3 font-semibold">Fondo</th>
                <th className="px-4 py-3 font-semibold">Orden</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-jw-gray-100">
              {blocks.map((b) => (
                <tr key={b.id} className="hover:bg-jw-off-white transition-colors">
                  <td className="px-4 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {b.badge && (
                          <Badge variant="gold" className="uppercase">{b.badge}</Badge>
                        )}
                        <p className="font-semibold text-jw-black">{b.titulo}</p>
                      </div>
                      {b.descripcion && (
                        <p className="text-xs text-jw-gray-500 truncate max-w-[280px] mt-0.5">
                          {b.descripcion}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {b.backgroundImage ? (
                      <div className="relative h-10 w-24 rounded-lg bg-jw-gray-100 overflow-hidden flex-shrink-0">
                        <Image
                          src={b.backgroundImage}
                          alt={b.titulo}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-jw-gray-400">Sin imagen</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-jw-gray-700">{b.orden}</td>
                  <td className="px-4 py-3">
                    <Badge variant={b.activo ? "success" : "default"}>
                      {b.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleToggle(b)}
                        disabled={isToggling === b.id}
                        className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                          b.activo
                            ? "text-jw-success hover:bg-jw-success/10"
                            : "text-jw-gray-400 hover:bg-jw-off-white"
                        )}
                        aria-label={b.activo ? "Desactivar" : "Activar"}
                        title={b.activo ? "Desactivar" : "Activar"}
                      >
                        <Power className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEdit(b)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-jw-gray-600 hover:bg-jw-off-white transition-colors"
                        aria-label="Editar"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(b)}
                          disabled={isDeleting === b.id}
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <div className="relative min-h-full flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90dvh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-jw-gray-200 sticky top-0 bg-white z-10">
                <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-jw-black">
                  {editingId ? "Editar bloque" : "Nuevo bloque"}
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
                <div className="pt-1">
                  <h3 className="text-sm font-bold text-jw-black mb-3">
                    Contenido
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={inputLabel}>Título *</label>
                      <input
                        className={fieldClass}
                        value={form.titulo}
                        onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                        placeholder="Demon Slayer"
                      />
                    </div>
                    <div>
                      <label className={inputLabel}>Etiqueta (badge)</label>
                      <input
                        className={fieldClass}
                        value={form.badge}
                        onChange={(e) => setForm({ ...form, badge: e.target.value })}
                        placeholder="COLECCIÓN"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className={inputLabel}>Descripción</label>
                    <textarea
                      className={`${fieldClass} h-20 resize-none py-2.5`}
                      value={form.descripcion}
                      onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                      placeholder="Figuras exclusivas de Kimetsu no Yaiba — Tanjiro, Nezuko, Zenitsu y más."
                      maxLength={300}
                    />
                  </div>
                </div>

                <div className="pt-1 border-t border-jw-gray-100">
                  <h3 className="text-sm font-bold text-jw-black mb-3">
                    Imágenes
                  </h3>
                  <div className="space-y-4">
                    <ImageUploadField
                      label="Imagen de fondo (desktop)"
                      value={form.backgroundImage}
                      onChange={(url) => setForm({ ...form, backgroundImage: url })}
                      placeholder="/img/banners/bg_card_demonslayer.webp"
                      hint="Cubre toda la tarjeta en pantallas grandes. Recomendado: panorámica (ej. 1080×450)."
                    />
                    <ImageUploadField
                      label="Imagen de fondo (celular)"
                      value={form.backgroundImageMobile}
                      onChange={(url) => setForm({ ...form, backgroundImageMobile: url })}
                      placeholder="/img/banners/bg_card_mobile.webp"
                      hint="Imagen alternativa de fondo para celular/tablet. Recomendado: más vertical o cuadrada (ej. 750×800)."
                    />
                  </div>
                </div>

                <div className="pt-1 border-t border-jw-gray-100">
                  <h3 className="text-sm font-bold text-jw-black mb-3">
                    Botón
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={inputLabel}>Texto del botón (CTA)</label>
                      <input
                        className={fieldClass}
                        value={form.textoCTA}
                        onChange={(e) => setForm({ ...form, textoCTA: e.target.value })}
                        placeholder="Explorar colección"
                      />
                    </div>
                    <div>
                      <label className={inputLabel}>Enlace del CTA</label>
                      <input
                        className={fieldClass}
                        value={form.linkCTA}
                        onChange={(e) => setForm({ ...form, linkCTA: e.target.value })}
                        placeholder="/franquicia/demon-slayer"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-1 border-t border-jw-gray-100">
                  <h3 className="text-sm font-bold text-jw-black mb-3">
                    Estado y orden
                  </h3>
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.activo}
                    onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                    className="h-4 w-4 accent-jw-red"
                  />
                  <span className="text-sm font-medium text-jw-black">Bloque activo</span>
                </label>

                <div className="sm:max-w-[140px] mt-4">
                  <label className={inputLabel}>Orden</label>
                  <input
                    type="number"
                    className={fieldClass}
                    value={form.orden}
                    onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })}
                  />
                </div>
                </div>
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
                  {isSaving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear bloque"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}