import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["ADMIN", "SUPERADMIN", "EDITOR"];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !ALLOWED_ROLES.includes(session.user.rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const updates: { key: string; value: string }[] = [];

    if (Array.isArray(body.topBarMessages)) {
      const messages = body.topBarMessages
        .map((m: unknown) => (typeof m === "string" ? m.trim() : ""))
        .filter((m: string) => m.length > 0)
        .slice(0, 12);
      updates.push({ key: "top_bar_messages", value: JSON.stringify(messages) });
    }

    if (typeof body.topBarVisible === "boolean") {
      updates.push({ key: "top_bar_visible", value: JSON.stringify(body.topBarVisible) });
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No hay datos para guardar" }, { status: 400 });
    }

    for (const u of updates) {
      await prisma.siteSetting.upsert({
        where: { key: u.key },
        create: u,
        update: { value: u.value },
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}