"use client";

import type { Category, Vehicle } from "@prisma/client";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image"; // Cambiado para mejor rendimiento

import { buttonVariants } from "@/components/ui/button";
import { formatVehiclePrice } from "@/lib/format";
import { cn } from "@/lib/utils";


type VehicleWithCategories = Vehicle & { brand: Category; model: Category };

type HeroVehicleCarouselProps = {
  vehicles: VehicleWithCategories[];
};

export function HeroVehicleCarousel({ vehicles }: HeroVehicleCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const prev = useCallback(() => {
    setPaused(true);
    setIndex((i) => (i - 1 + vehicles.length) % vehicles.length);
  }, [vehicles.length]);

  const next = useCallback(() => {
    setPaused(true);
    setIndex((i) => (i + 1) % vehicles.length);
  }, [vehicles.length]);

  useEffect(() => {
    if (vehicles.length <= 1 || paused) return;
    
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % vehicles.length);
    }, 8000); // 8 segundos es un estándar más dinámico

    return () => clearInterval(t);
  }, [vehicles.length, paused]);

  // Caso: No hay vehículos
  if (vehicles.length === 0) {
    return (
      <div className="relative aspect-4/3 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-muted shadow-sm lg:max-w-lg">
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

  const v = vehicles[index];
  const cover = v.imageUrls[0];
  const subtitle = `${v.brand.name} ${v.model.name}`;

  return (
    <div 
      className="relative aspect-4/3 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-muted shadow-sm lg:max-w-lg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Imagen de fondo */}
      {cover ? (
        <Image 
          src={cover} 
          alt={v.title}
          fill
          priority 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="absolute inset-0 size-full object-cover transition-opacity duration-500"
          key={v.id} // Ayuda a React a animar el cambio de imagen
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-muted to-muted-foreground/20" />
      )}
      
      {/* Overlay Gradiente */}
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />
      
      {/* Controles de navegación */}
      {vehicles.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Anterior"
            onClick={prev}
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60 active:scale-95"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={next}
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60 active:scale-95"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </>
      )}

      {/* Contenido de texto */}
      <div className="relative flex h-full flex-col justify-end p-6 text-white">
        <p className="text-[11px] font-medium uppercase tracking-wider text-white/75">{v.year}</p>
        <h2 className="mt-1 font-heading text-xl font-semibold leading-snug sm:text-2xl line-clamp-1">{v.title}</h2>
        <p className="mt-1 text-sm text-white/90">{subtitle}</p>
        <p className="mt-3 text-lg font-semibold tabular-nums">
          {formatVehiclePrice(v.priceAmount, v.currency)}
        </p>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <Link 
            href={`/vehiculos/${v.id}`} 
            className={cn(buttonVariants({ size: "sm" }), "bg-white text-foreground hover:bg-white/90")}
          >
            Ver ficha
          </Link>
          <Link
            href="/vehiculos"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-white/40 bg-white/10 text-white hover:bg-white/20 backdrop-blur-md")}
          >
            Catálogo
          </Link>
        </div>

        {/* Indicadores de paginación */}
        {vehicles.length > 1 && (
          <div className="mt-6 flex gap-1.5">
            {vehicles.map((_, i) => (
              <button
                key={`dot-${i}`}
                type="button"
                aria-label={`Ver vehículo ${i + 1}`}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-300",
                  i === index ? "bg-white" : "bg-white/30 hover:bg-white/50",
                )}
                onClick={() => {
                  setPaused(true);
                  setIndex(i);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}