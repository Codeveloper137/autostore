import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/infrastructure/persistence/prisma";
import { prismaQueryErrorResponse } from "@/lib/prisma-api-error";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  try {
    const messages = await prisma.quote.findMany({
      orderBy: { createdAt: "desc" },
      take: 300,
      include: {
        user: { select: { id: true, name: true, email: true } },
        vehicle: { select: { id: true, title: true } },
      },
    });
    return NextResponse.json(messages);
  } catch (error) {
    return prismaQueryErrorResponse("[GET /api/admin/messages]", error);
  }
}