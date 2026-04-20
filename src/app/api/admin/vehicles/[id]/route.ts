import { CategoryKind } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/infrastructure/persistence/prisma";
import { parseVehiclePayload, resolveCategory } from "@/server/admin-vehicle-mutations";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Vehículo no encontrado." }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = parseVehiclePayload(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const d = parsed.data;

  try {
    const vehicle = await prisma.$transaction(async (tx) => {
      const bId = await resolveCategory(
        tx,
        CategoryKind.BRAND,
        d.brandId || undefined,
        d.brandName || undefined,
      );
      const mId = await resolveCategory(
        tx,
        CategoryKind.MODEL,
        d.modelId || undefined,
        d.modelName || undefined,
      );

      return tx.vehicle.update({
        where: { id },
        data: {
          title: d.title,
          description: d.description,
          shortDescription: d.shortDescription,
          stockCode: d.stockCode,
          brandId: bId,
          modelId: mId,
          year: d.year,
          mileageKm: d.mileageKm,
          color: d.color,
          fuel: d.fuel,
          transmission: d.transmission,
          priceAmount: d.priceAmount,
          currency: d.currency,
          imageUrls: d.imageUrls,
          published: d.published,
          featured: d.featured,
        },
        include: { brand: true, model: true },
      });
    });

    return NextResponse.json(vehicle);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al actualizar el vehículo.";
    console.error("[PATCH /api/admin/vehicles/[id]]", e);
    if (message.includes("Unique constraint") || message.includes("stockCode")) {
      return NextResponse.json(
        { error: "Ya existe un vehículo con ese código de inventario." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
