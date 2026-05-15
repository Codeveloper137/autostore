import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/infrastructure/persistence/prisma";
import { prismaQueryErrorResponse } from "@/lib/prisma-api-error";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  if (id === session.user.id && (body.banned != null || body.archived != null)) {
    return NextResponse.json({ error: "No puedes modificar tu propia cuenta así." }, { status: 400 });
  }

  try {
    const data: Record<string, unknown> = {};
    if (typeof body.banned === "boolean") data.bannedAt = body.banned ? new Date() : null;
    if (typeof body.archived === "boolean") data.archivedAt = body.archived ? new Date() : null;
    if (body.role === "ADMIN" || body.role === "CLIENT") data.role = body.role;

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, bannedAt: true, archivedAt: true },
    });
    return NextResponse.json(user);
  } catch (error) {
    return prismaQueryErrorResponse("[PATCH /api/admin/users/[id]]", error);
  }
}