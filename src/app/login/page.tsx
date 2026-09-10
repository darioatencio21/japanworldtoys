import { AuthForm } from "@/components/forms/auth-form";

export default function LoginPage() {
  return (
    <div className="relative h-dvh flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/backgrounds/fondo-panel-admin.png)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)] text-jw-black">
            Bienvenido/a
          </h1>
          <p className="text-sm text-jw-gray-500 mt-1.5">
            Ingresá para administrar tu tienda.
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}