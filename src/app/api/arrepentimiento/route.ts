import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { STORE_CONTACT } from "@/lib/constants";

const schema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  numeroOrden: z.string().optional(),
  motivo: z.enum(["PENTIDO", "PRODUCTO_DEFECTUOSO", "CAMBIO_DE_OPINION", "OTRO"]),
  detalle: z.string().min(10, "Contanos un poco más (mínimo 10 caracteres)"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { nombre, email, numeroOrden, motivo, detalle } = parsed.data;

    const message = [
      "Arrepentimiento de compra",
      "",
      `Nombre: ${nombre}`,
      `Email: ${email}`,
      `Pedido: ${numeroOrden || "no indicado"}`,
      `Motivo: ${motivo}`,
      `Detalle: ${detalle}`,
    ].join("%0A%0A");

    const waLink = `https://wa.me/543813652079?text=${message}`;

    const admin = await prisma.user.findFirst({
      where: { rol: { in: ["SUPERADMIN", "ADMIN"] } },
      orderBy: { createdAt: "asc" },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin ? admin.id : (await prisma.user.findFirst())!.id,
        accion: "ARREPENTIMIENTO",
        entidad: "Order",
        detalle: JSON.stringify({ nombre, email, numeroOrden: numeroOrden || null, motivo, detalle }),
      },
    });

    return NextResponse.json({
      ok: true,
      message:
        "Recibimos tu solicitud. Te contactaremos por WhatsApp o email dentro de las 24 hs hábiles para coordinar la devolución tal como establece la Resolución 424/2020.",
      whatsapp: waLink,
      email: STORE_CONTACT.email,
      plazoTope: 10,
    });
  } catch (error) {
    console.error("Arrepentimiento error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}