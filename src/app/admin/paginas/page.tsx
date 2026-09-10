import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PagesManager } from "@/components/admin/pages-manager";

export const dynamic = "force-dynamic";

export default async function AdminPaginasPage() {
  const session = await auth();
  if (!session?.user) return null;

  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <PagesManager
      initialPages={pages}
      canDelete={["ADMIN", "SUPERADMIN"].includes(session.user.rol)}
    />
  );
}