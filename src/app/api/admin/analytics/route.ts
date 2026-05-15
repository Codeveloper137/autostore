import { NextResponse } from "next/server";
import { AnalyticsEventType } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/infrastructure/persistence/prisma";
import { prismaQueryErrorResponse } from "@/lib/prisma-api-error";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [siteViews, vehicleViews, pageViews, vehicles, users, pendingMessages] = await Promise.all([
      prisma.analyticsEvent.count({
        where: { type: AnalyticsEventType.SITE_VIEW, createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.analyticsEvent.count({
        where: { type: AnalyticsEventType.VEHICLE_VIEW, createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.analyticsEvent.count({
        where: { type: AnalyticsEventType.PAGE_VIEW, createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.vehicle.count({ where: { archivedAt: null } }),
      prisma.user.count({ where: { archivedAt: null } }),
      prisma.quote.count({ where: { status: "PENDING" } }),
    ]);

    // Top vehículos más vistos (todos los tiempos)
    const topRaw = await prisma.analyticsEvent.groupBy({
      by: ["vehicleId"],
      where: { type: AnalyticsEventType.VEHICLE_VIEW, vehicleId: { not: null } },
      _count: { vehicleId: true },
      orderBy: { _count: { vehicleId: "desc" } },
      take: 10,
    });

    const vehicleIds = topRaw.map((r) => r.vehicleId).filter(Boolean) as string[];

    // Solo vehículos activos (no archivados)
    const vehicleDetails = await prisma.vehicle.findMany({
      where: { id: { in: vehicleIds }, archivedAt: null },
      select: { id: true, title: true, brand: { select: { name: true } } },
    });

    // Solo incluir vehículos que existen y no están archivados
    const activeIds = new Set(vehicleDetails.map((v) => v.id));
    const topVehicles = topRaw
      .filter((r) => r.vehicleId !== null && activeIds.has(r.vehicleId))
      .map((r) => {
        const v = vehicleDetails.find((vv) => vv.id === r.vehicleId)!;
        return {
          vehicleId: r.vehicleId,
          title: `${v.brand.name} — ${v.title}`,
          views: r._count.vehicleId,
        };
      })
      .filter((r) => r.title !== null) as { vehicleId: string | null; title: string; views: number }[];


    // Visitas diarias últimos 14 días
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const dailyRaw = await prisma.analyticsEvent.findMany({
      where: {
        type: { in: [AnalyticsEventType.SITE_VIEW, AnalyticsEventType.PAGE_VIEW] },
        createdAt: { gte: fourteenDaysAgo },
      },
      select: { createdAt: true },
    });

    const dailyMap = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dailyMap.set(d.toISOString().slice(0, 10), 0);
    }
    for (const ev of dailyRaw) {
      const key = ev.createdAt.toISOString().slice(0, 10);
      dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
    }

    const dailyVisits = Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count }));

    return NextResponse.json({
      totals: { siteViews, vehicleViews, pageViews, vehicles, users, pendingMessages },
      topVehicles,
      dailyVisits,
    });
  } catch (error) {
    return prismaQueryErrorResponse("[GET /api/admin/analytics]", error);
  }
}