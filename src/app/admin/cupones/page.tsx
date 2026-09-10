import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminCuponesPage() {
  await auth();
  return <AdminPlaceholder title="Cupones" description="Crear y gestionar cupones de descuento (JAPAN10, etc.). Disponible en la siguiente fase." />;
}

function AdminPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-jw-black mb-2">{title}</h1>
      <div className="bg-white border border-dashed border-jw-gray-300 rounded-2xl p-16 text-center mt-6">
        <p className="font-semibold text-jw-black mb-1">Módulo en construcción</p>
        <p className="text-sm text-jw-gray-500 max-w-md mx-auto">{description}</p>
      </div>
    </div>
  );
}