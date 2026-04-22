import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Acceso al panel administrativo",
};

function LoginFormFallback() {
  return (
    <div className="heigth: 320px w-full max-w-md animate-pulse rounded-xl border border-border bg-muted/40" />
  );
}

const googleEnabled =
  Boolean(process.env.AUTH_GOOGLE_ID?.length) &&
  Boolean(process.env.AUTH_GOOGLE_SECRET?.length);

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm googleEnabled={googleEnabled} />
      </Suspense>
    </div>
  );
}
