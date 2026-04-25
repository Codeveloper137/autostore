"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import { AdminSignOut } from "@/components/admin/admin-sign-out";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin/dashboard", label: "Panel de control" },
  { href: "/admin/inventory", label: "Inventario" },
  { href: "/admin/users", label: "Usuarios" },
  { href: "/admin/messages", label: "Mensajes" },
  { href: "/admin/analytics", label: "Analíticas" },
  { href: "/admin/cms", label: "Blog / CMS" },
  { href: "/admin/about", label: "Sobre nosotros" },
];

function NavItem({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "justify-start",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      {label}
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Administración
          </span>
          <span className="font-heading text-sm font-semibold tracking-tight">
            Auto Store Motors
          </span>
        </div>
      </div>
      <nav className="flex flex-col gap-0.5 p-3">
        {nav.map((item) => (
          <NavItem key={item.href} href={item.href} label={item.label} onClick={onNavigate} />
        ))}
      </nav>
      <div className="mt-auto border-t border-sidebar-border p-3">
        <AdminSignOut />
      </div>
    </>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Cerrar al navegar
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen w-full bg-muted/40">

      {/* Sidebar desktop */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground md:flex md:h-screen md:min-h-screen md:flex-col md:sticky md:top-0">
        <SidebarContent />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header móvil con hamburguesa */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur md:hidden">
          <span className="font-heading text-sm font-semibold">Panel admin</span>
          <button
            type="button"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </header>

        {/* Drawer móvil */}
        {mobileOpen ? (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              aria-hidden
              onClick={() => setMobileOpen(false)}
            />
            {/* Panel */}
            <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto bg-sidebar text-sidebar-foreground shadow-xl md:hidden">
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </aside>
          </>
        ) : null}

        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}