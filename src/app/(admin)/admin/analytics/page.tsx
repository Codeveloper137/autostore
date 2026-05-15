"use client";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

type Analytics = {
  totals: { siteViews: number; vehicleViews: number; pageViews: number; vehicles: number; users: number; pendingMessages: number };
  topVehicles: { vehicleId: string | null; title: string; views: number }[];
  dailyVisits: { date: string; count: number }[];
};

async function fetchAnalytics(): Promise<Analytics> {
  const res = await fetch("/api/admin/analytics");
  if (!res.ok) throw new Error("Error");
  return res.json();
}

export default function AdminAnalyticsPage() {
  const { data, isPending } = useQuery({ queryKey: ["admin", "analytics"], queryFn: fetchAnalytics });

  const chartData = data?.dailyVisits.map((d) => ({
    date: new Date(d.date + "T12:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short" }),
    visitas: d.count,
  })) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Analíticas</h1>
        <p className="text-sm text-muted-foreground">Interacciones de visitantes con el sitio — últimos 30 días.</p>
      </div>

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Visitas al home", value: data?.totals.siteViews ?? 0 },
          { label: "Vistas de vehículos", value: data?.totals.vehicleViews ?? 0 },
          { label: "Visitas al catálogo", value: data?.totals.pageViews ?? 0 },
        ].map((m) => (
            <div key={m.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{m.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{m.value.toLocaleString("es-CO")}</p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 font-heading text-base font-semibold">Tendencia de visitas — 14 días</h2>
        {isPending ? <Skeleton className="h-56 w-full" /> : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: "8px", fontSize: "12px" }} />
              <Line type="monotone" dataKey="visitas" stroke="#18181b" strokeWidth={2} dot={{ fill: "#18181b", r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 font-heading text-base font-semibold">Top 10 vehículos más vistos</h2>
        {isPending ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
        ) : !data?.topVehicles.length ? (
          <p className="text-sm text-muted-foreground">Sin datos aún.</p>
        ) : (
          <div className="space-y-3">
            {data.topVehicles.map((v, i) => {
              const max = data.topVehicles[0]?.views ?? 1;
              const pct = Math.round((v.views / max) * 100);
              return (
                <div key={v.vehicleId ?? i} className="flex items-center gap-3">
                  <span className="w-5 text-xs tabular-nums text-muted-foreground">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate font-medium">{v.title}</span>
                      <span className="ml-2 tabular-nums text-muted-foreground">{v.views} vistas</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}