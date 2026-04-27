"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";

import { CreateVehicleDialog } from "@/components/admin/create-vehicle-dialog";
import { VehicleFormDialog, type VehicleRow } from "@/components/admin/vehicle-form-dialog";
import { VehicleCard } from "@/components/admin/vehicle-card";
import { VehiclesTable } from "@/components/admin/vehicles-table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

async function fetchVehicles(): Promise<VehicleRow[]> {
  const res = await fetch("/api/admin/vehicles");
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { error?: string; details?: string } | null;
    const base = err?.error ?? "Error al cargar el inventario";
    const details = err?.details?.trim();
    throw new Error(details ? `${base}\n\nDetalle (solo desarrollo): ${details}` : base);
  }
  return res.json();
}

export function AdminInventoryView() {
  const [editingVehicle, setEditingVehicle] = useState<VehicleRow | null>(null);
  const [perPage, setPerPage] = useState<6 | 12>(12);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "vehicles"],
    queryFn: fetchVehicles,
  });

  const invalidateVehicles = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "vehicles"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
  };

  const archiveMutation = useMutation({
    mutationFn: async (vehicle: VehicleRow) => {
      const res = await fetch(`/api/admin/vehicles/${vehicle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: vehicle.archivedAt === null }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Error al archivar el vehículo");
    },
    onSuccess: invalidateVehicles,
  });

  // Paginación client-side (los datos ya están en memoria via React Query)
  const totalPages = data ? Math.ceil(data.length / perPage) : 1;
  const pagedData = data ? data.slice((page - 1) * perPage, page * perPage) : [];

  return (
    <div className="space-y-10">
      <VehicleFormDialog
        mode="edit"
        open={editingVehicle !== null}
        onOpenChange={(next) => {
          if (!next) setEditingVehicle(null);
        }}
        initialVehicle={editingVehicle ?? undefined}
        onSaved={() => {
          setEditingVehicle(null);
          invalidateVehicles();
        }}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Inventario</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Tabla de productos del panel interno. Datos cargados desde la API administrativa.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de items por página */}
          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
            {([6, 12] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => { setPerPage(n); setPage(1); }}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  perPage === n
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <CreateVehicleDialog onCreated={invalidateVehicles} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending || isFetching}
            onClick={() => void refetch()}
            className="inline-flex items-center gap-2"
          >
            {isFetching ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Actualizando…
              </>
            ) : (
              "Refrescar"
            )}
          </Button>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">Listado</h2>
          {data ? (
            <span className="text-xs text-muted-foreground tabular-nums">
              {data.length} vehículo{data.length === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>

        {isPending ? (
          <div className="space-y-2 rounded-xl border border-border bg-card p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : null}

        {isError ? (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
            <div className="space-y-2">
              <p className="font-medium text-destructive">No se pudo cargar el inventario</p>
              <p className="whitespace-pre-wrap text-muted-foreground">{error.message}</p>
            </div>
          </div>
        ) : null}

        {data && data.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
            Aún no hay vehículos. Usa <span className="font-medium text-foreground">Nuevo vehículo</span> para crear el
            primero o revisa la conexión a la base de datos.
          </p>
        ) : null}

        {data && data.length > 0 ? (
          <>
            <VehiclesTable
              vehicles={pagedData}
              onEdit={(v) => setEditingVehicle(v)}
              onArchive={(v) => archiveMutation.mutate(v)}
            />
            {/* Controles de paginación */}
            {totalPages > 1 ? (
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-muted-foreground">
                  Mostrando{" "}
                  <span className="font-medium text-foreground">
                    {(page - 1) * perPage + 1}–{Math.min(page * perPage, data.length)}
                  </span>{" "}
                  de <span className="font-medium text-foreground">{data.length}</span>
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon-sm"
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    aria-label="Página anterior"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="px-2 text-sm tabular-nums text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    aria-label="Página siguiente"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </section>

      <Separator />

      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Vista previa · tarjeta de catálogo
          </h2>
          <p className="text-sm text-muted-foreground">
            Diseño de tarjeta para el listado público (foto, precio y especificaciones clave).
          </p>
        </div>

        {isPending ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="aspect-16/10 min-h-70 rounded-xl" />
            <Skeleton className="aspect-16/10 min-h-70 rounded-xl" />
          </div>
        ) : isError ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
            La vista previa de tarjetas aparecerá cuando el listado superior cargue sin errores.
          </p>
        ) : data && data.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {pagedData.slice(0, perPage).map((v) => (
              <VehicleCard
                key={v.id}
                id={v.id}
                title={v.title}
                brandName={v.brand.name}
                modelName={v.model.name}
                year={v.year}
                mileageKm={v.mileageKm}
                color={v.color}
                fuel={v.fuel}
                transmission={v.transmission}
                priceAmount={v.priceAmount}
                currency={v.currency}
                imageUrls={v.imageUrls}
                condition={v.condition}
                salePriceAmount={v.salePriceAmount}
                href={`/vehiculos/${v.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <VehicleCard
              id="demo-1"
              title="SUV 4x4 · Demo visual"
              brandName="Marca"
              modelName="Modelo"
              year={2024}
              mileageKm={18500}
              color="Blanco perlado"
              fuel="GASOLINE"
              transmission="AUTOMATIC"
              priceAmount={185000000}
              currency="COP"
              imageUrls={[]}
              href="#"
            />
            <VehicleCard
              id="demo-2"
              title="Sedán ejecutivo · Demo visual"
              brandName="Marca"
              modelName="Modelo"
              year={2023}
              mileageKm={42000}
              color="Gris grafito"
              fuel="HYBRID"
              transmission="CVT"
              priceAmount={142500000}
              currency="COP"
              imageUrls={[]}
              href="#"
            />
          </div>
        )}
      </section>
    </div>
  );
}
