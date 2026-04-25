import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from 'react';
import type { LucideIcon } from "lucide-react";
import { Fuel, Gauge, MessageCircle, Palette, Settings2 } from "lucide-react";

import { VehicleImageGallery } from "@/components/public/vehicle-image-gallery";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatMileage, formatVehiclePrice } from "@/lib/format";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { fuelLabel, transmissionLabel } from "@/lib/vehicle-labels";
import { cn } from "@/lib/utils";
import { prisma } from "@/infrastructure/persistence/prisma";

import { TrackView } from "@/app/api/analytics/track-view";


// cache() de React deduplicará la query dentro del mismo render:
// generateMetadata y la page function comparten el mismo resultado.
const getVehicle = cache(async (id: string) => {
  return prisma.vehicle.findFirst({
    where: { id, published: true },
    include: { brand: true, model: true },
  });
});


type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const v = await getVehicle(id);
  if (!v) return { title: "Vehículo" };
  return {
    title: `${v.title} · ${v.brand.name} ${v.model.name}`,
    description: v.shortDescription ?? `${v.brand.name} ${v.model.name}`,
  };
}

export const revalidate = 60;

export default async function VehiculoDetallePage({ params }: Props) {
  const { id } = await params;

  const vehicle = await getVehicle(id)

  if (!vehicle) notFound();

  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
    ? buildWhatsAppLink(
        process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
        `Hola, me interesa el vehículo: ${vehicle.title} (${vehicle.brand.name} ${vehicle.model.name}, ${vehicle.year}).`,
      )
    : null;

  return (
    <div className="mx-auto max-w-6xl px-0 py-0 sm:px-6 sm:py-8 lg:py-12">

      <TrackView type="VEHICLE_VIEW" vehicleId={vehicle.id} path={`/vehiculos/${vehicle.id}`} />

      <div className="mb-4 px-4 pt-4 text-sm text-muted-foreground sm:mb-6 sm:px-0 sm:pt-0">
        <Link href="/vehiculos" className="hover:text-foreground">
          ← Catálogo
        </Link>
      </div>

      {/* Columna en móvil, grid equilibrado 50/50 en desktop */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">

        <VehicleImageGallery urls={vehicle.imageUrls} title={vehicle.title} />

        <div className="space-y-6 px-4 pb-8 sm:px-0">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{vehicle.year}</p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{vehicle.title}</h1>
            <p className="mt-1 text-lg text-muted-foreground">
              {vehicle.brand.name} {vehicle.model.name}
              {vehicle.stockCode ? (
                <span className="ml-2 text-sm tabular-nums text-muted-foreground">· {vehicle.stockCode}</span>
              ) : null}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Precio</p>
            
            {vehicle.salePriceAmount ? (
              <>
                <p className="mt-1 text-lg tabular-nums text-muted-foreground line-through">
                  {formatVehiclePrice(vehicle.priceAmount, vehicle.currency)}
                </p>
                <p className="text-3xl font-semibold tabular-nums tracking-tight text-destructive">
                  {formatVehiclePrice(vehicle.salePriceAmount, vehicle.currency)}
                </p>
              </>
            ) : (
              <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
                {formatVehiclePrice(vehicle.priceAmount, vehicle.currency)}
              </p>
            )}

          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <SpecItem icon={Gauge} label="Kilometraje" value={formatMileage(vehicle.mileageKm)} />
            <SpecItem icon={Palette} label="Color" value={vehicle.color} />
            <SpecItem icon={Settings2} label="Transmisión" value={transmissionLabel(vehicle.transmission)} />
            <SpecItem icon={Fuel} label="Combustible" value={fuelLabel(vehicle.fuel)} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ size: "lg" }), "inline-flex flex-1 items-center justify-center gap-2")}
              >
                <MessageCircle className="size-5" />
                Consultar por WhatsApp
              </a>
            ) : (
              <Button size="lg" variant="secondary" disabled className="flex-1">
                Configura NEXT_PUBLIC_WHATSAPP_NUMBER para WhatsApp
              </Button>
            )}
            <Link
              href="/vehiculos"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "flex-1 justify-center")}
            >
              Ver más vehículos
            </Link>
          </div>

          {vehicle.shortDescription ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{vehicle.shortDescription}</p>
          ) : null}

          <div className="prose prose-sm max-w-none text-foreground dark:prose-invert">
            <h2 className="font-heading text-lg font-semibold">Descripción</h2>
            <p className="whitespace-pre-wrap text-muted-foreground">{vehicle.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-border/80 bg-muted/30 px-3 py-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}