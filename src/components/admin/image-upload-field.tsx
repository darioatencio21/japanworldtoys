"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, Eye } from "lucide-react";

const ACCEPTED = "image/png,image/jpeg,image/webp,image/gif,image/svg+xml";
const MAX_SIZE = 5 * 1024 * 1024;

export async function uploadImage(file: File): Promise<string> {
  if (!ACCEPTED.split(",").includes(file.type)) {
    throw new Error("Formato no permitido. Usá PNG, JPG, WebP, GIF o SVG.");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("La imagen supera los 5 MB.");
  }

  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/api/admin/upload", {
    method: "POST",
    body: fd,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Error al subir la imagen.");
  }
  return data.url as string;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  placeholder,
  required,
  hint,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      alert(err instanceof Error ? err.message : "No se pudo subir la imagen.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-jw-black block">
          {label} {required && <span className="text-jw-red">*</span>}
        </label>
        {value && (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-jw-gray-500 hover:text-jw-red transition-colors"
          >
            <Eye className="h-3 w-3" />
            Ver
          </a>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex h-11 w-full min-w-0 flex-1 rounded-lg border border-jw-gray-300 bg-white px-3 py-2 text-sm text-jw-black transition-colors placeholder:text-jw-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jw-red focus-visible:border-jw-red"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-jw-gray-300 bg-white px-3 h-11 text-sm font-semibold text-jw-gray-700 hover:bg-jw-off-white hover:border-jw-red transition-colors disabled:opacity-50 flex-shrink-0"
          title="Subir imagen desde la PC"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin text-jw-red" />
          ) : (
            <Upload className="h-4 w-4 text-jw-red" />
          )}
          {isUploading ? "Subiendo..." : "Subir"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {hint && <p className="text-[11px] text-jw-gray-400 mt-1">{hint}</p>}

      {value && (
        <div className="relative mt-2 h-28 w-full max-w-[220px] rounded-lg overflow-hidden bg-jw-gray-100 border border-jw-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-full w-full object-cover" />
        </div>
      )}
    </div>
  );
}