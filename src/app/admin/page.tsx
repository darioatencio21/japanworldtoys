import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  Clock,
  Plus,
} from "lucide-react";

export const dynamic = "force-dynamic";

import type { EstadoPedido } from "@prisma/client";

const PAYED_STATES: EstadoPedido[] = ["PAGADO", "PREPARANDO", "ENVIADO", "ENTREGADO"];

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalPaid, paidToday, productCount, lowStockCount, recentProducts] =
    await Promise.all([
      prisma.order.findMany({ where: { estado: { in: PAYED_STATES } }, select: { total: true } }),
      prisma.order.findMany({ where: { estado: { in: PAYED_STATES }, createdAt: { gte: today } }, select: { total: true } }),
      prisma.product.count(),
      prisma.product.count({ where: { stock: { lte: 3 } } }),
      prisma.product.findMany({
        include: { marca: true, categoria: true, imagenes: { orderBy: { orden: "asc" }, take: 1 } },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

  const revenue = totalPaid.reduce((acc, o) => acc + Number(o.total), 0);
  const todayRevenue = paidToday.reduce((acc, o) => acc + Number(o.total), 0);
  const avgTicket = totalPaid.length ? revenue / totalPaid.length : 0;

  const kpis = [
    {
      image: "/images/icons/dinero.png",
      label: "Ventas totales",
      value: formatPrice(revenue),
      sub: `${formatPrice(todayRevenue)} hoy`,
    },
    {
      image: "/images/icons/rendimiento.png",
      label: "Ticket promedio",
      value: formatPrice(avgTicket),
      sub: "por pedido pagado",
    },
    {
      image: "/images/icons/productos.png",
      label: "Productos",
      value: String(productCount),
      sub: `${lowStockCount} con stock bajo`,
    },
  ];

  const lowStock = lowStockCount > 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-jw-black">
          Dashboard
        </h1>
        <Link
          href="/admin/productos?nuevo=1"
          className="inline-flex items-center gap-2 rounded-lg bg-jw-red px-4 py-2 text-sm font-semibold text-white hover:bg-jw-red-dark transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo producto
        </Link>
      </div>
      <p className="text-jw-gray-500 mb-6">
        Resumen del negocio · {new Intl.DateTimeFormat("es-AR", { dateStyle: "full" }).format(new Date())}
      </p>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-jw-black rounded-2xl border-4 border-jw-red p-5">
            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center mb-3 overflow-hidden shadow-sm">
              <img
                src={kpi.image}
                alt={kpi.label}
                className="h-8 w-auto object-contain"
              />
            </div>
            <p className="text-xl font-bold text-white leading-tight">{kpi.value}</p>
            <p className="text-xs text-white/70 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {lowStock && (
        <div className="mb-6">
          <h2 className="flex items-center gap-2 text-sm font-bold text-jw-black mb-3">
            <AlertTriangle className="h-4 w-4 text-jw-warning" />
            Alertas
          </h2>
          <Link
            href="/admin/productos"
            className="flex items-center justify-between bg-white border border-jw-gray-200 hover:border-jw-warning rounded-xl p-4 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-jw-warning/10 flex items-center justify-center">
                <Package className="h-4 w-4 text-jw-warning" />
              </div>
              <div>
                <p className="text-sm font-semibold text-jw-black">
                  {lowStockCount} productos con stock bajo
                </p>
                <p className="text-xs text-jw-gray-500">Necesitan atención</p>
              </div>
            </div>
            <Badge variant="warning">{lowStockCount}</Badge>
          </Link>
        </div>
      )}

      {/* Recent products */}
      <div className="bg-white rounded-2xl border border-jw-gray-200">
        <div className="flex items-center justify-between p-5 border-b border-jw-gray-100">
          <h2 className="font-bold font-[family-name:var(--font-display)] text-jw-black flex items-center gap-2">
            <Clock className="h-4 w-4 text-jw-red" />
            Productos recientes
          </h2>
          <Link href="/admin/productos" className="text-sm font-semibold text-jw-red hover:underline">
            Ver todos →
          </Link>
        </div>
        <div className="divide-y divide-jw-gray-100">
          {recentProducts.length === 0 ? (
            <p className="text-sm text-jw-gray-500 p-5">Sin productos todavía.</p>
          ) : (
            recentProducts.map((product) => {
              const img = product.imagenes[0];
              return (
                <Link
                  key={product.id}
                  href={`/producto/${product.slug}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-jw-off-white transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-10 w-10 rounded-lg bg-jw-gray-100 overflow-hidden flex-shrink-0">
                      {img && (
                        <Image
                          src={img.url}
                          alt={product.nombre}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-jw-black truncate max-w-[280px]">
                        {product.nombre}
                      </p>
                      <p className="text-xs text-jw-gray-500">
                        {product.categoria.nombre}
                        {product.marca ? ` · ${product.marca.nombre}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-bold text-jw-black">
                      {formatPrice(Number(product.precio))}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}