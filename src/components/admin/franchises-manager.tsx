"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Pencil, Plus, Trash2, Layers } from "lucide-react";
import { ImageUploadField } from "./image-upload-field";

type FranchiseData = {
  id: string;
  nombre: string;
  slug: string;
  color: string | null;
  imagen: string | null;
  imagenMobile: string | null;
  mensaje: string | null;
  _count?: { productos: number };
};

const EMPTY_FORM = {
  nombre: "",
  color: "#E10600",
  imagen: "",
  imagenMobile: "",
  mensaje: "",
};

export function FranchisesManager({
  initialFranchises,
  canDelete,
}: {
  initialFranchises: FranchiseData[];
  canDelete: boolean;
}) {
  const [franchises, setFranchises] = useState<FranchiseData[]>(initialFranchises);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (f: FranchiseData) => {
    setEditingId(f.id);
    setForm({
      nombre: f.nombre,
      color: f.color || "#E10600",
      imagen: f.imagen || "",
      imagenMobile: f.imagenMobile || "",
      mensaje: f.mensaje || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre.trim()) {
      toast.error("El nombre es obligatorio.");
      return;
    }
    setIsSaving(true);
    const url = editingId
      ? `/api/admin/franquicias/${editingId}`
      : "/api/admin/franquicias";
    const method = editingId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          color: form.color,
          imagen: form.imagen,
          imagenMobile: form.imagenMobile,
          mensaje: form.mensaje,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al guardar la franquicia.");
        return;
      }

      if (editingId) {
        setFranchises((prev) =>
          prev.map((f) => (f.id === editingId ? { ...f, ...data.franchise } : f))
        );
        toast.success("Franquicia actualizada.");
      } else {
        setFranchises((prev) => [...prev, data.franchise]);
        toast.success("Franquicia creada.");
      }
      setIsModalOpen(false);
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (f: FranchiseData) => {
    if (!window.confirm(`¿Eliminar la franquicia "${f.nombre}"?`)) return;
    setIsDeleting(f.id);
    try {
      const res = await fetch(`/api/admin/franquicias/${f.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al eliminar.");
        return;
      }
      setFranchises((prev) => prev.filter((x) => x.id !== f.id));
      toast.success("Franquicia eliminada.");
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setIsDeleting(null);
    }
  };

  const renderActions = (f: FranchiseData, className?: string) => (
    <div className={cn("flex flex-shrink-0 items-center gap-1.5", className)}>
      <button
        onClick={() => openEdit(f)}
        className="h-9 w-9 md:h-8 md:w-8 rounded-lg flex items-center justify-center text-jw-gray-600 hover:bg-jw-off-white transition-colors"
        aria-label="Editar"
        title="Editar"
      >
        <Pencil className="h-4 w-4" />
      </button>
      {canDelete && (
        <button
          onClick={() => handleDelete(f)}
          disabled={isDeleting === f.id}
          className="h-9 w-9 md:h-8 md:w-8 rounded-lg flex items-center justify-center text-jw-error hover:bg-jw-error/10 transition-colors disabled:opacity-50"
          aria-label="Eliminar"
          title="Eliminar"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  const fieldClass =
    "flex h-11 w-full rounded-lg border border-jw-gray-300 bg-white px-3 py-2 text-sm text-jw-black transition-colors " +
    "placeholder:text-jw-gray-400 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jw-red focus-visible:border-jw-red";

  const inputLabel = "text-xs font-semibold text-jw-black mb-1.5 block";

  return (
    <div>
      <Toaster position="top-right" />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-jw-black">
            Colecciones
          </h1>
          <p className="text-jw-gray-500 text-sm mt-1">
            {franchises.length} franquicias · editá el mensaje de cada tarjeta de colección
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-jw-red text-white text-sm font-semibold px-4 h-11 hover:bg-jw-red-dark transition-colors sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Nueva franquicia
        </button>
      </div>

      {franchises.length === 0 ? (
        <div className="bg-white border border-dashed border-jw-gray-300 rounded-2xl px-6 py-12 sm:p-16 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-jw-red/10 flex items-center justify-center mb-3">
            <Layers className="h-6 w-6 text-jw-red" />
          </div>
          <p className="font-semibold text-jw-black mb-1">No hay franquicias todavía</p>
          <p className="text-sm text-jw-gray-500">Creá la primera colección.</p>
        </div>
      ) : (
        <>
          {/* Mobile: tarjetas */}
          <div className="md:hidden space-y-3">
            {franchises.map((f) => (
              <div
                key={f.id}
                className="bg-white rounded-2xl border border-jw-gray-200 p-4"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-10 w-10 rounded-lg flex-shrink-0 ring-1 ring-jw-gray-200"
                    style={{ background: `linear-gradient(135deg, ${f.color || "#E10600"} 0%, #0E0E0F 100%)` }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-jw-black text-sm truncate">{f.nombre}</p>
                    <p className="text-xs text-jw-gray-400 truncate">/{f.slug}</p>
                  </div>
                  <Badge variant="outline" className="flex-shrink-0 whitespace-nowrap">
                    {f._count?.productos ?? 0} prod.
                  </Badge>
                </div>

                {f.mensaje ? (
                  <p className="text-sm text-jw-gray-700 mt-3 line-clamp-2">{f.mensaje}</p>
                ) : (
                  <p className="text-xs text-jw-gray-400 mt-3">Sin mensaje</p>
                )}

                <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-jw-gray-100">
                  <Badge variant="outline" className="flex-shrink-0 whitespace-nowrap">
                    {f.color || "—"}
                  </Badge>
                  {renderActions(f)}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: tabla */}
          <div className="hidden md:block bg-white rounded-2xl border border-jw-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-jw-gray-200 text-left text-xs text-jw-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 font-semibold">Franquicia</th>
                <th className="px-4 py-3 font-semibold">Color</th>
                <th className="px-4 py-3 font-semibold">Mensaje de la tarjeta</th>
                <th className="px-4 py-3 font-semibold">Productos</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-jw-gray-100">
              {franchises.map((f) => (
                <tr key={f.id} className="hover:bg-jw-off-white transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="h-8 w-8 rounded-lg flex-shrink-0 ring-1 ring-jw-gray-200"
                        style={{ background: `linear-gradient(135deg, ${f.color || "#E10600"} 0%, #0E0E0F 100%)` }}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-jw-black">{f.nombre}</p>
                        <p className="text-xs text-jw-gray-400">/{f.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{f.color || "—"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {f.mensaje ? (
                      <p className="text-jw-gray-700 max-w-[280px] line-clamp-2">{f.mensaje}</p>
                    ) : (
                      <span className="text-xs text-jw-gray-400">Sin mensaje</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-jw-gray-700">{f._count?.productos ?? 0}</td>
                  <td className="px-4 py-3">
                    {renderActions(f, "justify-end")}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <div className="relative min-h-full flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90dvh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-jw-gray-200 sticky top-0 bg-white z-10">
                <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-jw-black">
                  {editingId ? "Editar franquicia" : "Nueva franquicia"}
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
                <div>
                  <label className={inputLabel}>Nombre *</label>
                  <input
                    className={fieldClass}
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Demon Slayer"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={inputLabel}>Color temático</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={form.color}
                        onChange={(e) => setForm({ ...form, color: e.target.value })}
                        className="h-11 w-12 rounded-lg border border-jw-gray-300 bg-white cursor-pointer"
                      />
                      <input
                        className={fieldClass}
                        value={form.color}
                        onChange={(e) => setForm({ ...form, color: e.target.value })}
                        placeholder="#E10600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={inputLabel}>Slug</label>
                    <input
                      className={`${fieldClass} opacity-60`}
                      value={franchises.find((x) => x.id === editingId)?.slug || "auto"}
                      disabled
                    />
                    <p className="text-[11px] text-jw-gray-400 mt-1">
                      Se genera automáticamente desde el nombre.
                    </p>
                  </div>
                </div>

                <div className="pt-1 border-t border-jw-gray-100">
                  <h3 className="text-sm font-bold text-jw-black mb-3">Imágenes</h3>
                  <div className="space-y-4">
                    <ImageUploadField
                      label="Imagen de la tarjeta (desktop)"
                      value={form.imagen}
                      onChange={(url) => setForm({ ...form, imagen: url })}
                      placeholder="/uploads/tarjeta-demon-slayer.png"
                      hint="Cubre la tarjeta de colección en pantallas grandes. Si no hay imagen, la tarjeta usa solo el color."
                    />
                    <ImageUploadField
                      label="Imagen de la tarjeta (celular)"
                      value={form.imagenMobile}
                      onChange={(url) => setForm({ ...form, imagenMobile: url })}
                      placeholder="/uploads/tarjeta-demon-slayer-mobile.png"
                      hint="Imagen alternativa para celular/tablet. Recomendado: más vertical o cuadrada (ej. 750×800)."
                    />
                  </div>
                </div>

                <div>
                  <label className={inputLabel}>Mensaje de la tarjeta</label>
                  <textarea
                    className={`${fieldClass} h-20 resize-none py-2.5`}
                    value={form.mensaje}
                    onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                    placeholder="Figuras exclusivas de Kimetsu no Yaiba — Tanjiro, Nezuko y más."
                    maxLength={200}
                  />
                  <p className="text-xs text-jw-gray-400 mt-1 text-right">{form.mensaje.length}/200</p>
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
                  {isSaving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear franquicia"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}