"use client";

import { MessageCircle } from "lucide-react";

import { buildWhatsAppLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const DEFAULT_MESSAGE =
  "Hola, me gustaría recibir más información sobre los vehículos disponibles en Auto Store Motors.";

export function FloatingWhatsApp({ className }: { className?: string }) {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const href = raw ? buildWhatsAppLink(raw, DEFAULT_MESSAGE) : null;
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-2 ring-white/30 transition hover:scale-105 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="size-7" aria-hidden />
    </a>
  );
}
