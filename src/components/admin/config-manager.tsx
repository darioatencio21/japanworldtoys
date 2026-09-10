"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { Plus, Trash2, Megaphone, Save, Eye, EyeOff } from "lucide-react";

const MAX_MESSAGES = 12;
const MAX_LENGTH = 120;

export function ConfigManager({
  initialMessages,
  initialVisible,
}: {
  initialMessages: string[];
  initialVisible: boolean;
}) {
  const [messages, setMessages] = useState<string[]>(initialMessages);
  const [visible, setVisible] = useState(initialVisible);
  const [isSaving, setIsSaving] = useState(false);

  const fieldClass =
    "flex h-11 w-full rounded-lg border border-jw-gray-300 bg-white px-3 py-2 text-sm text-jw-black transition-colors " +
    "placeholder:text-jw-gray-400 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jw-red focus-visible:border-jw-red";

  const updateMessage = (index: number, value: string) => {
    if (value.length > MAX_LENGTH) return;
    setMessages((prev) => prev.map((m, i) => (i === index ? value : m)));
  };

  const addMessage = () => {
    if (messages.length >= MAX_MESSAGES) {
      toast.error(`Máximo ${MAX_MESSAGES} mensajes.`);
      return;
    }
    setMessages((prev) => [...prev, ""]);
  };

  const removeMessage = (index: number) => {
    setMessages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const clean = messages.map((m) => m.trim()).filter(Boolean);
    if (clean.length === 0) {
      toast.error("Agregá al menos un mensaje o desactivá la barra.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topBarMessages: clean, topBarVisible: visible }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al guardar.");
        return;
      }
      setMessages(clean);
      toast.success("Configuración guardada.");
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <Toaster position="top-right" />

      <div className="bg-white rounded-2xl border border-jw-gray-200 overflow-hidden">
        <div className="p-5 border-b border-jw-gray-100 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-jw-black flex items-center justify-center flex-shrink-0">
              <Megaphone className="h-5 w-5 text-jw-gold" />
            </div>
            <div>
              <h2 className="font-bold font-[family-name:var(--font-display)] text-jw-black">
                Barra de anuncios
              </h2>
              <p className="text-xs text-jw-gray-500">
                Mensajes tipo frase que rotan arriba de la página
              </p>
            </div>
          </div>

          <button
            onClick={() => setVisible(!visible)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3.5 h-10 text-sm font-semibold transition-colors",
              visible
                ? "border-jw-success/30 text-jw-success bg-jw-success/10 hover:bg-jw-success/20"
                : "border-jw-gray-200 text-jw-gray-600 hover:bg-jw-off-white"
            )}
          >
            {visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {visible ? "Visible" : "Oculta"}
          </button>
        </div>

        <div className="p-5">
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  className={fieldClass}
                  value={message}
                  onChange={(e) => updateMessage(index, e.target.value)}
                  placeholder="Ej: 🚀 Retirá en el local sin cargo"
                />
                <span className="text-xs text-jw-gray-400 w-8 text-right flex-shrink-0">
                  {message.length}/{MAX_LENGTH}
                </span>
                <button
                  onClick={() => removeMessage(index)}
                  disabled={messages.length <= 1}
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-jw-error hover:bg-jw-error/10 transition-colors disabled:opacity-40"
                  aria-label="Quitar mensaje"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-5 gap-3">
            <button
              onClick={addMessage}
              disabled={messages.length >= MAX_MESSAGES}
              className="inline-flex items-center gap-2 rounded-lg border border-jw-gray-200 px-4 h-10 text-sm font-semibold text-jw-gray-700 hover:bg-jw-off-white transition-colors disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
              Agregar mensaje
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-jw-red text-white px-6 h-10 text-sm font-semibold hover:bg-jw-red-dark transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}