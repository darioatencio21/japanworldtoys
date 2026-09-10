import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const STAFF_ROLES = ["ADMIN", "SUPERADMIN", "EDITOR", "DEPOSITO"];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");

  if (STAFF_ROLES.includes(session.user.rol)) redirect("/admin");

  return <>{children}</>;
}