import Link from "next/link";
import { Gauge, Palette, Settings2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatMileage, formatVehiclePrice } from "@/lib/format";
import { fuelLabel, transmissionLabel } from "@/lib/vehicle-labels";
import { cn } from "@/lib/utils";
import type { FuelType, Transmission, VehicleCondition } from "@prisma/client";

export type VehicleCardProps = {
  id: string;
  title: string;
  brandName: string;
  modelName: string;
  year: number;
  mileageKm: number;
  color: string;
  fuel: FuelType;
  transmission: Transmission;
  priceAmount: number;
  currency: string;
  imageUrls: string[];
  condition?: VehicleCondition;
  salePriceAmount?: number | null;
  href?: string;
  className?: string;
};

export function VehicleCard({
  title,
  brandName,
  modelName,
  year,
  mileageKm,
  color,
  fuel,
  transmission,
  priceAmount,
  currency,
  imageUrls,
  condition,
  salePriceAmount,
  href = "#",
  className,
}: VehicleCardProps) {
  const cover = imageUrls[0];
  const subtitle = `${brandName} ${modelName}`;

  return (
    <Card
      className={cn(
        "group overflow-hidden border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <CardHeader className="relative p-0">
        <Link href={href} className="relative block aspect-16/10 overflow-hidden bg-muted">
          {cover ? (
            // URLs de inventario pueden ser de cualquier dominio (S3, CDN, etc.)
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={title}
              className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              Sin imagen
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/80">{year}</p>
              {condition === "NEW" ? (
                <span className="rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Nuevo
                </span>
              ) : null}
            </div>
            
            <h3 className="line-clamp-2 font-heading text-lg font-semibold leading-snug">{title}</h3>
            <p className="text-sm text-white/90">{subtitle}</p>
          </div>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="font-normal">
            {fuelLabel(fuel)}
          </Badge>
          <Badge variant="outline" className="font-normal">
            {transmissionLabel(transmission)}
          </Badge>
        </div>
        <ul className="grid gap-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Gauge className="size-4 shrink-0 text-foreground/70" aria-hidden />
            <span>{formatMileage(mileageKm)}</span>
          </li>
          <li className="flex items-center gap-2">
            <Palette className="size-4 shrink-0 text-foreground/70" aria-hidden />
            <span>{color}</span>
          </li>
          <li className="flex items-center gap-2">
            <Settings2 className="size-4 shrink-0 text-foreground/70" aria-hidden />
            <span>{transmissionLabel(transmission)}</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-border/80 bg-muted/30 px-4 py-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Precio
          </p>
          {salePriceAmount ? (
            <>
              <p className="text-sm tabular-nums text-muted-foreground line-through">
                {formatVehiclePrice(priceAmount, currency)}
              </p>
              <p className="text-lg font-semibold tabular-nums tracking-tight text-destructive">
                {formatVehiclePrice(salePriceAmount, currency)}
              </p>
            </>
          ) : (
            <p className="text-lg font-semibold tabular-nums tracking-tight">
              {formatVehiclePrice(priceAmount, currency)}
            </p>
          )}
        </div>
        <Link
          href={href}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Ver detalle
        </Link>
      </CardFooter>
    </Card>
  );
}
