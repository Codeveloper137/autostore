import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { sharedAuthConfig } from "@/auth.config.shared";
import { getAuthSecret } from "@/lib/auth-secret";

const googleConfigured =
  Boolean(process.env.AUTH_GOOGLE_ID?.length) && Boolean(process.env.AUTH_GOOGLE_SECRET?.length);

/**
 * Sin Prisma / sin adaptador: solo para Middleware (Edge) y validación JWT.
 */
export const { auth: authEdge } = NextAuth({
  ...sharedAuthConfig,
  secret: getAuthSecret(),
  providers: [
    ...(googleConfigured
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
          }),
        ]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async () => null,
    }),
  ],
  callbacks: {
    ...sharedAuthConfig.callbacks,
    async jwt({ token }) {
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "ADMIN" | "CLIENT") ?? "CLIENT";
      }
      return session;
    },
  },
});
