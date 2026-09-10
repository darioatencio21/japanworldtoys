import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({
  tipo: z.enum(["page_view", "whatsapp_click", "product_view"]),
  path: z.string().max(300).optional().default(""),
  fuente: z.string().max(50).optional().default("Directo"),
  visitanteId: z.string().max(100).optional().default(""),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: true });
    }

    const { tipo, path, fuente, visitanteId } = parsed.data;

    let productoId: string | null = null;

    if (tipo === "product_view") {
      const match = /^\/producto\/([^/]+)$/.exec(path);
      if (match) {
        const product = await prisma.product.findUnique({
          where: { slug: match[1] },
          select: { id: true },
        });
        if (product) {
          productoId = product.id;
          await prisma.product.update({
            where: { id: product.id },
            data: { vistas: { increment: 1 } },
          });
        }
      }
    }

    await prisma.analyticsEvent.create({
      data: {
        tipo,
        path: path || null,
        fuente,
        visitanteId: visitanteId || null,
        productoId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}