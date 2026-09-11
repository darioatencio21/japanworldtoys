import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FranchisesManager } from "@/components/admin/franchises-manager";

export const dynamic = "force-dynamic";

export default async function AdminFranquiciasPage() {
  const session = await auth();
  if (!session?.user) return null;

  const franchises = await prisma.franchise.findMany({
    include: { _count: { select: { productos: true } } },
    orderBy: { nombre: "asc" },
  });

  return (
    <FranchisesManager
      initialFranchises={franchises}
      canDelete={["ADMIN", "SUPERADMIN"].includes(session.user.rol)}
    />
  );
}