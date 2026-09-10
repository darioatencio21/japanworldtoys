import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MapPin, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DireccionesPage() {
  const session = await auth();
  if (!session?.user) return null;

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { esPredeterminada: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-jw-black">
          Mis direcciones
        </h2>
        <span className="text-xs text-jw-gray-500">(CRUD completo próximamente)</span>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-jw-gray-200 p-12 text-center">
          <div className="h-14 w-14 rounded-full bg-jw-off-white flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-7 w-7 text-jw-gray-300" />
          </div>
          <p className="font-semibold text-jw-black mb-1">Sin direcciones guardadas</p>
          <p className="text-sm text-jw-gray-500">
            Vas a poder guardar direcciones para agilizar tus compras.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="bg-white rounded-2xl border border-jw-gray-200 p-5"
            >
              {address.esPredeterminada && (
                <span className="inline-block px-2 py-0.5 rounded-full bg-jw-red/10 text-jw-red text-[10px] font-bold uppercase mb-2">
                  Predeterminada
                </span>
              )}
              <p className="text-sm font-semibold text-jw-black">
                {address.calle} {address.numero}
                {address.piso && `, piso ${address.piso}`}
                {address.departamento && `, depto ${address.departamento}`}
              </p>
              <p className="text-sm text-jw-gray-500 mt-1">
                {address.ciudad}, {address.provincia}
                {address.cp && ` (${address.cp})`}
              </p>
            </div>
          ))}
        </div>
      )}

      <button className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-jw-gray-300 text-sm text-jw-gray-500 hover:text-jw-red hover:border-jw-red transition-colors">
        <Plus className="h-4 w-4" />
        Agregar dirección
      </button>
    </div>
  );
}