import Link from "next/link";

import { AdminSignOut } from "@/components/admin/admin-sign-out";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";


const nav = [
  { href: "/admin/inventory", label: "Inventario" },
  { href: "/admin/users", label: "Usuarios" },
];


export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground md:flex md:h-screen md:min-h-screen md:flex-col md:sticky md:top-0">
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
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-sidebar-border p-3">
          <AdminSignOut />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center border-b border-border bg-background/80 px-4 backdrop-blur md:hidden">
          <span className="text-sm font-semibold">Panel admin</span>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
