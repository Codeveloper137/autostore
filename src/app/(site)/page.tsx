import type { Category, Vehicle } from "@prisma/client";
import Link from "next/link";

import { VehicleCard } from "@/components/admin/vehicle-card";
import { ContactSection } from "@/components/public/contact-section";
import { HeroVehicleCarousel } from "@/components/public/hero-vehicle-carousel";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/infrastructure/persistence/prisma";
import { cn } from "@/lib/utils";

import { TrackView } from "@/app/api/analytics/track-view";


export const revalidate = 60;

type VehicleWithCategories = Vehicle & { brand: Category; model: Category };

type HomeProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function Home({ searchParams }: HomeProps) {
  const sp = searchParams ? await searchParams : {};
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const perPage = 6;



  let featured: VehicleWithCategories[] = [];
  let totalFeatured = 0;

  try {
    [featured, totalFeatured] = await Promise.all([
      prisma.vehicle.findMany({
        where: { published: true, featured: true, archivedAt: null },
        orderBy: { updatedAt: "desc" },
        include: { brand: true, model: true },
        take: perPage,
        skip: (page - 1) * perPage,
      }),
      prisma.vehicle.count({
        where: { published: true, featured: true, archivedAt: null },
      }),
    ]);
  } catch {
    featured = [];
    totalFeatured = 0;
  }

  const totalPages = Math.max(1, Math.ceil(totalFeatured / perPage));
  // El carrusel siempre muestra los primeros 8 del inventario completo (sin paginar)
  const carouselVehicles = page === 1 ? featured.slice(0, 8) : [];
  const gridVehicles = featured;

  return (
    <div>
      <TrackView type="SITE_VIEW" path="/" />

      <section className="border-b border-border bg-linear-to-b from-muted/50 to-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-24">
          <div className="max-w-xl space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Auto Store Motors
            </p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
              La tienda con los mejores carros y precios de Barranquilla.  
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              Explora nuestro inventario publicado, consulta fichas técnicas y precios, y contáctanos cuando encuentres
              la unidad ideal.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/vehiculos" className={cn(buttonVariants({ size: "lg" }), "min-w-45 justify-center")}>
                Ver catálogo
              </Link>
              <Link
                href="/#contacto"
                className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "min-w-45 justify-center")}
              >
                Contactar
              </Link>
            </div>
          </div>
          <HeroVehicleCarousel vehicles={carouselVehicles} />
        </div>
      </section>

      <section className="border-t border-border bg-background py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Catálogo</p>
              <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">Vehículos destacados</h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Unidades marcadas como <span className="font-medium text-foreground">destacadas</span> en el panel
                (además de publicadas). Consulta la ficha o explora el catálogo completo con filtros.
              </p>
            </div>
            <Link
              href="/vehiculos"
              className={cn(buttonVariants({ variant: "outline" }), "w-full shrink-0 justify-center sm:w-auto")}
            >
              Ver catálogo completo
            </Link>
          </div>

          {totalFeatured === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center text-sm text-muted-foreground">
              No hay vehículos destacados. Marca unidades como{" "}
              <strong className="text-foreground">destacadas</strong> (y publicadas) desde el panel o revisa el{" "}
              <Link href="/vehiculos" className="font-medium text-primary underline-offset-4 hover:underline">
                catálogo completo
              </Link>
              .
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {gridVehicles.map((v) => (
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

              {/* Paginación solo si hay más de 6 destacados */}
              {totalPages > 1 ? (
                <div className="mt-8 flex items-center justify-center gap-2">
                  {page > 1 ? (
                    <Link
                      href={`/?page=${page - 1}`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "min-w-22.5] justify-center")}
                    >
                      ← Anterior
                    </Link>
                  ) : null}
                  <span className="px-3 text-sm tabular-nums text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                  {page < totalPages ? (
                    <Link
                      href={`/?page=${page + 1}`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "min-w-22.5 justify-center")}
                    >
                      Siguiente →
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>

      <ContactSection />
    </div>
  );
}
