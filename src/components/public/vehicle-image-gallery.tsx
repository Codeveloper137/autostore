"use client";

import { useState } from "react";

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
      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl border border-dashed border-border bg-muted/50 text-sm text-muted-foreground">
        Sin fotos disponibles
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={main} alt={title} className="h-full w-full object-cover" />
      </div>
      {safe.length > 1 ? (
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
