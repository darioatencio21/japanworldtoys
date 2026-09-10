"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { Loader2, Lock, Mail } from "lucide-react";

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();
  const [callbackUrl] = useState("/admin");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Email o contraseña incorrectos.");
      setIsLoading(false);
      return;
    }

    toast.success("¡Bienvenido/a!");
    router.push(callbackUrl);
    router.refresh();
  };

  const solidInput =
    "flex h-11 w-full rounded-lg border border-jw-black bg-jw-black px-10 py-2 text-sm text-white transition-colors " +
    "placeholder:text-white/50 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jw-red focus-visible:border-jw-red " +
    "disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="w-full max-w-md mx-auto">
      <Toaster position="top-right" />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs font-semibold text-jw-black mb-1.5 block">
            Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
            <input
              type="email"
              className={solidInput}
              value={form.email}
              autoComplete="email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="tucorreo@email.com"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-jw-black mb-1.5 block">
            Contraseña *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
            <input
              type="password"
              className={solidInput}
              value={form.password}
              autoComplete="current-password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Ingresando...
            </span>
          ) : (
            "Ingresar"
          )}
        </Button>
      </form>
    </div>
  );
}
