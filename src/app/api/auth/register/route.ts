import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/infrastructure/persistence/prisma";

import { rateLimit } from "@/lib/rate-limit";


export async function POST(req: Request) {

  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  // 3 intentos de registro por IP cada hora
  const { allowed, resetIn } = rateLimit(`register:${ip}`, 3, 60 * 60 * 1000);

  if (!allowed) {
    const minutesLeft = Math.ceil(resetIn / 60_000);
    return NextResponse.json(
      { error: `Demasiados intentos. Intenta de nuevo en ${minutesLeft} minuto${minutesLeft === 1 ? "" : "s"}.` },
      { status: 429 },
    );
  }


  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Correo electrónico no válido." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 8 caracteres." },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Ya existe una cuenta con ese correo electrónico." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name: name.length > 0 ? name : null,
      email,
      passwordHash,
      // role CLIENT es el default en el schema
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}