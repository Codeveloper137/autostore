import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/infrastructure/persistence/prisma";

const SETTING_KEY = "about_carousel_images";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: SETTING_KEY } });
    const images: string[] = setting ? (JSON.parse(setting.value) as string[]) : [];
    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ images: [] });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { images?: unknown };
  if (!Array.isArray(body.images)) {
    return NextResponse.json({ error: "images debe ser un array." }, { status: 400 });
  }

  const images = body.images.filter((u): u is string => typeof u === "string" && u.trim().length > 0);

  await prisma.siteSetting.upsert({
    where: { key: SETTING_KEY },
    create: { key: SETTING_KEY, value: JSON.stringify(images) },
    update: { value: JSON.stringify(images) },
  });

  return NextResponse.json({ images });
}