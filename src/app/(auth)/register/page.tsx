import type { Metadata } from "next";
import { Suspense } from "react";

import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Regístrate en Auto Store Motors",
};

export default function RegisterPage() {
  const googleEnabled =
    Boolean(process.env.AUTH_GOOGLE_ID?.length) &&
    Boolean(process.env.AUTH_GOOGLE_SECRET?.length);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <Suspense
        fallback={
          <div className="h-120 w-full max-w-md animate-pulse rounded-xl border border-border bg-muted/40" />
        }
      >
        <RegisterForm googleEnabled={googleEnabled} />
      </Suspense>
    </div>
  );
}