import { NextResponse } from "next/server";

import { prisma } from "@/infrastructure/persistence/prisma";

export const dynamic = "force-dynamic";

const MAX_LEN = 8000;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const fullName = String(body.fullName ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = body.phone != null ? String(body.phone).trim() : "";
  const message = String(body.message ?? "").trim();
  const vehicleId = body.vehicleId != null ? String(body.vehicleId).trim() : "";

  if (fullName.length < 2) {
    return NextResponse.json({ error: "Indica tu nombre completo." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Correo electrónico no válido." }, { status: 400 });
  }
  if (message.length < 10) {
    return NextResponse.json({ error: "El mensaje debe tener al menos 10 caracteres." }, { status: 400 });
  }
  if (message.length > MAX_LEN) {
    return NextResponse.json({ error: "El mensaje es demasiado largo." }, { status: 400 });
  }

  let linkedVehicleId: string | null = null;
  if (vehicleId) {
    const v = await prisma.vehicle.findFirst({
      where: { id: vehicleId, published: true },
      select: { id: true },
    });
    linkedVehicleId = v?.id ?? null;
  }

  try {
    await prisma.quote.create({
      data: {
        fullName,
        email,
        phone: phone.length > 0 ? phone : null,
        message,
        vehicleId: linkedVehicleId,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[POST /api/contact]", e);
    return NextResponse.json({ error: "No se pudo enviar el mensaje. Intenta más tarde." }, { status: 503 });
  }
}
