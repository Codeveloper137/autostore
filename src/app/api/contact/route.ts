import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/infrastructure/persistence/prisma";
import { rateLimit } from "@/lib/rate-limit";



export async function POST(req: Request) {
    // Obtener IP del cliente
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  // 5 mensajes por IP cada 15 minutos
  const { allowed, resetIn } = rateLimit(`contact:${ip}`, 5, 15 * 60 * 1000);

  if (!allowed) {
    const minutesLeft = Math.ceil(resetIn / 60_000);
    return NextResponse.json(
      {
        error: `Has enviado demasiados mensajes. Intenta de nuevo en ${minutesLeft} minuto${minutesLeft === 1 ? "" : "s"}.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(resetIn / 1000)) },
      },
    );
  }

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