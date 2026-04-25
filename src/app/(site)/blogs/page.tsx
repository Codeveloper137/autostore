import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/infrastructure/persistence/prisma";

export const metadata: Metadata = {
  title: "Blog y noticias",
  description: "Novedades y artículos de Auto Store Motors.",
};

export const revalidate = 60;

export default async function BlogsPage() {
  const posts = await prisma.contentPage.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true, slug: true, title: true,
      excerpt: true, publishedAt: true, coverImageUrl: true,
    },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-10 space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Blog</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Noticias y artículos</h1>
        <p className="text-sm text-muted-foreground">Lo más reciente de Auto Store Motors.</p>
      </div>

      {posts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center text-sm text-muted-foreground">
          Aún no hay publicaciones.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.id} href={`/blogs/${p.slug}`} className="group block">
              <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
                {/* Imagen de portada */}
                <div className="relative aspect-video overflow-hidden bg-muted">
                  {p.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.coverImageUrl}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-muted to-muted-foreground/10">
                      <p className="text-xs text-muted-foreground">Sin imagen de portada</p>
                    </div>
                  )}
                </div>
                {/* Contenido */}
                <div className="p-5">
                  {p.publishedAt ? (
                    <p className="mb-2 text-xs tabular-nums text-muted-foreground">
                      {new Date(p.publishedAt).toLocaleDateString("es-CO", {
                        day: "2-digit", month: "long", year: "numeric",
                      })}
                    </p>
                  ) : null}
                  <h2 className="font-heading text-lg font-semibold leading-snug tracking-tight group-hover:text-primary">
                    {p.title}
                  </h2>
                  {p.excerpt ? (
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
                  ) : null}
                  <p className="mt-4 text-sm font-medium text-primary">Leer más →</p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}