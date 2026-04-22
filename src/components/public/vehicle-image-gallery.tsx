"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image"; // Optimización de imágenes

import { cn } from "@/lib/utils";

type VehicleImageGalleryProps = {
  urls: string[];
  title: string;
};

export function VehicleImageGallery({ urls, title }: VehicleImageGalleryProps) {
  const [active, setActive] = useState(0);
  const safe = urls.filter(Boolean);

  if (safe.length === 0) {
    return (
      <div className="flex aspect-16/10 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/50 text-sm text-muted-foreground">
        Sin fotos disponibles
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Contenedor de la Imagen Principal */}
      <div className="relative aspect-16/10 overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
        <Image
          src={safe[active]}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 800px"
          priority
        />
        
        {safe.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Imagen anterior"
              onClick={() => setActive((a) => (a - 1 + safe.length) % safe.length)}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white transition hover:bg-black/60"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Siguiente imagen"
              onClick={() => setActive((a) => (a + 1) % safe.length)}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white transition hover:bg-black/60"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </>
        )}
      </div>

      {/* Contenedor de Miniaturas */}
      {safe.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {safe.map((url, idx) => (
            <button
              key={`${url}-${idx}`}
              type="button"
              onClick={() => setActive(idx)}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                active === idx ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-80 hover:opacity-100",
              )}
            >
              <Image
                src={url}
                alt={`Miniatura ${idx + 1}`}
                fill
                className="object-cover"
                sizes="100px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}