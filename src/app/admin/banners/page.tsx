import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BannersManager } from "@/components/admin/banners-manager";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const session = await auth();
  if (!session?.user) return null;

  const [banners, franchises] = await Promise.all([
    prisma.banner.findMany({
      orderBy: [{ orden: "asc" }, { createdAt: "desc" }],
      include: { franchise: { select: { id: true, nombre: true } } },
    }),
    prisma.franchise.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  return (
    <BannersManager
      initialBanners={banners}
      franchises={franchises}
      canDelete={["ADMIN", "SUPERADMIN"].includes(session.user.rol)}
    />
  );
}