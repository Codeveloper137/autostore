"use client";

import type { Category, Vehicle } from "@prisma/client";
import Link from "next/link";
import { useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { formatVehiclePrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type VehicleWithCategories = Vehicle & { brand: Category; model: Category };

type HeroVehicleCarouselProps = {
  vehicles: VehicleWithCategories[];
};

export function HeroVehicleCarousel({ vehicles }: HeroVehicleCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (vehicles.length <= 1) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % vehicles.length);
    }, 10_000);
    return () => window.clearInterval(t);
  }, [vehicles.length]);

  if (vehicles.length === 0) {
    return (
      <div className="relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl border border-border bg-muted shadow-sm lg:max-w-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.92_0_0),transparent_50%),radial-gradient(circle_at_80%_60%,oklch(0.85_0_0),transparent_45%)]" />
        <div className="relative flex h-full flex-col justify-end p-6 text-sm">
          <p className="font-medium text-foreground">Inventario actualizado desde el panel interno</p>
          <p className="mt-1 text-muted-foreground">
            Publica unidades con fotos, precio en COP y especificaciones listas para el cliente final.
          </p>
        </div>
      </div>
    );
  }

  const v = vehicles[index]!;
  const cover = v.imageUrls[0];
  const subtitle = `${v.brand.name} ${v.model.name}`;

  return (
    <div className="relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl border border-border bg-muted shadow-sm lg:max-w-lg">
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
      <div className="relative flex h-full flex-col justify-end p-6 text-white">
        <p className="text-[11px] font-medium uppercase tracking-wider text-white/75">{v.year}</p>
        <h2 className="mt-1 font-heading text-xl font-semibold leading-snug sm:text-2xl">{v.title}</h2>
        <p className="mt-1 text-sm text-white/90">{subtitle}</p>
        <p className="mt-3 text-lg font-semibold tabular-nums">{formatVehiclePrice(v.priceAmount, v.currency)}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/vehiculos/${v.id}`} className={cn(buttonVariants({ size: "sm" }), "bg-white text-foreground hover:bg-white/90")}>
            Ver ficha
          </Link>
          <Link
            href="/vehiculos"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-white/40 bg-white/10 text-white hover:bg-white/20")}
          >
            Catálogo
          </Link>
        </div>
        {vehicles.length > 1 ? (
          <div className="mt-4 flex gap-1.5">
            {vehicles.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ver vehículo ${i + 1}`}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  i === index ? "bg-white" : "bg-white/35 hover:bg-white/55",
                )}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
