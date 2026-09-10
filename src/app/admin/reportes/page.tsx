import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import {
  MessageCircle,
  Eye,
  MousePointerClick,
  Globe,
  Smartphone,
  TrendingUp,
  Hash,
} from "lucide-react";

export const dynamic = "force-dynamic";

const SOURCE_ICONS: Record<string, string> = {
  Instagram: "📸",
  Facebook: "👍",
  "Buscadores": "🔍",
  WhatsApp: "💬",
  Telegram: "✈️",
  "TikTok": "🎵",
  "X (Twitter)": "🐦",
  Pinterest: "📌",
  YouTube: "▶️",
  Interno: "🔗",
  Directo: "⏺️",
  Otro: "🌐",
};

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default async function AdminReportesPage() {
  const session = await auth();
  const rol = session?.user?.rol;
  if (rol !== "ADMIN" && rol !== "SUPERADMIN") return notFound();

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    totalViews,
    viewsToday,
    whatsappClicks,
    whatsappToday,
    productViewsCount,
    eventsBySource,
    eventsLast7d,
    whatsappByPath,
    topViewed,
  ] = await Promise.all([
    prisma.analyticsEvent.count({ where: { tipo: "page_view" } }),
    prisma.analyticsEvent.count({ where: { tipo: "page_view", createdAt: { gte: startOfDay } } }),
    prisma.analyticsEvent.count({ where: { tipo: "whatsapp_click" } }),
    prisma.analyticsEvent.count({ where: { tipo: "whatsapp_click", createdAt: { gte: startOfDay } } }),
    prisma.analyticsEvent.count({ where: { tipo: "product_view" } }),
    prisma.analyticsEvent.groupBy({
      by: ["tipo", "fuente"],
      _count: true,
      orderBy: { _count: { fuente: "desc" } },
    }),
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { tipo: true, createdAt: true },
    }),
    prisma.analyticsEvent.groupBy({
      by: ["path"],
      where: { tipo: "whatsapp_click" },
      _count: true,
      orderBy: { _count: { path: "desc" } },
      take: 8,
    }),
    prisma.analyticsEvent.groupBy({
      by: ["productoId"],
      where: { tipo: "product_view", productoId: { not: null } },
      _count: true,
      orderBy: { _count: { productoId: "desc" } },
      take: 10,
    }),
  ]);

  const viewedProductIds = topViewed.map((t) => t.productoId).filter(Boolean) as string[];
  const viewedProducts = viewedProductIds.length
    ? await prisma.product.findMany({
        where: { id: { in: viewedProductIds } },
        select: { id: true, nombre: true, slug: true, precio: true, vistas: true, imagenes: { orderBy: { orden: "asc" }, take: 1 } },
      })
    : [];
  const productMap = Object.fromEntries(viewedProducts.map((p) => [p.id, p]));

  const sourceCounts = eventsBySource
    .filter((e) => e.tipo === "page_view" && e.fuente)
    .reduce<Record<string, number>>((acc, e) => {
      acc[e.fuente as string] = (acc[e.fuente as string] || 0) + e._count;
      return acc;
    }, {});
  const maxSource = Math.max(1, ...Object.values(sourceCounts));

  const whatsappSourceCounts = eventsBySource
    .filter((e) => e.tipo === "whatsapp_click" && e.fuente)
    .reduce<Record<string, number>>((acc, e) => {
      acc[e.fuente as string] = (acc[e.fuente as string] || 0) + e._count;
      return acc;
    }, {});
  const maxWhatsappSource = Math.max(1, ...Object.values(whatsappSourceCounts));

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    return d;
  });
  const viewsByDay = days.map((d) => {
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const count = eventsLast7d.filter(
      (e) => e.tipo === "page_view" && e.createdAt >= d && e.createdAt < next
    ).length;
    return { label: DAYS[d.getDay()], count, total: d.getDate() };
  });
  const whatsappByDay = days.map((d) => {
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    return eventsLast7d.filter(
      (e) => e.tipo === "whatsapp_click" && e.createdAt >= d && e.createdAt < next
    ).length;
  });
  const maxDay = Math.max(1, ...viewsByDay.map((d) => d.count));
  const maxWaDay = Math.max(1, ...whatsappByDay);
  const maxWaPath = Math.max(1, ...whatsappByPath.map((w) => w._count));

  const kpis = [
    {
      icon: <Eye className="h-5 w-5" />,
      label: "Visitas",
      value: totalViews.toLocaleString("es-AR"),
      sub: `${viewsToday.toLocaleString("es-AR")} hoy`,
      color: "bg-jw-red",
    },
    {
      icon: <MessageCircle className="h-5 w-5" />,
      label: "Clicks a WhatsApp",
      value: whatsappClicks.toLocaleString("es-AR"),
      sub: `${whatsappToday.toLocaleString("es-AR")} hoy`,
      color: "bg-[#25D366]",
    },
    {
      icon: <MousePointerClick className="h-5 w-5" />,
      label: "Vistas de productos",
      value: productViewsCount.toLocaleString("es-AR"),
      sub: "clics en fichas de producto",
      color: "bg-jw-black",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-jw-black mb-2">
        Reportes de tráfico
      </h1>
      <p className="text-jw-gray-500 mb-8">
        Visitas, origen de los visitantes y productos más vistos
      </p>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-jw-black rounded-2xl border-4 border-jw-red p-5">
            <div className={cnKpiIcon(kpi.color)}>{kpi.icon}</div>
            <p className="text-xl font-bold text-white leading-tight mt-3">{kpi.value}</p>
            <p className="text-xs font-semibold text-white/80">{kpi.label}</p>
            <p className="text-xs text-white/50 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Últimos 7 días: visitas + WhatsApp */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-jw-gray-200 p-6">
          <h2 className="flex items-center gap-2 font-bold font-[family-name:var(--font-display)] text-jw-black mb-5">
            <Globe className="h-4 w-4 text-jw-red" />
            Visitas · últimos 7 días
          </h2>
          <div className="flex items-end gap-2.5 h-40">
            {viewsByDay.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                <span className="text-[10px] font-bold text-jw-gray-500">{day.count}</span>
                <div className="flex-1 w-full flex items-end">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-jw-red to-red-400 hover:opacity-80 transition-opacity"
                    style={{ height: `${Math.max(3, (day.count / maxDay) * 100)}%` }}
                    title={`${day.count} visitas`}
                  />
                </div>
                <span className="text-[10px] text-jw-gray-500">{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-jw-gray-200 p-6">
          <h2 className="flex items-center gap-2 font-bold font-[family-name:var(--font-display)] text-jw-black mb-5">
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
            Clicks a WhatsApp · últimos 7 días
          </h2>
          <div className="flex items-end gap-2.5 h-40">
            {whatsappByDay.map((count, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                <span className="text-[10px] font-bold text-jw-gray-500">{count}</span>
                <div className="flex-1 w-full flex items-end">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-[#25D366] to-emerald-300 hover:opacity-80 transition-opacity"
                    style={{ height: `${Math.max(3, (count / maxWaDay) * 100)}%` }}
                    title={`${count} clicks`}
                  />
                </div>
                <span className="text-[10px] text-jw-gray-500">{viewsByDay[i].label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Origen de visitas */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-jw-gray-200 p-6">
          <h2 className="flex items-center gap-2 font-bold font-[family-name:var(--font-display)] text-jw-black mb-5">
            <Smartphone className="h-4 w-4 text-jw-red" />
            Visitas según origen
          </h2>
          <p className="text-xs text-jw-gray-500 -mt-3 mb-4">
            Desde qué app o medio llegaron: Instagram, Facebook, buscadores, etc.
          </p>
          <div className="space-y-3">
            {Object.entries(sourceCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([source, count]) => {
                const pct = Math.round((count / maxSource) * 100);
                return (
                  <div key={source}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-jw-gray-700 flex items-center gap-1.5">
                        <span>{SOURCE_ICONS[source] || "🌐"}</span>
                        {source}
                      </span>
                      <span className="text-sm font-bold text-jw-black">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-jw-gray-100 overflow-hidden">
                      <div className="h-full bg-jw-red rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            {Object.keys(sourceCounts).length === 0 && (
              <p className="text-sm text-jw-gray-500">Aún no hay visitas registradas.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-jw-gray-200 p-6">
          <h2 className="flex items-center gap-2 font-bold font-[family-name:var(--font-display)] text-jw-black mb-5">
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
            Clicks a WhatsApp según origen
          </h2>
          <p className="text-xs text-jw-gray-500 -mt-3 mb-4">
            Cuando alguien tocó un botón de WhatsApp, ¿de dónde venía?
          </p>
          <div className="space-y-3">
            {Object.entries(whatsappSourceCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([source, count]) => {
                const pct = Math.round((count / maxWhatsappSource) * 100);
                return (
                  <div key={source}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-jw-gray-700 flex items-center gap-1.5">
                        <span>{SOURCE_ICONS[source] || "🌐"}</span>
                        {source}
                      </span>
                      <span className="text-sm font-bold text-jw-black">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-jw-gray-100 overflow-hidden">
                      <div className="h-full bg-[#25D366] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            {Object.keys(whatsappSourceCounts).length === 0 && (
              <p className="text-sm text-jw-gray-500">Aún no hay clicks registrados.</p>
            )}
          </div>
        </div>
      </div>

      {/* Productos más vistos */}
      <div className="bg-white rounded-2xl border border-jw-gray-200 mb-6">
        <div className="flex items-center justify-between p-5 border-b border-jw-gray-100">
          <h2 className="flex items-center gap-2 font-bold font-[family-name:var(--font-display)] text-jw-black">
            <TrendingUp className="h-4 w-4 text-jw-red" />
            Productos más vistos
          </h2>
          <Link href="/admin/productos" className="text-sm font-semibold text-jw-red hover:underline">
            Gestionar productos →
          </Link>
        </div>
        <div className="divide-y divide-jw-gray-100">
          {topViewed.length === 0 ? (
            <p className="text-sm text-jw-gray-500 p-5">Todavía no hay vistas de productos.</p>
          ) : (
            topViewed.map((item, index) => {
              const product = productMap[item.productoId as string];
              const views = item._count;
              const pct = Math.round((views / topViewed[0]._count) * 100);
              if (!product) return null;
              const img = product.imagenes[0];
              return (
                <div key={item.productoId} className="px-5 py-3.5 flex items-center gap-4">
                  <span className="text-sm font-bold text-jw-gray-400 w-5">#{index + 1}</span>
                  <div className="h-11 w-11 rounded-lg bg-jw-gray-100 overflow-hidden flex-shrink-0 relative border border-jw-gray-200">
                    {img && (
                      <Image src={img.url} alt={product.nombre} fill sizes="44px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/producto/${product.slug}`} className="text-sm font-semibold text-jw-black truncate block hover:text-jw-red">
                      {product.nombre}
                    </Link>
                    <div className="h-1.5 rounded-full bg-jw-gray-100 overflow-hidden mt-1.5">
                      <div className="h-full bg-jw-red rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-jw-black">{views}</p>
                    <p className="text-xs text-jw-gray-500 flex items-center gap-1 justify-end">
                      <Eye className="h-3 w-3" /> vistas
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Páginas con más clicks a WhatsApp */}
      <div className="bg-white rounded-2xl border border-jw-gray-200">
        <div className="p-5 border-b border-jw-gray-100">
          <h2 className="flex items-center gap-2 font-bold font-[family-name:var(--font-display)] text-jw-black">
            <Hash className="h-4 w-4 text-jw-red" />
            Páginas con más clicks a WhatsApp
          </h2>
        </div>
        <div className="divide-y divide-jw-gray-100">
          {whatsappByPath.length === 0 ? (
            <p className="text-sm text-jw-gray-500 p-5">Aún no hay clicks registrados.</p>
          ) : (
            whatsappByPath.map((item) => {
              const pct = Math.round((item._count / maxWaPath) * 100);
              const isProduct = /^\/producto\//.test(item.path || "");
              const pathLabel =
                item.path === "/"
                  ? "Inicio"
                  : (item.path || "Desconocida").replace(/^\/producto\//, "Producto · ");
              return (
                <div key={item.path} className="px-5 py-3 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-jw-black truncate">{pathLabel}</p>
                    <div className="h-1.5 rounded-full bg-jw-gray-100 overflow-hidden mt-1.5">
                      <div className="h-full bg-[#25D366] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  {isProduct && (
                    <Badge variant="success">Producto</Badge>
                  )}
                  <span className="text-sm font-bold text-jw-black flex-shrink-0">{item._count}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function cnKpiIcon(color: string): string {
  return `h-12 w-12 rounded-full ${color} text-white flex items-center justify-center shadow-sm`;
}