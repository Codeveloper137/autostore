"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "vehicles"],
    queryFn: fetchVehicles,
  });

  const invalidateVehicles = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "vehicles"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
  };

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
            Tabla de productos para el panel interno. Los datos se cargan con React Query desde la API
            administrativa.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
          <VehiclesTable vehicles={data} onEdit={(v) => setEditingVehicle(v)} />
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
            <Skeleton className="aspect-[16/10] min-h-[280px] rounded-xl" />
            <Skeleton className="aspect-[16/10] min-h-[280px] rounded-xl" />
          </div>
        ) : isError ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
            La vista previa de tarjetas aparecerá cuando el listado superior cargue sin errores.
          </p>
        ) : data && data.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.slice(0, 3).map((v) => (
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
