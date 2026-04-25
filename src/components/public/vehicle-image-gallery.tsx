"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type VehicleImageGalleryProps = {
  urls: string[];
  title: string;
};

export function VehicleImageGallery({ urls, title }: VehicleImageGalleryProps) {
  const [active, setActive] = useState(0);
  const safe = urls.filter(Boolean);
  const main = safe[active] ?? safe[0];

  if (safe.length === 0) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-dashed border-border bg-muted/50 text-sm text-muted-foreground">
        Sin fotos disponibles
      </div>
    );
  }

  const prev = () => setActive((a) => (a - 1 + safe.length) % safe.length);
  const next = () => setActive((a) => (a + 1) % safe.length);

  return (
    <div className="w-full space-y-3">
      {/* Imagen principal: aspect-video para reducir altura vertical */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={main}
          alt={title}
          className="aspect-video w-full object-cover"
        />
        {safe.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Imagen anterior"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white transition hover:bg-black/60"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Siguiente imagen"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white transition hover:bg-black/60"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
            {/* Contador */}
            <div className="absolute bottom-2 right-3 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white tabular-nums">
              {active + 1} / {safe.length}
            </div>
          </>
        ) : null}
      </div>

      {/* Miniaturas */}
      {safe.length > 1 ? (
        <div className="hidden gap-2 overflow-x-auto pb-1 sm:flex">
          {safe.map((url, idx) => (
            <button
              key={`${url}-${idx}`}
              type="button"
              onClick={() => setActive(idx)}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                active === idx
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}