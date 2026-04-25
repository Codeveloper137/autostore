import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/persistence/prisma";

export const revalidate = 60;

export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "about_carousel_images" },
    });
    const images: string[] = setting ? (JSON.parse(setting.value) as string[]) : [];
    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ images: [] });
  }
}