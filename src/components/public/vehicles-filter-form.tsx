"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { fuelLabel, transmissionLabel } from "@/lib/vehicle-labels";
import type { FuelType, Transmission, VehicleCondition } from "@prisma/client";
import { FuelType as FuelEnum, Transmission as TransEnum } from "@prisma/client";

const FUELS = Object.values(FuelEnum);
const TRANSMISSIONS = Object.values(TransEnum);

type Props = {
  sp: Record<string, string | undefined>;
  brands: { id: string; name: string }[];
  models: { id: string; name: string }[];
  hasFilters: boolean;
};

export function VehiclesFilterForm({ sp, brands, models, hasFilters }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    const data = new FormData(formRef.current);
    const params = new URLSearchParams();
    for (const [k, v] of data.entries()) {
      if (v && String(v).trim()) params.set(k, String(v));
    }
    router.push(`/vehiculos?${params.toString()}`);
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="mb-10 space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6"
      aria-label="Filtros del catálogo"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Buscar */}
        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
          <label htmlFor="flt-q" className="text-xs font-medium text-muted-foreground">Buscar</label>
          <input
            id="flt-q" name="q" type="search"
            defaultValue={sp.q ?? ""}
            placeholder="Título, marca, color…"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>

        {/* Marca — shadcn Select con scroll */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Marca</label>
          <Select name="brandId" defaultValue={sp.brandId ?? ""}>
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent className="max-h-52 overflow-y-auto">
              <SelectItem value="">Todas</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* hidden input para el form submit nativo como fallback */}
        </div>

        {/* Modelo — shadcn Select con scroll */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Modelo</label>
          <Select name="modelId" defaultValue={sp.modelId ?? ""}>
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent className="max-h-52 overflow-y-auto">
              <SelectItem value="">Todos</SelectItem>
              {models.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Año desde / hasta */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label htmlFor="flt-year-min" className="text-xs font-medium text-muted-foreground">Año desde</label>
            <input id="flt-year-min" name="yearMin" type="number" min={1980} max={2100}
              defaultValue={sp.yearMin ?? ""} placeholder="2015"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" />
          </div>
          <div className="space-y-2">
            <label htmlFor="flt-year-max" className="text-xs font-medium text-muted-foreground">Año hasta</label>
            <input id="flt-year-max" name="yearMax" type="number" min={1980} max={2100}
              defaultValue={sp.yearMax ?? ""} placeholder="2026"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" />
          </div>
        </div>

        {/* Precio min / max */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label htmlFor="flt-price-min" className="text-xs font-medium text-muted-foreground">Precio mín.</label>
            <input id="flt-price-min" name="priceMin" type="number" min={0} step={1000000}
              defaultValue={sp.priceMin ?? ""} placeholder="0"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" />
          </div>
          <div className="space-y-2">
            <label htmlFor="flt-price-max" className="text-xs font-medium text-muted-foreground">Precio máx.</label>
            <input id="flt-price-max" name="priceMax" type="number" min={0} step={1000000}
              defaultValue={sp.priceMax ?? ""} placeholder="300000000"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" />
          </div>
        </div>

        {/* Combustible */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Combustible</label>
          <Select name="fuel" defaultValue={sp.fuel ?? ""}>
            <SelectTrigger className="h-9 w-full"><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {FUELS.map((f) => <SelectItem key={f} value={f}>{fuelLabel(f)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Transmisión */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Transmisión</label>
          <Select name="transmission" defaultValue={sp.transmission ?? ""}>
            <SelectTrigger className="h-9 w-full"><SelectValue placeholder="Todas" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              {TRANSMISSIONS.map((t) => <SelectItem key={t} value={t}>{transmissionLabel(t)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Destacado */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Destacado</label>
          <Select name="destacado" defaultValue={sp.destacado ?? ""}>
            <SelectTrigger className="h-9 w-full"><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="1">Solo destacados</SelectItem>
              <SelectItem value="0">Sin destacar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Condición */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Condición</label>
          <Select name="condition" defaultValue={sp.condition ?? ""}>
            <SelectTrigger className="h-9 w-full"><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="NEW">Nuevo</SelectItem>
              <SelectItem value="USED">Usado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Por página */}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="submit" className={cn(buttonVariants(), "min-w-[120px]")}>
          Aplicar filtros
        </button>
        {hasFilters ? (
          <button
            type="button"
            onClick={() => router.push("/vehiculos")}
            className={cn(buttonVariants({ variant: "outline" }), "min-w-[120px] justify-center")}
          >
            Limpiar
          </button>
        ) : null}
      </div>
    </form>
  );
}