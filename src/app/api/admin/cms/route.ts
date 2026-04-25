import { ContentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/infrastructure/persistence/prisma";
import { prismaQueryErrorResponse } from "@/lib/prisma-api-error";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  try {
    const pages = await prisma.contentPage.findMany({ orderBy: { updatedAt: "desc" }, take: 200 });
    return NextResponse.json(pages);
  } catch (error) { return prismaQueryErrorResponse("[GET /api/admin/cms]", error); }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim() : "";
  const bodyContent = typeof body.body === "string" ? body.body : "";
  const status = body.status === "PUBLISHED" ? ContentStatus.PUBLISHED : ContentStatus.DRAFT;
  const customSlug = typeof body.slug === "string" ? body.slug.trim() : "";
  const coverImageUrl = typeof body.coverImageUrl === "string" ? body.coverImageUrl.trim() : "";


  if (title.length < 2) return NextResponse.json({ error: "El título es obligatorio." }, { status: 400 });

  // Siempre pasar el slug por slugify, incluso si es personalizado
  const baseSlug = customSlug ? slugify(customSlug) : slugify(title);

  let slug = baseSlug;
  for (let i = 1; i < 30; i++) {
    const ex = await prisma.contentPage.findUnique({ where: { slug } });
    if (!ex) break;
    slug = `${baseSlug}-${i}`;
  }

  try {
    const page = await prisma.contentPage.create({
      data: { 
        title, 
        slug, 
        excerpt: excerpt || null, 
        body: bodyContent, 
        coverImageUrl: coverImageUrl || null, 
        status, 
        publishedAt: status === ContentStatus.PUBLISHED ? new Date() : null },
    });
    return NextResponse.json(page, { status: 201 });
  } catch (error) { return prismaQueryErrorResponse("[POST /api/admin/cms]", error); }
}