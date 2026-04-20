import { CategoryKind } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/infrastructure/persistence/prisma";
import { prismaQueryErrorResponse } from "@/lib/prisma-api-error";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const raw = new URL(req.url).searchParams.get("kind");
  const kind = raw === "BRAND" ? CategoryKind.BRAND : raw === "MODEL" ? CategoryKind.MODEL : null;
  if (!kind) {
    return NextResponse.json({ error: "Usa ?kind=BRAND o ?kind=MODEL" }, { status: 400 });
  }

  try {
    const categories = await prisma.category.findMany({
      where: { kind },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    });
    return NextResponse.json(categories);
  } catch (e) {
    return prismaQueryErrorResponse("[GET /api/admin/categories]", e);
  }
}
