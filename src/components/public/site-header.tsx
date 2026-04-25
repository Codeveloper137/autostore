import Link from "next/link";

import { auth } from "@/auth";
import { AuthNav } from "@/components/public/auth-nav";
import { MobileMenu } from "@/components/public/mobile-menu";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/vehiculos", label: "Catálogo" },
  { href: "/blogs", label: "Blog" },
  { href: "/sobre-nosotros", label: "Nosotros" },
  { href: "/#contacto", label: "Contacto" },
];

export async function SiteHeader() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="font-heading text-sm font-semibold tracking-tight sm:text-base">
          Auto Store Motors
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
          {isAdmin ? (
            <Link
              href="/admin/inventory"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Administración
            </Link>
          ) : null}
          <AuthNav session={session} />
        </nav>

        {/* Hamburguesa móvil — client component */}
        <div className="flex items-center gap-2 md:hidden">
          <AuthNav session={session} />
          <MobileMenu links={links} isAdmin={isAdmin} />
        </div>
      </div>
    </header>
  );
}