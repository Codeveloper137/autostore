import { CategoryKind, FuelType, Prisma, Transmission, VehicleCondition } from "@prisma/client";

import { categorySlug } from "@/lib/slug";

export const FUELS = Object.values(FuelType);
export const TRANSMISSIONS = Object.values(Transmission);
export const CONDITIONS = Object.values(VehicleCondition);

export function parseImageUrls(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map(String).map((s) => s.trim()).filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export async function resolveCategory(
  tx: Prisma.TransactionClient,
  kind: CategoryKind,
  id: string | undefined,
  name: string | undefined,
) {
  const trimmedId = id?.trim();
  if (trimmedId) {
    const found = await tx.category.findFirst({
      where: { id: trimmedId, kind },
    });
    if (!found) {
      throw new Error(kind === CategoryKind.BRAND ? "Marca no válida." : "Modelo no válido.");
    }
    return found.id;
  }

  const n = name?.trim();
  if (!n) {
    throw new Error(
      kind === CategoryKind.BRAND
        ? "Selecciona una marca o escribe una nueva."
        : "Selecciona un modelo o escribe uno nuevo.",
    );
  }

  const existing = await tx.category.findFirst({
    where: {
      kind,
      name: { equals: n, mode: "insensitive" },
    },
  });
  if (existing) return existing.id;

  const kindKey = kind === CategoryKind.BRAND ? "BRAND" : "MODEL";
  const base = categorySlug(kindKey, n);
  for (let i = 0; i < 30; i++) {
    const slug = i === 0 ? base : `${base}-${i}`;
    try {
      const created = await tx.category.create({
        data: { name: n, slug, kind },
      });
      return created.id;
    } catch {
      continue;
    }
  }
  throw new Error("No se pudo crear la categoría (slug duplicado).");
}

export type VehiclePayload = {
  title: string;
  description: string;
  shortDescription: string | null;
  stockCode: string | null;
  year: number;
  mileageKm: number;
  color: string;
  priceAmount: number;
  currency: string;
  fuel: FuelType;
  transmission: Transmission;
  condition: VehicleCondition;
  salePriceAmount: number | null;
  published: boolean;
  featured: boolean;
  brandId: string;
  brandName: string;
  modelId: string;
  modelName: string;
  imageUrls: string[];
};

export function parseVehiclePayload(body: Record<string, unknown>): { ok: true; data: VehiclePayload } | { ok: false; error: string } {
  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  const shortDescriptionRaw = body.shortDescription != null ? String(body.shortDescription).trim() : "";
  const stockCodeRaw = body.stockCode != null ? String(body.stockCode).trim() : "";
  const year = Number(body.year);
  const mileageKm = Number(body.mileageKm);
  const color = String(body.color ?? "").trim();
  const priceAmount = Number(body.priceAmount);
  const currency = String(body.currency ?? "COP").trim() || "COP";
  const fuel = body.fuel as FuelType;
  const transmission = body.transmission as Transmission;
  const published = Boolean(body.published);
  const featured = Boolean(body.featured) && published;
  const brandId = body.brandId != null ? String(body.brandId).trim() : "";
  const brandName = body.brandName != null ? String(body.brandName) : "";
  const modelId = body.modelId != null ? String(body.modelId).trim() : "";
  const modelName = body.modelName != null ? String(body.modelName) : "";
  const imageUrls = parseImageUrls(body.imageUrls);
  const condition = (body.condition as VehicleCondition) ?? "USED";
  const salePriceRaw =
    body.salePriceAmount != null && body.salePriceAmount !== ""
      ? Number(body.salePriceAmount)
      : null;

  if (title.length < 2) {
    return { ok: false, error: "El título es obligatorio (mín. 2 caracteres)." };
  }
  if (!Number.isFinite(year) || year < 1980 || year > new Date().getFullYear() + 1) {
    return { ok: false, error: "Año no válido." };
  }
  if (!Number.isFinite(mileageKm) || mileageKm < 0) {
    return { ok: false, error: "Kilometraje no válido." };
  }
  if (!color) {
    return { ok: false, error: "El color es obligatorio." };
  }
  if (!Number.isFinite(priceAmount) || priceAmount <= 0) {
    return { ok: false, error: "El precio debe ser un número mayor que 0." };
  }
  if (!FUELS.includes(fuel)) {
    return { ok: false, error: "Tipo de combustible no válido." };
  }
  if (!TRANSMISSIONS.includes(transmission)) {
    return { ok: false, error: "Transmisión no válida." };
  }
  if (!CONDITIONS.includes(condition)) {
    return { ok: false, error: "Condición del vehículo no válida." };
  }
  if (salePriceRaw !== null) {
    if (!Number.isFinite(salePriceRaw) || salePriceRaw <= 0) {
      return { ok: false, error: "El precio de oferta debe ser mayor que 0." };
    }
    if (salePriceRaw >= priceAmount) {
      return { ok: false, error: "El precio de oferta debe ser menor al precio regular." };
    }
  }

  const stockCode = stockCodeRaw.length > 0 ? stockCodeRaw : null;
  const shortDescription = shortDescriptionRaw.length > 0 ? shortDescriptionRaw : null;

  return {
    ok: true,
    data: {
      title,
      description: description.length > 0 ? description : "Sin descripción.",
      shortDescription,
      stockCode,
      year: Math.round(year),
      mileageKm: Math.round(mileageKm),
      color,
      priceAmount: Math.round(priceAmount),
      currency,
      fuel,
      transmission,
      published,
      featured,
      brandId,
      brandName,
      modelId,
      modelName,
      imageUrls,
      condition, 
      salePriceAmount: salePriceRaw !== null ? Math.round(salePriceRaw) : null,
    },
  };
}
