import { NextResponse } from "next/server";
import { AnalyticsEventType } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/infrastructure/persistence/prisma";

const VALID = Object.values(AnalyticsEventType);

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { type?: string; vehicleId?: string; path?: string };
    const type = body.type as AnalyticsEventType;
    if (!VALID.includes(type)) return NextResponse.json({ ok: false }, { status: 400 });
    const session = await auth();
    await prisma.analyticsEvent.create({
      data: { type, path: body.path ?? null, vehicleId: body.vehicleId ?? null, userId: session?.user?.id ?? null },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}