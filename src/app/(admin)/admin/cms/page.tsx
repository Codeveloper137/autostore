"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

type CmsRow = {
  id: string; slug: string; title: string;
  excerpt: string | null; body: string;
  coverImageUrl: string | null;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null; updatedAt: string;
};

async function fetchPages(): Promise<CmsRow[]> {
  const res = await fetch("/api/admin/cms");
  if (!res.ok) throw new Error("Error al cargar publicaciones");
  return res.json();
}

type FormState = { title: string; slug: string; excerpt: string; coverImageUrl: string; body: string; published: boolean };
function emptyForm(): FormState { return { title: "", slug: "", excerpt: "", coverImageUrl: "", body: "", published: false }; }

function CmsDialog({
  mode, initial, open, onOpenChange, onSaved,
}: {
  mode: "create" | "edit";
  initial?: CmsRow | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(emptyForm());
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);

  // FIX: useEffect correcto en lugar del hack de useState
  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initial) {
      setForm({
        title: initial.title,
        slug: initial.slug,
        excerpt: initial.excerpt ?? "",
        coverImageUrl: initial.coverImageUrl ?? "",
        body: initial.body,
        published: initial.status === "PUBLISHED",
      });
    } else {
      setForm(emptyForm());
    }
    setError(null);
  }, [open, mode, initial?.id]);

  const set = (k: keyof FormState, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Subir imagen de portada al mismo endpoint de vehículos
  async function onFileSelected(files: FileList | null) {
    if (!files?.length) return;
    const file = files[0];
    if (!file) return;
    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      setError("Solo se permiten archivos JPG o PNG.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("files", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { urls?: string[]; error?: string };
      if (!res.ok) { setError(data.error ?? "Error al subir la imagen"); return; }
      set("coverImageUrl", data.urls?.[0] ?? "");
    } finally { setUploading(false); }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const url = mode === "edit" && initial
        ? `/api/admin/cms/${initial.id}`
        : "/api/admin/cms";
      const res = await fetch(url, {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug || undefined,
          excerpt: form.excerpt || undefined,
          coverImageUrl: form.coverImageUrl || undefined,
          body: form.body,
          status: form.published ? "PUBLISHED" : "DRAFT",
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) { setError(data.error ?? "Error al guardar"); return; }
      onOpenChange(false);
      onSaved();
    } finally { setPending(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-4 left-1/2 flex max-h-[calc(100vh-2rem)] w-[min(100vw-2rem,52rem)] -translate-x-1/2 translate-y-0 flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <div className="overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>{mode === "edit" ? "Editar publicación" : "Nueva publicación"}</DialogTitle>
          </DialogHeader>
          <form id="cms-form" onSubmit={(e) => void onSubmit(e)} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cms-title">Título</Label>
              <Input
                id="cms-title" required value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Título de la publicación"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cms-slug">Slug URL (opcional — se genera automáticamente)</Label>
              <Input
                id="cms-slug" value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="mi-publicacion"
              />
              <p className="text-xs text-muted-foreground">
                Se publicará en <code>/blogs/{form.slug || "slug-automatico"}</code>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cms-excerpt">Extracto (opcional)</Label>
              <Input
                id="cms-excerpt" value={form.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                placeholder="Resumen breve para el listado"
              />
            </div>

            {/* IMAGEN DE PORTADA — upload de archivo */}
            <div className="space-y-2">
              <Label htmlFor="cms-cover-file">Imagen de portada (JPG o PNG)</Label>
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  id="cms-cover-file"
                  type="file"
                  accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                  disabled={uploading}
                  className="cursor-pointer text-sm file:mr-2 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
                  onChange={(e) => { void onFileSelected(e.target.files); e.target.value = ""; }}
                />
                {uploading ? (
                  <span className="text-xs text-muted-foreground">Subiendo…</span>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                Se muestra en la tarjeta del listado /blogs. Recomendado: 1200×630 px (16:9).
              </p>
              {form.coverImageUrl ? (
                <div className="space-y-1">
                  <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-lg border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.coverImageUrl} alt="Preview portada" className="h-full w-full object-cover" />
                  </div>
                  <button
                    type="button"
                    className="text-xs text-destructive hover:underline"
                    onClick={() => set("coverImageUrl", "")}
                  >
                    Quitar imagen
                  </button>
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cms-body">Contenido HTML</Label>
              <Textarea
                id="cms-body" rows={16} value={form.body}
                onChange={(e) => set("body", e.target.value)}
                placeholder={`<h2>Título de sección</h2>\n<p>Contenido del artículo...</p>`}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Acepta HTML y CSS inline. El contenido se renderiza en la página del blog.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="cms-pub" checked={form.published}
                onCheckedChange={(v) => set("published", v === true)}
              />
              <Label htmlFor="cms-pub" className="font-normal">
                Publicar (visible en /blogs)
              </Label>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </form>
        </div>
        <DialogFooter className="border-t bg-muted/40 px-6 py-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="cms-form" disabled={pending || uploading}>
            {pending ? "Guardando…" : mode === "edit" ? "Guardar cambios" : "Crear publicación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminCmsPage() {
  const [editing, setEditing] = useState<CmsRow | null>(null);
  const [creating, setCreating] = useState(false);
  const queryClient = useQueryClient();
  const { data, isPending, isError, error } = useQuery({ queryKey: ["admin", "cms"], queryFn: fetchPages });
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ["admin", "cms"] });

  const deletePage = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/cms/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
    },
    onSuccess: invalidate,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Blog y noticias</h1>
          <p className="text-sm text-muted-foreground">Publicaciones visibles en <code>/blogs</code>.</p>
        </div>
        <Button size="sm" onClick={() => setCreating(true)} className="inline-flex items-center gap-2">
          <Plus className="size-4" /> Nueva publicación
        </Button>
      </div>

      <CmsDialog mode="create" open={creating} onOpenChange={setCreating} onSaved={invalidate} />
      <CmsDialog
        mode="edit" initial={editing}
        open={editing !== null}
        onOpenChange={(v) => { if (!v) setEditing(null); }}
        onSaved={invalidate}
      />

      {isPending ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
      ) : isError ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 size-4 text-destructive" />
          <p className="text-sm text-destructive">{error.message}</p>
        </div>
      ) : !data?.length ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
          No hay publicaciones. Crea la primera usando el botón de arriba.
        </p>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border bg-card shadow-sm">
          {data.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{p.title}</span>
                  <Badge variant={p.status === "PUBLISHED" ? "secondary" : "outline"} className="text-xs">
                    {p.status === "PUBLISHED" ? "Publicado" : "Borrador"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">/blogs/{p.slug}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button size="icon-sm" variant="ghost" onClick={() => setEditing(p)} aria-label="Editar">
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon-sm" variant="ghost" className="text-destructive"
                  aria-label="Eliminar"
                  onClick={() => { if (window.confirm(`¿Eliminar "${p.title}"?`)) deletePage.mutate(p.id); }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}