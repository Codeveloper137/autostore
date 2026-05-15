"use client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Car, MessageSquare, TrendingUp, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Analytics = {
  totals: { siteViews: number; vehicleViews: number; vehicles: number; users: number; pendingMessages: number };
  topVehicles: { vehicleId: string | null; title: string; views: number }[];
  dailyVisits: { date: string; count: number }[];
};

async function fetchAnalytics(): Promise<Analytics> {
  const res = await fetch("/api/admin/analytics");
  if (!res.ok) throw new Error("Error al cargar métricas");
  return res.json();
}

function MetricCard({ label, value, icon: Icon, sub }: { label: string; value: number; icon: React.ElementType; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{value.toLocaleString("es-CO")}</p>
          {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
        </div>
        <div className="rounded-lg bg-muted p-2"><Icon className="size-5 text-muted-foreground" aria-hidden /></div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, isPending } = useQuery({ queryKey: ["admin", "analytics"], queryFn: fetchAnalytics });

  const chartData = data?.dailyVisits.map((d) => ({
    date: new Date(d.date + "T12:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short" }),
    visitas: d.count,
  })) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Panel de control</h1>
        <p className="text-sm text-muted-foreground">Métricas generales — últimos 30 días.</p>
      </div>

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Visitas al sitio" value={data?.totals.siteViews ?? 0} icon={TrendingUp} sub="Últimos 30 días" />
          <MetricCard label="Vistas de vehículos" value={data?.totals.vehicleViews ?? 0} icon={Car} sub="Últimos 30 días" />
          <MetricCard label="Usuarios activos" value={data?.totals.users ?? 0} icon={Users} />
          <MetricCard label="Mensajes pendientes" value={data?.totals.pendingMessages ?? 0} icon={MessageSquare} />
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 font-heading text-base font-semibold">Visitas diarias — últimos 14 días</h2>
        {isPending ? <Skeleton className="h-56 w-full" /> : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="visitas" radius={[4, 4, 0, 0]} fill="#18181b" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 font-heading text-base font-semibold">Vehículos más vistos</h2>
        {isPending ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
        ) : !data?.topVehicles.length ? (
          <p className="text-sm text-muted-foreground">Sin datos aún. Las vistas se registran cuando los visitantes abren la ficha de un vehículo.</p>
        ) : (
          <div className="space-y-3">
            {data.topVehicles.map((v, i) => {
              const max = data.topVehicles[0]?.views ?? 1;
              const pct = Math.round((v.views / max) * 100);
              return (
                <div key={v.vehicleId ?? i} className="flex items-center gap-3">
                  <span className="w-4 text-xs tabular-nums text-muted-foreground">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate font-medium">{v.title}</span>
                      <span className="ml-2 tabular-nums text-muted-foreground">{v.views}</span>
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