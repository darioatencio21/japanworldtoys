"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Plus, Pencil, Trash2, Power, FileText, ExternalLink } from "lucide-react";

type PageData = {
  id: string;
  slug: string;
  titulo: string;
  contenido: string;
  metaTitle: string | null;
  metaDesc: string | null;
  activo: boolean;
  updatedAt: string | Date;
};

const EMPTY_FORM = {
  slug: "",
  titulo: "",
  contenido: "",
  metaTitle: "",
  metaDesc: "",
  activo: true,
};

export function PagesManager({
  initialPages,
  canDelete,
}: {
  initialPages: PageData[];
  canDelete: boolean;
}) {
  const [pages, setPages] = useState<PageData[]>(initialPages);
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

  const openEdit = (page: PageData) => {
    setEditingId(page.id);
    setForm({
      slug: page.slug,
      titulo: page.titulo,
      contenido: page.contenido,
      metaTitle: page.metaTitle || "",
      metaDesc: page.metaDesc || "",
      activo: page.activo,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.titulo.trim()) {
      toast.error("El título es obligatorio.");
      return;
    }
    if (!form.slug.trim()) {
      toast.error("El slug es obligatorio.");
      return;
    }
    if (!form.contenido.trim()) {
      toast.error("El contenido es obligatorio.");
      return;
    }

    setIsSaving(true);
    const url = editingId ? `/api/admin/pages/${editingId}` : "/api/admin/pages";
    const method = editingId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: form.slug,
          titulo: form.titulo,
          contenido: form.contenido,
          metaTitle: form.metaTitle,
          metaDesc: form.metaDesc,
          activo: form.activo,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al guardar la página.");
        return;
      }

      if (editingId) {
        setPages((prev) => prev.map((p) => (p.id === editingId ? data.page : p)));
        toast.success("Página actualizada.");
      } else {
        setPages((prev) => [...prev, data.page]);
        toast.success("Página creada.");
      }
      setIsModalOpen(false);
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (page: PageData) => {
    setIsToggling(page.id);
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !page.activo }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al cambiar estado.");
        return;
      }
      setPages((prev) => prev.map((p) => (p.id === page.id ? data.page : p)));
      toast.success(data.page.activo ? "Página publicada." : "Página oculta.");
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setIsToggling(null);
    }
  };

  const handleDelete = async (page: PageData) => {
    if (!window.confirm(`¿Eliminar la página "${page.titulo}"?`)) return;
    setIsDeleting(page.id);
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al eliminar.");
        return;
      }
      setPages((prev) => prev.filter((p) => p.id !== page.id));
      toast.success("Página eliminada.");
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setIsDeleting(null);
    }
  };

  const renderActions = (page: PageData, className?: string) => (
    <div className={cn("flex flex-shrink-0 items-center gap-1.5", className)}>
      <Link
        href={`/pagina/${page.slug}`}
        target="_blank"
        className="h-9 w-9 md:h-8 md:w-8 rounded-lg flex items-center justify-center text-jw-gray-600 hover:bg-jw-off-white transition-colors"
        aria-label="Ver página"
        title="Ver página"
      >
        <ExternalLink className="h-4 w-4" />
      </Link>
      <button
        onClick={() => handleToggle(page)}
        disabled={isToggling === page.id}
        className={cn(
          "h-9 w-9 md:h-8 md:w-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50",
          page.activo
            ? "text-jw-success hover:bg-jw-success/10"
            : "text-jw-gray-400 hover:bg-jw-off-white"
        )}
        aria-label={page.activo ? "Ocultar" : "Publicar"}
        title={page.activo ? "Ocultar" : "Publicar"}
      >
        <Power className="h-4 w-4" />
      </button>
      <button
        onClick={() => openEdit(page)}
        className="h-9 w-9 md:h-8 md:w-8 rounded-lg flex items-center justify-center text-jw-gray-600 hover:bg-jw-off-white transition-colors"
        aria-label="Editar"
        title="Editar"
      >
        <Pencil className="h-4 w-4" />
      </button>
      {canDelete && (
        <button
          onClick={() => handleDelete(page)}
          disabled={isDeleting === page.id}
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
            Páginas
          </h1>
          <p className="text-jw-gray-500 text-sm mt-1">
            {pages.length} páginas estáticas
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-jw-red text-white text-sm font-semibold px-4 h-11 hover:bg-jw-red-dark transition-colors sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Nueva página
        </button>
      </div>

      {pages.length === 0 ? (
        <div className="bg-white border border-dashed border-jw-gray-300 rounded-2xl px-6 py-12 sm:p-16 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-jw-red/10 flex items-center justify-center mb-3">
            <FileText className="h-6 w-6 text-jw-red" />
          </div>
          <p className="font-semibold text-jw-black mb-1">No hay páginas todavía</p>
          <p className="text-sm text-jw-gray-500">
            Creá páginas como "Política de envíos" o "Sobre nosotros".
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: tarjetas */}
          <div className="md:hidden space-y-3">
            {pages.map((page) => (
              <div
                key={page.id}
                className="bg-white rounded-2xl border border-jw-gray-200 p-4"
              >
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-lg bg-jw-red/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-jw-red" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 flex-1 font-semibold text-jw-black text-sm leading-snug line-clamp-2">
                        {page.titulo}
                      </p>
                      <Badge
                        variant={page.activo ? "success" : "default"}
                        className="flex-shrink-0 whitespace-nowrap"
                      >
                        {page.activo ? "Publicada" : "Oculta"}
                      </Badge>
                    </div>
                    <p className="text-xs text-jw-gray-500 mt-0.5 line-clamp-2">
                      {page.metaTitle || page.contenido.replace(/<[^>]*>/g, "").slice(0, 60)}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2">
                      <code className="text-xs bg-jw-off-white border border-jw-gray-200 rounded px-1.5 py-0.5">
                        /pagina/{page.slug}
                      </code>
                      <span className="text-xs text-jw-gray-400">
                        {new Date(page.updatedAt).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-jw-gray-100">
                  {renderActions(page)}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: tabla */}
          <div className="hidden md:block bg-white rounded-2xl border border-jw-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-jw-gray-200 text-left text-xs text-jw-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 font-semibold">Página</th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Actualizada</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-jw-gray-100">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-jw-off-white transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-jw-red/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 text-jw-red" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-jw-black truncate max-w-[220px]">
                          {page.titulo}
                        </p>
                        <p className="text-xs text-jw-gray-500 truncate max-w-[220px]">
                          {page.metaTitle || page.contenido.replace(/<[^>]*>/g, "").slice(0, 60)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-jw-off-white border border-jw-gray-200 rounded px-1.5 py-0.5">
                      /pagina/{page.slug}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-jw-gray-700 text-xs">
                    {new Date(page.updatedAt).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={page.activo ? "success" : "default"}>
                      {page.activo ? "Publicada" : "Oculta"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {renderActions(page, "justify-end")}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative min-h-full flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90dvh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-jw-gray-200 sticky top-0 bg-white z-10">
                <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-jw-black">
                  {editingId ? "Editar página" : "Nueva página"}
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
                      placeholder="Política de Envíos"
                    />
                  </div>
                  <div>
                    <label className={inputLabel}>
                      Slug *{" "}
                      <span className="text-jw-gray-400 font-normal">
                        (/pagina/slug)
                      </span>
                    </label>
                    <input
                      className={fieldClass}
                      value={form.slug}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          slug: e.target.value
                            .toLowerCase()
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "")
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-+|-+$/g, ""),
                        })
                      }
                      placeholder="politica-envios"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-jw-black">
                      Contenido (HTML) *
                    </label>
                    <span className="text-[11px] text-jw-gray-400">
                      Usá etiquetas HTML básicas: p, h2, h3, ul, ol, li, strong, em, a
                    </span>
                  </div>
                  <textarea
                    className="w-full rounded-lg border border-jw-gray-300 bg-white px-3 py-3 text-sm text-jw-black transition-colors placeholder:text-jw-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jw-red focus-visible:border-jw-red min-h-[240px] font-mono text-xs leading-relaxed"
                    value={form.contenido}
                    onChange={(e) => setForm({ ...form, contenido: e.target.value })}
                    placeholder="<p>Escribí el contenido aquí...</p>"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={inputLabel}>Meta título (SEO)</label>
                    <input
                      className={fieldClass}
                      value={form.metaTitle}
                      onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                      placeholder="Política de Envíos | JapanWorld Toys"
                    />
                  </div>
                  <div>
                    <label className={inputLabel}>Meta descripción (SEO)</label>
                    <input
                      className={fieldClass}
                      value={form.metaDesc}
                      onChange={(e) => setForm({ ...form, metaDesc: e.target.value })}
                      placeholder="Conocé nuestras opciones de envío..."
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
                  <span className="text-sm font-medium text-jw-black">
                    Página publicada (visible en /pagina/{form.slug || "slug"})
                  </span>
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
                  {isSaving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear página"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}