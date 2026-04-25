"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ImageCarouselProps = {
  images: string[];
  className?: string;
};

export function ImageCarousel({ images, className }: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const safe = images.filter(Boolean);

  useEffect(() => {
    if (safe.length <= 1) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % safe.length);
    }, 5_000);
    return () => window.clearInterval(t);
  }, [safe.length]);

  if (safe.length === 0) return null;

  const prev = () => setIndex((i) => (i - 1 + safe.length) % safe.length);
  const next = () => setIndex((i) => (i + 1) % safe.length);

  return (
    <div className={cn("relative overflow-hidden rounded-2xl", className)}>
      {/* Imagen activa */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={safe[index]}
        src={safe[index]}
        alt=""
        className="aspect-ratio: 16/9 w-full object-cover"
      />

      {/* Flechas (solo si hay más de una) */}
      {safe.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Imagen anterior"
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Imagen siguiente"
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>

          {/* Indicadores */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {safe.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ir a imagen ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/75",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}