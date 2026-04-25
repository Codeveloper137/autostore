import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/infrastructure/persistence/prisma";

// Definimos el tipo esperando 'slug' porque renombramos la carpeta a [slug]
type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // CORREGIDO: Usamos findFirst porque buscamos por slug Y status
  const post = await prisma.contentPage.findFirst({ 
    where: { 
      slug: slug, 
      status: "PUBLISHED" 
    }, 
    select: { title: true, excerpt: true } 
  });

  if (!post) return { title: "No encontrado" };
  return { title: post.title, description: post.excerpt ?? "" };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  
  // Debug: Verifica si el slug llega correctamente
  console.log("Slug capturado de la URL:", slug);

  // CORREGIDO: Usamos findFirst para evitar el error de validación de Prisma
  const post = await prisma.contentPage.findFirst({ 
    where: { 
      slug: slug, 
      status: "PUBLISHED" 
    } 
  });
  
  // Si no encuentra nada, lanzamos notFound()
  if (!post) {
    console.log("Post no encontrado en BD para el slug:", slug);
    notFound();
  }
  
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-6 text-sm text-muted-foreground">
        <Link href="/blogs" className="hover:text-foreground">← Volver al Blog</Link>
      </div>
      <article>
        <header className="mb-8 space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {post.title}
          </h1>
          {post.excerpt ? <p className="text-lg text-muted-foreground">{post.excerpt}</p> : null}
          {post.publishedAt ? (
            <p className="text-xs text-muted-foreground">
              {new Date(post.publishedAt).toLocaleDateString("es-CO", { 
                day: "2-digit", 
                month: "long", 
                year: "numeric" 
              })}
            </p>
          ) : null}
        </header>
        <div
          className="prose prose-sm max-w-none text-foreground dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />
      </article>
    </div>
  );
}