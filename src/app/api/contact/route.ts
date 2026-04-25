import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/infrastructure/persistence/prisma";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!fullName || fullName.length < 2) return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Correo no válido." }, { status: 400 });
  if (!message || message.length < 5) return NextResponse.json({ error: "El mensaje es demasiado corto." }, { status: 400 });

  const session = await auth();
  try {
    await prisma.quote.create({
      data: { fullName, email, phone: phone || null, message, userId: session?.user?.id ?? null },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo guardar el mensaje." }, { status: 500 });
  }
}