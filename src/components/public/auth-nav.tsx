"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AuthNav({ session }: { session: Session | null }) {
  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden max-w-40 truncate text-sm text-muted-foreground sm:block">
          {session.user.name ?? session.user.email}
        </span>
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/" })}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-muted-foreground hover:text-foreground",
          )}
        >
          Salir
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "text-muted-foreground hover:text-foreground",
        )}
      >
        Entrar
      </Link>
      <Link
        href="/register"
        className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}
      >
        Crear cuenta
      </Link>
    </div>
  );
}