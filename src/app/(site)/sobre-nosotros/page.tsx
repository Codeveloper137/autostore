import type { Metadata } from "next";
import Link from "next/link";

import { ImageCarousel } from "@/components/public/image-carousel";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/infrastructure/persistence/prisma";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sobre nosotros",
  description: "Conoce la historia y el equipo de Auto Store Motors.",
};

export const revalidate = 60;

export default async function SobreNosotrosPage() {
  // Leer imágenes del carrusel desde la DB
  let carouselImages: string[] = [];
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "about_carousel_images" },
    });
    if (setting) carouselImages = JSON.parse(setting.value) as string[];
  } catch {
    carouselImages = [];
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      {/* Hero */}
      <div className="mb-14 max-w-2xl space-y-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Quiénes somos
        </p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          Auto Store Motors
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Somos un concesionario de vehículos nuevos y usados comprometido con la transparencia,
          la calidad y el acompañamiento personalizado en cada etapa de tu compra.
        </p>
      </div>

      {/* Carrusel de imágenes (solo si hay imágenes configuradas) */}
      {carouselImages.length > 0 ? (
        <div className="mb-14">
          <ImageCarousel images={carouselImages} className="shadow-sm" />
        </div>
      ) : null}

      {/* Misión, Visión y Valores */}
      <div className="mb-14 grid gap-8 sm:grid-cols-3">
        {[
          {
            title: "Nuestra misión",
            body: "Facilitar el acceso a vehículos de calidad con asesoría honesta, precios claros y un proceso de compra sin sorpresas.",
          },
          {
            title: "Nuestra visión",
            body: "Ser el concesionario de referencia en la región, reconocido por la confianza que depositamos en cada cliente.",
          },
          {
            title: "Nuestros valores",
            body: "Transparencia, respeto, compromiso y pasión por los vehículos. Cada unidad en nuestro inventario ha sido verificada.",
          },
        ].map((item) => (
          <div key={item.title} className="space-y-2">
            <h2 className="font-heading text-lg font-semibold">{item.title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>

      {/* Por qué elegirnos */}
      <div className="mb-14 rounded-2xl border border-border bg-muted/30 p-8">
        <h2 className="mb-6 font-heading text-2xl font-semibold tracking-tight">
          ¿Por qué elegir Auto Store Motors?
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {[
            "Inventario verificado y fotografiado con imágenes reales.",
            "Precios publicados sin letra pequeña ni costos ocultos.",
            "Atención personalizada de lunes a sábado.",
            "Asesoría en trámites de traspaso y financiamiento.",
            "Posibilidad de agendar prueba de manejo.",
            "Historial de mantenimiento disponible en unidades seleccionadas.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-foreground" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Horario y contacto */}
      <div className="mb-14 grid gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <h2 className="font-heading text-lg font-semibold">Horario de atención</h2>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li className="flex justify-between">
              <span>Lunes a viernes</span>
              <span>9:00 a.m. – 6:00 p.m.</span>
            </li>
            <li className="flex justify-between">
              <span>Sábados</span>
              <span>9:00 a.m. – 2:00 p.m.</span>
            </li>
            <li className="flex justify-between">
              <span>Domingos y festivos</span>
              <span>Cerrado</span>
            </li>
          </ul>
        </div>
        <div className="space-y-3">
          <h2 className="font-heading text-lg font-semibold">Contáctanos</h2>
          <p className="text-sm text-muted-foreground">
            Escríbenos desde el formulario de contacto o por WhatsApp si tienes el número
            configurado. Respondemos en menos de 24 horas hábiles.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/vehiculos"
          className={cn(buttonVariants({ size: "lg" }), "min-w-45 justify-center")}
        >
          Ver catálogo
        </Link>
        <Link
          href="/#contacto"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "min-w-45 justify-center")}
        >
          Contactar
        </Link>
      </div>
    </div>
  );
}