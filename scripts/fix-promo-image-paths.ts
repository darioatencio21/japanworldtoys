/**
 * Fix puntual: corrige rutas de imágenes de PromoBlock que apuntan a
 * extensiones inexistentes (ej. .png cuando el archivo real es .webp).
 * Uso: npx tsx scripts/fix-promo-image-paths.ts
 */
import { PrismaClient } from "@prisma/client";
import { existsSync } from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

function resolveExisting(publicUrl: string): string | null {
  const clean = publicUrl.split("?")[0];
  const base = path.join(process.cwd(), "public", clean);
  if (existsSync(base)) return clean;
  const ext = path.extname(clean);
  const webpVariant = base.slice(0, -ext.length) + ".webp";
  if (existsSync(webpVariant)) return clean.slice(0, -ext.length) + ".webp";
  return null;
}

async function main() {
  const blocks = await prisma.promoBlock.findMany();
  for (const b of blocks) {
    const updates: Record<string, string> = {};

    if (b.backgroundImage) {
      const fixed = resolveExisting(b.backgroundImage);
      if (fixed && fixed !== b.backgroundImage) updates.backgroundImage = fixed;
      if (!fixed) console.log(`⚠️  ${b.titulo}: backgroundImage no existe en /public (${b.backgroundImage})`);
    }
    if (b.backgroundImageMobile) {
      const fixed = resolveExisting(b.backgroundImageMobile);
      if (fixed && fixed !== b.backgroundImageMobile) updates.backgroundImageMobile = fixed;
      if (!fixed) console.log(`⚠️  ${b.titulo}: backgroundImageMobile no existe en /public (${b.backgroundImageMobile})`);
    }

    if (Object.keys(updates).length > 0) {
      await prisma.promoBlock.update({ where: { id: b.id }, data: updates });
      console.log(`✅ ${b.titulo}:`, updates);
    }
  }
  console.log("Listo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
