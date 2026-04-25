import { NextResponse } from "next/server";
import { QuoteStatus } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/infrastructure/persistence/prisma";
import { prismaQueryErrorResponse } from "@/lib/prisma-api-error";

type Ctx = { params: Promise<{ id: string }> };
const VALID = Object.values(QuoteStatus);

export async function PATCH(req: Request, context: Ctx) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await context.params;
  const body = (await req.json().catch(() => ({}))) as { status?: string };
  if (!body.status || !VALID.includes(body.status as QuoteStatus)) return NextResponse.json({ error: "Estado no válido." }, { status: 400 });
  try {
    const q = await prisma.quote.update({ where: { id }, data: { status: body.status as QuoteStatus } });
    return NextResponse.json(q);
  } catch (error) {
    return prismaQueryErrorResponse("[PATCH /api/admin/messages/[id]]", error);
  }
}