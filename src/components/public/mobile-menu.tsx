"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  links: { href: string; label: string }[];
  isAdmin: boolean;
};

export function MobileMenu({ links, isAdmin }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Cierra el menú cuando se navega
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Cierra con Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Bloquea scroll del body cuando está abierto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Botón hamburguesa */}
      <button
        type="button"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "relative z-50",
        )}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {/* Overlay + menú de pantalla completa */}
      {open ? (
        <>
          {/* Backdrop — click fuera cierra */}
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            aria-hidden
            onClick={() => setOpen(false)}
          />

          {/* Panel del menú */}
          <nav
            className="fixed inset-x-0 top-14 z-40 flex h-[calc(100dvh-3.5rem)] flex-col overflow-y-auto bg-background px-6 pb-8 pt-6"
            aria-label="Menú principal"
          >
            <ul className="flex flex-col gap-1">
              {links.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center rounded-lg px-3 py-3 text-base font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {isAdmin ? (
                <li>
                  <Link
                    href="/admin/inventory"
                    className="flex items-center rounded-lg px-3 py-3 text-base font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    Administración
                  </Link>
                </li>
              ) : null}
            </ul>
          </nav>
        </>
      ) : null}
    </>
  );
}