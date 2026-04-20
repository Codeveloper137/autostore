"use client";

import { signOut, useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function AdminSignOut() {
  const { status } = useSession();

  if (status !== "authenticated") {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => void signOut({ callbackUrl: "/" })}
    >
      Cerrar sesión
    </Button>
  );
}
