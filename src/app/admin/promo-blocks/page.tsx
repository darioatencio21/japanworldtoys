import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PromoBlocksManager } from "@/components/admin/promo-blocks-manager";

export const dynamic = "force-dynamic";

export default async function AdminPromoBlocksPage() {
  const session = await auth();
  if (!session?.user) return null;

  const promoBlocks = await prisma.promoBlock.findMany({
    orderBy: [{ orden: "asc" }, { createdAt: "desc" }],
  });

  return (
    <PromoBlocksManager
      initialBlocks={promoBlocks}
      canDelete={["ADMIN", "SUPERADMIN"].includes(session.user.rol)}
    />
  );
}