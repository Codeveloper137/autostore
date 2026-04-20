"use client";

import type { Category, Vehicle } from "@prisma/client";
import { FuelType, Transmission } from "@prisma/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { fuelLabel, transmissionLabel } from "@/lib/vehicle-labels";
import { cn } from "@/lib/utils";

const FUELS = Object.values(FuelType);
const TRANSMISSIONS = Object.values(Transmission);

const NEW_CAT = "__new__";

type CategoryOption = { id: string; name: string; slug: string };

export type VehicleRow = Vehicle & {
  brand: Category;
  model: Category;
};

async function fetchCategories(kind: "BRAND" | "MODEL"): Promise<CategoryOption[]> {
  const res = await fetch(`/api/admin/categories?kind=${kind}`);
  if (!res.ok) throw new Error("No se pudieron cargar las categorías");
  return res.json();
}

function PendingImageThumb({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  if (!url) return null;

  return (
    <li className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="h-16 w-24 rounded-md border object-cover" />
      <button
        type="button"
        className="absolute -right-1 -top-1 rounded-full bg-background p-0.5 shadow ring-1 ring-border"
        onClick={onRemove}
        aria-label="Quitar archivo pendiente"
      >
        <Trash2 className="size-3.5" />
      </button>
    </li>
  );
}

async function uploadImageFiles(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];
  const fd = new FormData();
  for (const f of files) {
    fd.append("files", f);
  }
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const data = (await res.json().catch(() => ({}))) as { error?: string; urls?: string[] };
  if (!res.ok) {
    throw new Error(data.error ?? "Error al subir imágenes");
  }
  return data.urls ?? [];
}

function emptyForm() {
  return {
    title: "",
    stockCode: "",
    brandId: NEW_CAT,
    brandName: "",
    modelId: NEW_CAT,
    modelName: "",
    year: String(new Date().getFullYear()),
    mileageKm: "0",
    color: "",
    fuel: "GASOLINE" as FuelType,
    transmission: "AUTOMATIC" as Transmission,
    priceAmount: "",
    currency: "COP",
    shortDescription: "",
    description: "",
    published: false,
    featured: false,
    existingUrls: [] as string[],
    pendingFiles: [] as File[],
  };
}

export type VehicleFormDialogProps = {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialVehicle?: VehicleRow | null;
  onSaved: () => void;
};

export function VehicleFormDialog({ mode, open, onOpenChange, initialVehicle, onSaved }: VehicleFormDialogProps) {
  const fileInputId = useId();
  const [title, setTitle] = useState("");
  const [stockCode, setStockCode] = useState("");
  const [brandId, setBrandId] = useState<string>(NEW_CAT);
  const [brandName, setBrandName] = useState("");
  const [modelId, setModelId] = useState<string>(NEW_CAT);
  const [modelName, setModelName] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [mileageKm, setMileageKm] = useState("0");
  const [color, setColor] = useState("");
  const [fuel, setFuel] = useState<FuelType>("GASOLINE");
  const [transmission, setTransmission] = useState<Transmission>("AUTOMATIC");
  const [priceAmount, setPriceAmount] = useState("");
  const [currency, setCurrency] = useState("COP");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [existingUrls, setExistingUrls] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(
    () => {
      if (!open) return;
      if (mode === "edit" && initialVehicle) {
        setTitle(initialVehicle.title);
        setStockCode(initialVehicle.stockCode ?? "");
        setBrandId(initialVehicle.brand.id);
        setBrandName("");
        setModelId(initialVehicle.model.id);
        setModelName("");
        setYear(String(initialVehicle.year));
        setMileageKm(String(initialVehicle.mileageKm));
        setColor(initialVehicle.color);
        setFuel(initialVehicle.fuel);
        setTransmission(initialVehicle.transmission);
        setPriceAmount(String(initialVehicle.priceAmount));
        setCurrency(initialVehicle.currency);
        setShortDescription(initialVehicle.shortDescription ?? "");
        setDescription(initialVehicle.description);
        setPublished(initialVehicle.published);
        setFeatured(initialVehicle.featured);
        setExistingUrls([...initialVehicle.imageUrls]);
        setPendingFiles([]);
        setFormError(null);
      } else if (mode === "create") {
        const e = emptyForm();
        setTitle(e.title);
        setStockCode(e.stockCode);
        setBrandId(e.brandId);
        setBrandName(e.brandName);
        setModelId(e.modelId);
        setModelName(e.modelName);
        setYear(e.year);
        setMileageKm(e.mileageKm);
        setColor(e.color);
        setFuel(e.fuel);
        setTransmission(e.transmission);
        setPriceAmount(e.priceAmount);
        setCurrency(e.currency);
        setShortDescription(e.shortDescription);
        setDescription(e.description);
        setPublished(e.published);
        setFeatured(e.featured);
        setExistingUrls(e.existingUrls);
        setPendingFiles(e.pendingFiles);
        setFormError(null);
      }
    },
    // Reinicializar al abrir o al cambiar de vehículo (id); evitar deps de initialVehicle completo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, mode, initialVehicle?.id],
  );

  const { data: brands = [], isFetching: loadingBrands } = useQuery({
    queryKey: ["admin", "categories", "BRAND"],
    queryFn: () => fetchCategories("BRAND"),
    enabled: open,
  });

  const { data: models = [], isFetching: loadingModels } = useQuery({
    queryKey: ["admin", "categories", "MODEL"],
    queryFn: () => fetchCategories("MODEL"),
    enabled: open,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const uploaded = await uploadImageFiles(pendingFiles);
      const imageUrls = [...existingUrls, ...uploaded];

      const payload = {
        title,
        stockCode: stockCode.trim() || undefined,
        brandId: brandId !== NEW_CAT ? brandId : undefined,
        brandName: brandId === NEW_CAT ? brandName.trim() || undefined : undefined,
        modelId: modelId !== NEW_CAT ? modelId : undefined,
        modelName: modelId === NEW_CAT ? modelName.trim() || undefined : undefined,
        year: Number(year),
        mileageKm: Number(mileageKm),
        color: color.trim(),
        fuel,
        transmission,
        priceAmount: Number(priceAmount),
        currency,
        shortDescription: shortDescription.trim() || undefined,
        description: description.trim() || undefined,
        imageUrls,
        published,
        featured,
      };

      if (mode === "edit" && initialVehicle) {
        const res = await fetch(`/api/admin/vehicles/${initialVehicle.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          throw new Error(data.error ?? "Error al actualizar el vehículo");
        }
        return data;
      }

      const res = await fetch("/api/admin/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Error al crear el vehículo");
      }
      return data;
    },
    onSuccess: () => {
      setFormError(null);
      setPendingFiles([]);
      onOpenChange(false);
      onSaved();
    },
    onError: (err: Error) => {
      setFormError(err.message);
    },
  });

  function onFilesSelected(files: FileList | null) {
    if (!files?.length) return;
    const next: File[] = [];
    for (const f of Array.from(files)) {
      if (f.type !== "image/jpeg" && f.type !== "image/png") continue;
      next.push(f);
    }
    if (next.length === 0) {
      setFormError("Solo se permiten archivos JPG o PNG.");
      return;
    }
    setFormError(null);
    setPendingFiles((prev) => [...prev, ...next]);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="top-4 left-1/2 flex max-h-[calc(100vh-2rem)] w-[min(100vw-2rem,42rem)] max-w-2xl -translate-x-1/2 translate-y-0 flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
      >
        <div className="max-h-[inherit] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{mode === "edit" ? "Editar vehículo" : "Nuevo vehículo"}</DialogTitle>
            <DialogDescription>
              Completa los datos del inventario. Puedes elegir marca y modelo existentes o crear nuevos escribiendo el
              nombre (se guardan como categorías). Las fotos deben ser JPG o PNG.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vf-title">Título del anuncio</Label>
              <Input
                id="vf-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Mazda CX-5 Grand Touring"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Marca</Label>
                <Select
                  value={brandId}
                  onValueChange={(v) => {
                    const next = v ?? NEW_CAT;
                    setBrandId(next);
                    if (next !== NEW_CAT) setBrandName("");
                  }}
                >
                  <SelectTrigger className="w-full min-w-0">
                    <SelectValue placeholder={loadingBrands ? "Cargando…" : "Seleccionar"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NEW_CAT}>— Nueva marca —</SelectItem>
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Nombre de la marca (obligatorio si «Nueva marca»)"
                  disabled={brandId !== NEW_CAT}
                />
              </div>
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Select
                  value={modelId}
                  onValueChange={(v) => {
                    const next = v ?? NEW_CAT;
                    setModelId(next);
                    if (next !== NEW_CAT) setModelName("");
                  }}
                >
                  <SelectTrigger className="w-full min-w-0">
                    <SelectValue placeholder={loadingModels ? "Cargando…" : "Seleccionar"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NEW_CAT}>— Nuevo modelo —</SelectItem>
                    {models.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="Nombre del modelo (obligatorio si «Nuevo modelo»)"
                  disabled={modelId !== NEW_CAT}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vf-stock">Código inventario (opcional)</Label>
                <Input
                  id="vf-stock"
                  value={stockCode}
                  onChange={(e) => setStockCode(e.target.value)}
                  placeholder="Ej. INV-1042"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vf-year">Año</Label>
                <Input
                  id="vf-year"
                  type="number"
                  min={1980}
                  max={new Date().getFullYear() + 1}
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vf-km">Kilometraje (km)</Label>
                <Input
                  id="vf-km"
                  type="number"
                  min={0}
                  value={mileageKm}
                  onChange={(e) => setMileageKm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vf-color">Color</Label>
                <Input
                  id="vf-color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Ej. Blanco perlado"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Combustible</Label>
                <Select value={fuel} onValueChange={(v) => v && setFuel(v as FuelType)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FUELS.map((f) => (
                      <SelectItem key={f} value={f}>
                        {fuelLabel(f)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Transmisión</Label>
                <Select value={transmission} onValueChange={(v) => v && setTransmission(v as Transmission)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSMISSIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {transmissionLabel(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vf-price">Precio ({currency})</Label>
                <Input
                  id="vf-price"
                  type="number"
                  min={1}
                  step={1}
                  value={priceAmount}
                  onChange={(e) => setPriceAmount(e.target.value)}
                  placeholder="185000000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vf-currency">Moneda</Label>
                <Input
                  id="vf-currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  placeholder="COP"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vf-short">Resumen (opcional)</Label>
              <Input
                id="vf-short"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Una línea para listados"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vf-desc">Descripción</Label>
              <Textarea
                id="vf-desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Historial, extras, estado de pintura…"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={fileInputId}>Fotos (JPG o PNG)</Label>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  id={fileInputId}
                  type="file"
                  accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                  multiple
                  className="cursor-pointer text-sm file:mr-2 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
                  onChange={(e) => {
                    onFilesSelected(e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Puedes seleccionar varias imágenes. Se subirán al guardar.
              </p>
            </div>

            {(existingUrls.length > 0 || pendingFiles.length > 0) && (
              <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground">Imágenes del anuncio</p>
                <ul className="flex flex-wrap gap-2">
                  {existingUrls.map((url) => (
                    <li key={url} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="h-16 w-24 rounded-md border object-cover" />
                      <button
                        type="button"
                        className="absolute -right-1 -top-1 rounded-full bg-background p-0.5 shadow ring-1 ring-border"
                        onClick={() => setExistingUrls((prev) => prev.filter((u) => u !== url))}
                        aria-label="Quitar imagen"
                      >
                        <X className="size-3.5" />
                      </button>
                    </li>
                  ))}
                  {pendingFiles.map((file, idx) => (
                    <PendingImageThumb
                      key={`${file.name}-${file.size}-${idx}`}
                      file={file}
                      onRemove={() => setPendingFiles((prev) => prev.filter((_, i) => i !== idx))}
                    />
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Checkbox
                id="vf-pub"
                checked={published}
                onCheckedChange={(v) => {
                  const next = v === true;
                  setPublished(next);
                  if (!next) setFeatured(false);
                }}
              />
              <Label htmlFor="vf-pub" className="font-normal">
                Publicar en el catálogo web
              </Label>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="vf-featured"
                  checked={featured}
                  onCheckedChange={(v) => setFeatured(v === true)}
                  disabled={!published}
                />
                <Label htmlFor="vf-featured" className={cn("font-normal", !published && "text-muted-foreground")}>
                  Destacado en la página de inicio
                </Label>
              </div>
              <p className="pl-6 text-xs text-muted-foreground">
                Solo aplica a vehículos publicados. Los destacados aparecen en el carrusel y en la sección principal del
                sitio.
              </p>
            </div>

            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          </div>
        </div>

        <DialogFooter className="border-t bg-muted/40 px-4 py-3 sm:px-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={saveMutation.isPending}
            onClick={() => {
              setFormError(null);
              saveMutation.mutate();
            }}
            className="inline-flex items-center gap-2"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Guardando…
              </>
            ) : mode === "edit" ? (
              "Guardar cambios"
            ) : (
              "Guardar vehículo"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreateVehicleDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" size="sm" className="inline-flex items-center gap-2" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Nuevo vehículo
      </Button>
      <VehicleFormDialog
        mode="create"
        open={open}
        onOpenChange={setOpen}
        onSaved={() => {
          onCreated();
        }}
      />
    </>
  );
}
