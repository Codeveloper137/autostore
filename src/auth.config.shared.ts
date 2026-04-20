import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

/**
 * Fragmento compartido entre la instancia Node (login + API) y Edge (middleware).
 * Sin Prisma: no importar `@/infrastructure/persistence/prisma` desde aquí.
 */
export const sharedAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  /// Placeholder; cada instancia (`auth.ts` / `auth.edge.ts`) define los proveedores reales.
  providers: [],
  callbacks: {
    authorized({ request, auth }) {
      const path = request.nextUrl.pathname;
      if (!path.startsWith("/admin")) return true;
      if (!auth?.user) return false;
      if (auth.user.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", request.nextUrl));
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
