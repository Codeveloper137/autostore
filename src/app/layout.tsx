import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";

import "../app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Auto Store Motors",
    template: "%s · Auto Store Motors",
  },
  description: "Concesionario de vehículos — catálogo, cotizaciones y administración.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      {/* Añadimos overflow-x-hidden al body para matar el scroll horizontal de raíz */}
      <body 
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen w-full overflow-x-hidden bg-background antialiased selection:bg-red-100 selection:text-red-900`}
      >
        <AppProviders>
          <div className="relative flex min-h-screen flex-col">
            {/* El wrapper principal asegura que el contenido respete el ancho de pantalla */}
            <main className="flex-1">
              {children}
            </main>
          </div>
        </AppProviders>


        {/* Componentes Globales */}
        <FloatingWhatsApp />
      </body>
    </html>
  );
}