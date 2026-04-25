import { ContentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/infrastructure/persistence/prisma";
import { prismaQueryErrorResponse } from "@/lib/prisma-api-error";
import { slugify } from "@/lib/slug";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: Ctx) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await context.params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  if (typeof body.title === "string") data.title = body.title.trim();
  if (typeof body.slug === "string" && body.slug.trim()) {
  data.slug = slugify(body.slug.trim());
}
  if (typeof body.excerpt === "string") data.excerpt = body.excerpt.trim() || null;
  if (typeof body.body === "string") data.body = body.body;
  if (typeof body.coverImageUrl === "string") data.coverImageUrl = body.coverImageUrl.trim() || null;

  if (body.status === "PUBLISHED") { data.status = ContentStatus.PUBLISHED; data.publishedAt = new Date(); }
  if (body.status === "DRAFT") data.status = ContentStatus.DRAFT;
  try {
    const page = await prisma.contentPage.update({ where: { id }, data });
    return NextResponse.json(page);
  } catch (error) { return prismaQueryErrorResponse("[PATCH /api/admin/cms/[id]]", error); }
}

export async function DELETE(_req: Request, context: Ctx) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await context.params;
  try {
    await prisma.contentPage.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) { return prismaQueryErrorResponse("[DELETE /api/admin/cms/[id]]", error); }
}