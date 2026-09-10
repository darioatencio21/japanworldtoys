"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RefreshCcw,
  Loader2,
  CheckCircle2,
  MessageCircle,
  Mail,
  ShieldCheck,
  Clock3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { STORE_CONTACT } from "@/lib/constants";

type FormState = {
  nombre: string;
  email: string;
  numeroOrden: string;
  motivo: string;
  detalle: string;
};

type Result = {
  message: string;
  whatsapp: string;
  email: string;
  plazoTope: number;
};

const motivos = [
  { value: "PENTIDO", label: "Me arrepentí de la compra" },
  { value: "PRODUCTO_DEFECTUOSO", label: "El producto llegó defectuoso" },
  { value: "CAMBIO_DE_OPINION", label: "Cambié de opinión" },
  { value: "OTRO", label: "Otro motivo" },
];

export default function ArrepentimientoPage() {
  const [form, setForm] = useState<FormState>({
    nombre: "",
    email: "",
    numeroOrden: "",
    motivo: "",
    detalle: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/arrepentimiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail =
          typeof data.details?.fieldErrors === "object"
            ? Object.values(data.details.fieldErrors).flat().join(", ")
            : data.error;
        setError(detail || "Error al enviar la solicitud.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Error de conexión. Intentalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Breadcrumb
          items={[{ label: "Inicio", href: "/" }, { label: "Arrepentimiento de compra" }]}
          className="mb-6"
        />
        <div className="bg-white rounded-2xl border border-jw-gray-200 p-8 md:p-10 text-center">
          <div className="h-16 w-16 rounded-full bg-jw-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-jw-success" />
          </div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-jw-black">
            Solicitud registrada
          </h1>
          <p className="text-jw-gray-500 mt-3 max-w-xl mx-auto">{result.message}</p>

          <div className="mt-8 grid sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            <a
              href={result.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 h-12 rounded-lg bg-jw-success text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <MessageCircle className="h-5 w-5" />
              Seguir por WhatsApp
            </a>
            <a
              href={`mailto:${result.email}?subject=Arrepentimiento de compra`}
              className="flex items-center justify-center gap-2 h-12 rounded-lg bg-jw-black text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Mail className="h-5 w-5" />
              Enviar por email
            </a>
          </div>

          <Link
            href="/"
            className="inline-block mt-8 text-sm text-jw-red font-semibold hover:underline"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Breadcrumb
        items={[{ label: "Inicio", href: "/" }, { label: "Arrepentimiento de compra" }]}
        className="mb-6"
      />

      <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] text-jw-black mb-2">
        Arrepentimiento de compra
      </h1>
      <p className="text-jw-gray-500 text-sm mb-8">
        Ejercé tu derecho a retracto según la Resolución 424/2020 de la Secretaría de Comercio Interior.
      </p>

      <div className="grid md:grid-cols-[1fr_1fr] gap-6 items-start">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-jw-gray-200 p-6 md:p-8 space-y-5"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-jw-gray-700 mb-1.5 block">
                Nombre *
              </label>
              <Input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Tu nombre"
                required
                minLength={2}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-jw-gray-700 mb-1.5 block">
                Email *
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="tucorreo@ejemplo.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-jw-gray-700 mb-1.5 block">
              Número de pedido
            </label>
            <Input
              value={form.numeroOrden}
              onChange={(e) => setForm({ ...form, numeroOrden: e.target.value })}
              placeholder="Ej: JW-1234 (opcional)"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-jw-gray-700 mb-1.5 block">
              Motivo *
            </label>
            <select
              value={form.motivo}
              onChange={(e) => setForm({ ...form, motivo: e.target.value })}
              required
              className="flex h-11 w-full rounded-lg border border-jw-gray-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jw-red focus-visible:ring-offset-1"
            >
              <option value="">Seleccioná un motivo...</option>
              {motivos.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-jw-gray-700 mb-1.5 block">
              Contanos qué pasó *
            </label>
            <textarea
              value={form.detalle}
              onChange={(e) => setForm({ ...form, detalle: e.target.value })}
              rows={4}
              required
              minLength={10}
              placeholder="Contanos brevemente el motivo o lo que ocurrió con tu compra..."
              className="w-full rounded-lg border border-jw-gray-200 bg-white px-4 py-3 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jw-red focus-visible:ring-offset-1"
            />
          </div>

          {error && (
            <p className="text-sm text-jw-error bg-jw-error/5 border border-jw-error/20 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Enviando...
              </span>
            ) : (
              "Enviar solicitud"
            )}
          </Button>
        </form>

        <div className="space-y-4">
          <div className="bg-jw-red/5 border border-jw-red/20 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-jw-red/10 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-jw-red" />
              </div>
              <h3 className="font-bold font-[family-name:var(--font-display)] text-jw-black">
                Tu derecho a retracto
              </h3>
            </div>
            <p className="text-sm text-jw-gray-700 leading-relaxed">
              Tenés 10 días corridos desde la recepción del producto para arrepentirte de la
              compra y solicitar la devolución, sin necesidad de justificar el motivo.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-jw-gray-200 p-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-jw-warning/10 flex items-center justify-center flex-shrink-0">
                <Clock3 className="h-5 w-5 text-jw-warning" />
              </div>
              <div>
                <h3 className="font-bold font-[family-name:var(--font-display)] text-jw-black text-sm">
                  Plazos de respuesta
                </h3>
                <p className="text-xs text-jw-gray-500 mt-1">
                  Te contactamos dentro de las 24 hs hábiles para coordinar la devolución.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-jw-gray-200 p-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-jw-black/5 flex items-center justify-center flex-shrink-0">
                <RefreshCcw className="h-5 w-5 text-jw-black" />
              </div>
              <div>
                <h3 className="font-bold font-[family-name:var(--font-display)] text-jw-black text-sm">
                  ¿Preferís hablarnos directo?
                </h3>
                <p className="text-xs text-jw-gray-500 mt-1">
                  También podés escribirnos por{" "}
                  <a
                    href={`mailto:${STORE_CONTACT.email}`}
                    className="text-jw-red font-medium hover:underline"
                  >
                    {STORE_CONTACT.email}
                  </a>{" "}
                  o por nuestro WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
