import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SITE_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

type PageParams = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page || !page.activo) return {};
  return {
    title: page.metaTitle || `${page.titulo} · ${SITE_NAME}`,
    description: page.metaDesc || undefined,
  };
}

export default async function StaticPage({ params }: PageParams) {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });

  if (!page || !page.activo) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: page.titulo }]} className="mb-6" />

      <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] text-jw-black mb-8">
        {page.titulo}
      </h1>

      <div
        className="prose-static text-jw-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: page.contenido }}
      />
    </div>
  );
}