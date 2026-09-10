import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

const STAFF_ROLES = ["ADMIN", "SUPERADMIN", "EDITOR", "DEPOSITO"];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (!STAFF_ROLES.includes(session.user.rol)) redirect("/cuenta");

  return (
    <AdminShell rol={session.user.rol}>{children}</AdminShell>
  );
}