"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GripVertical, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type AboutImagesData = { images: string[] };

async function fetchImages(): Promise<AboutImagesData> {
  const res = await fetch("/api/admin/about-images");
  if (!res.ok) throw new Error("Error al cargar imágenes");
  return res.json();
}

export default function AdminAboutPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data, isPending } = useQuery({
    queryKey: ["admin", "about-images"],
    queryFn: fetchImages,
  });

  const saveImages = useMutation({
    mutationFn: async (images: string[]) => {
      const res = await fetch("/api/admin/about-images", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      return res.json() as Promise<AboutImagesData>;
    },
    onSuccess: (result) => {
      queryClient.setQueryData(["admin", "about-images"], result);
    },
  });

  async function onFilesSelected(files: FileList | null) {
    if (!files?.length) return;
    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      for (const f of Array.from(files)) {
        if (f.type !== "image/jpeg" && f.type !== "image/png") continue;
        fd.append("files", f);
      }
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const result = (await res.json()) as { urls?: string[]; error?: string };
      if (!res.ok) { setUploadError(result.error ?? "Error al subir"); return; }
      const current = data?.images ?? [];
      saveImages.mutate([...current, ...(result.urls ?? [])]);
    } finally { setUploading(false); }
  }

  function removeImage(url: string) {
    const current = data?.images ?? [];
    saveImages.mutate(current.filter((u) => u !== url));
  }

  function moveImage(from: number, to: number) {
    const imgs = [...(data?.images ?? [])];
    const [moved] = imgs.splice(from, 1);
    if (moved) imgs.splice(to, 0, moved);
    saveImages.mutate(imgs);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Sobre nosotros</h1>
        <p className="text-sm text-muted-foreground">
          Imágenes del carrusel en la página pública <code>/sobre-nosotros</code>.
          Se muestran en el orden indicado.
        </p>
      </div>

      {/* Zona de upload */}
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,.jpg,.jpeg,.png"
          multiple
          className="hidden"
          onChange={(e) => { void onFilesSelected(e.target.files); e.target.value = ""; }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2"
        >
          <Upload className="size-4" />
          {uploading ? "Subiendo…" : "Subir imágenes (JPG o PNG)"}
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          Puedes seleccionar varias a la vez. Se añaden al final del carrusel.
        </p>
        {uploadError ? <p className="mt-2 text-sm text-destructive">{uploadError}</p> : null}
      </div>

      {/* Lista de imágenes */}
      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="aspect-video rounded-xl" />)}
        </div>
      ) : !data?.images.length ? (
        <p className="text-sm text-muted-foreground">
          No hay imágenes aún. Sube la primera usando el botón de arriba.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.images.map((url, idx) => (
            <div
              key={url}
              className="group relative overflow-hidden rounded-xl border border-border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="aspect-video w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                {idx > 0 ? (
                  <Button
                    size="icon-sm" variant="secondary"
                    title="Mover antes"
                    onClick={() => moveImage(idx, idx - 1)}
                  >
                    <GripVertical className="size-4 rotate-90" />
                  </Button>
                ) : null}
                {idx < data.images.length - 1 ? (
                  <Button
                    size="icon-sm" variant="secondary"
                    title="Mover después"
                    onClick={() => moveImage(idx, idx + 1)}
                  >
                    <GripVertical className="size-4 -rotate-90" />
                  </Button>
                ) : null}
                <Button
                  size="icon-sm" variant="destructive"
                  title="Eliminar imagen"
                  onClick={() => { if (window.confirm("¿Eliminar esta imagen del carrusel?")) removeImage(url); }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                <p className="text-xs tabular-nums text-white/80">{idx + 1} / {data.images.length}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}