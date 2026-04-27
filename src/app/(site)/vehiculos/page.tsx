import type { Category, FuelType, Prisma, Transmission, Vehicle } from "@prisma/client";
import {
  CategoryKind,
  FuelType as FuelEnum,
  Transmission as TransEnum,
  VehicleCondition as CondEnum,
} from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";

import { VehicleCard } from "@/components/admin/vehicle-card";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/infrastructure/persistence/prisma";
import { fuelLabel, transmissionLabel } from "@/lib/vehicle-labels";
import { cn } from "@/lib/utils";

import { TrackView } from "@/app/api/analytics/track-view";


type VehicleWithCategories = Vehicle & { brand: Category; model: Category };

export const metadata: Metadata = {
  title: "Catálogo de vehículos",
  description: "Explora el inventario disponible en Auto Store Motors.",
};

export const revalidate = 60;

const FUELS = Object.values(FuelEnum);
const TRANSMISSIONS = Object.values(TransEnum);

function parseIntSafe(value: string | undefined): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function buildWhere(sp: Record<string, string | undefined>): Prisma.VehicleWhereInput {
  const where: Prisma.VehicleWhereInput = { published: true, archivedAt: null };

  if (sp.brandId) where.brandId = sp.brandId;
  if (sp.modelId) where.modelId = sp.modelId;

  const fuel = sp.fuel as FuelType | undefined;
  if (fuel && FUELS.includes(fuel)) where.fuel = fuel;

  const transmission = sp.transmission as Transmission | undefined;
  if (transmission && TRANSMISSIONS.includes(transmission)) where.transmission = transmission;

  const yearMin = parseIntSafe(sp.yearMin);
  const yearMax = parseIntSafe(sp.yearMax);
  if (yearMin != null || yearMax != null) {
    where.year = {};
    if (yearMin != null) where.year.gte = yearMin;
    if (yearMax != null) where.year.lte = yearMax;
  }

  const priceMin = parseIntSafe(sp.priceMin);
  const priceMax = parseIntSafe(sp.priceMax);
  if (priceMin != null || priceMax != null) {
    where.priceAmount = {};
    if (priceMin != null) where.priceAmount.gte = priceMin;
    if (priceMax != null) where.priceAmount.lte = priceMax;
  }

  const dest = sp.destacado?.trim();
  if (dest === "1" || dest === "true" || dest === "yes") {
    where.featured = true;
  } else if (dest === "0" || dest === "false" || dest === "no") {
    where.featured = false;
  }

  const cond = sp.condition as CondEnum | undefined;
  if (cond && Object.values(CondEnum).includes(cond)) where.condition = cond;

  const q = sp.q?.trim();
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { shortDescription: { contains: q, mode: "insensitive" } },
      { color: { contains: q, mode: "insensitive" } },
      { brand: { name: { contains: q, mode: "insensitive" } } },
      { model: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  return where;
}

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function VehiculosPage({ searchParams }: PageProps) {
  const sp = await searchParams;


  // Paginación
  const perPage = sp.perPage === "6" ? 6 : 12;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const where = buildWhere(sp);

 let vehicles: VehicleWithCategories[] = [];
  let brands: Pick<Category, "id" | "name">[] = [];
  let models: Pick<Category, "id" | "name">[] = [];
  let total = 0;

  try {
    // Eliminamos el "let total = 0" que estaba aquí adentro para no duplicar
    [vehicles, brands, models, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        include: { brand: true, model: true },
        take: perPage,
        skip: (page - 1) * perPage,
      }),
      prisma.category.findMany({
        where: {
          kind: CategoryKind.BRAND,
          vehiclesAsBrand: { some: { published: true } },
        },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.category.findMany({
        where: {
          kind: CategoryKind.MODEL,
          vehiclesAsModel: {
            some: {
              published: true,
              archivedAt: null,
              ...(sp.brandId ? { brandId: sp.brandId } : {}),
            },
          },
        },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      // --- ESTA ES LA LÍNEA QUE FALTABA ---
      prisma.vehicle.count({ where }), 
    ]);
  } catch (error) {
    console.error("Error cargando catálogo:", error);
    vehicles = [];
    brands = [];
    models = [];
    total = 0;
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  // Construir URL con los filtros actuales + cambio de página/perPage
  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { ...sp, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v != null && v !== "" && v !== undefined) params.set(k, v);
    }
    const qs = params.toString();
    return `/vehiculos${qs ? `?${qs}` : ""}`;
  }

  const hasFilters = Object.values(sp).some((v) => v != null && v !== "");

  return (
    <div className="mx-auto w-full max-w-6xl overflow-x-hidden px-4 py-10 sm:px-6">

      <TrackView type="PAGE_VIEW" path="/vehiculos" />

      <div className="mb-10 max-w-2xl space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Inventario</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Vehículos disponibles</h1>
        <p className="text-sm text-muted-foreground">
          Filtra por marca, modelo, año, precio, destacados y más. Solo se muestran unidades publicadas desde el panel administrativo.
        </p>
      </div>

      <form
        method="get"
        className="mb-10 w-full space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6"
        aria-label="Filtros del catálogo"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* 1. BUSCAR */}
          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
            <label htmlFor="flt-q" className="text-xs font-medium text-muted-foreground">
              Buscar
            </label>
            <input
              id="flt-q"
              name="q"
              type="search"
              defaultValue={sp.q ?? ""}
              placeholder="Título, marca, color…"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>

          {/* 2. MARCA */}
          <div className="space-y-2">
            <label htmlFor="flt-brand" className="text-xs font-medium text-muted-foreground">
              Marca
            </label>
            <select
              id="flt-brand"
              name="brandId"
              defaultValue={sp.brandId ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">Todas</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. MODELO */}
          <div className="space-y-2">
            <label htmlFor="flt-model" className="text-xs font-medium text-muted-foreground">
              Modelo
            </label>
            <select
              id="flt-model"
              name="modelId"
              defaultValue={sp.modelId ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">
                {sp.brandId ? `Todos los modelos` : "Todos"}
              </option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. AÑOS */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="flt-year-min" className="text-xs font-medium text-muted-foreground">
                Año desde
              </label>
              <input
                id="flt-year-min"
                name="yearMin"
                type="number"
                min={1980}
                max={2100}
                defaultValue={sp.yearMin ?? ""}
                placeholder="2015"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="flt-year-max" className="text-xs font-medium text-muted-foreground">
                Año hasta
              </label>
              <input
                id="flt-year-max"
                name="yearMax"
                type="number"
                min={1980}
                max={2100}
                defaultValue={sp.yearMax ?? ""}
                placeholder="2026"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>
          </div>

          {/* 5. PRECIOS */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="flt-price-min" className="text-xs font-medium text-muted-foreground">
                Precio mín.
              </label>
              <input
                id="flt-price-min"
                name="priceMin"
                type="number"
                min={0}
                step={1000000}
                defaultValue={sp.priceMin ?? ""}
                placeholder="0"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="flt-price-max" className="text-xs font-medium text-muted-foreground">
                Precio máx.
              </label>
              <input
                id="flt-price-max"
                name="priceMax"
                type="number"
                min={0}
                step={1000000}
                defaultValue={sp.priceMax ?? ""}
                placeholder="300000000"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>
          </div>

          {/* 6. COMBUSTIBLE */}
          <div className="space-y-2">
            <label htmlFor="flt-fuel" className="text-xs font-medium text-muted-foreground">
              Combustible
            </label>
            <select
              id="flt-fuel"
              name="fuel"
              defaultValue={sp.fuel ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">Todos</option>
              {FUELS.map((f) => (
                <option key={f} value={f}>
                  {fuelLabel(f)}
                </option>
              ))}
            </select>
          </div>

          {/* 7. TRANSMISIÓN (Ocupa columna 1 de la fila 3) */}
          <div className="space-y-2">
            <label htmlFor="flt-trans" className="text-xs font-medium text-muted-foreground">
              Transmisión
            </label>
            <select
              id="flt-trans"
              name="transmission"
              defaultValue={sp.transmission ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">Todas</option>
              {TRANSMISSIONS.map((t) => (
                <option key={t} value={t}>
                  {transmissionLabel(t)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="flt-per-page" className="text-xs font-medium text-muted-foreground">
              Por página
            </label>
            <select
              id="flt-per-page"
              name="perPage"
              defaultValue={String(perPage)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="6">6 vehículos</option>
              <option value="12">12 vehículos</option>
            </select>
          </div>


          {/* 8. DESTACADO (Ocupa la columna 2 / Mitad) */}
          <div className="space-y-2">
            <label htmlFor="flt-destacado" className="text-xs font-medium text-muted-foreground">
              Destacado
            </label>
            <select
              id="flt-destacado"
              name="destacado"
              defaultValue={sp.destacado ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">Todos</option>
              <option value="1">Solo destacados</option>
              <option value="0">Sin destacar</option>
            </select>
          </div>

          {/* 9. CONDICIÓN (Ocupa la columna 3 / Derecha completa) */}
          <div className="space-y-2">
            <label htmlFor="flt-condition" className="text-xs font-medium text-muted-foreground">
              Condición
            </label>
            <select
              id="flt-condition"
              name="condition"
              defaultValue={sp.condition ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">Todos</option>
              <option value="NEW">Nuevo</option>
              <option value="USED">Usado</option>
            </select>
          </div>
        </div>

        {/* BOTONES */}
        <div className="flex flex-wrap gap-2">
          <button type="submit" className={cn(buttonVariants(), "min-w-30")}>
            Aplicar filtros
          </button>
          {hasFilters ? (
            <Link
              href="/vehiculos"
              className={cn(buttonVariants({ variant: "outline" }), "min-w-30 justify-center")}
            >
              Limpiar
            </Link>
          ) : null}
        </div>
      </form>

      {/* RESULTADOS */}
      {vehicles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <p className="text-muted-foreground">
            No hay vehículos con los filtros seleccionados.{" "}
            {hasFilters ? (
              <Link href="/vehiculos" className="font-medium text-primary underline-offset-4 hover:underline">
                Ver todo el catálogo
              </Link>
            ) : (
              <Link href="/" className="font-medium text-primary underline-offset-4 hover:underline">
                Volver al inicio
              </Link>
            )}
            .
          </p>
        </div>
      ) : (
        <>
          {/* Contador y selector de página */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Mostrando{" "}
              <span className="font-medium text-foreground">
                {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)}
              </span>{" "}
              de <span className="font-medium text-foreground">{total}</span>{" "}
              {total === 1 ? "vehículo" : "vehículos"}
            </p>

            {/* Selector rápido de items por página (sin submit, usando links) */}
            <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
              {([6, 12] as const).map((n) => (
                <Link
                  key={n}
                  href={buildUrl({ perPage: String(n), page: "1" })}
                  className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                    perPage === n
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {n}
                </Link>
              ))}
            </div>
          </div>

          {/* Grid de vehículos */}
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((v) => (
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

          {/* Navegación de páginas */}
          {totalPages > 1 ? (
            <div className="mt-10 flex items-center justify-center gap-2">
              {/* Anterior */}
              {page > 1 ? (
                <Link
                  href={buildUrl({ page: String(page - 1) })}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "min-w-20 justify-center"
                  )}
                >
                  ← Anterior
                </Link>
              ) : (
                <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), "min-w-20 justify-center opacity-40 pointer-events-none")}>
                  ← Anterior
                </span>
              )}

              {/* Números de página */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .reduce<(number | "…")[]>((acc, n, i, arr) => {
                    if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push("…");
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((n, i) =>
                    n === "…" ? (
                      <span key={`ellipsis-${i}`} className="px-1 text-sm text-muted-foreground">…</span>
                    ) : (
                      <Link
                        key={n}
                        href={buildUrl({ page: String(n) })}
                        className={cn(
                          buttonVariants({ variant: n === page ? "default" : "outline", size: "sm" }),
                          "min-w-9 justify-center tabular-nums"
                        )}
                      >
                        {n}
                      </Link>
                    )
                  )}
              </div>

              {/* Siguiente */}
              {page < totalPages ? (
                <Link
                  href={buildUrl({ page: String(page + 1) })}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "min-w-20 justify-center"
                  )}
                >
                  Siguiente →
                </Link>
              ) : (
                <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), "min-w20 justify-center opacity-40 pointer-events-none")}>
                  Siguiente →
                </span>
              )}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}