import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";


import { auth } from "@/auth";
import { prisma } from "@/infrastructure/persistence/prisma";
import { prismaQueryErrorResponse } from "@/lib/prisma-api-error";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    // Usar select explícito — NUNCA incluir passwordHash
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        bannedAt: true,
        archivedAt: true,
        accounts: { select: { provider: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return NextResponse.json(users);
  } catch (error) {
    return prismaQueryErrorResponse("[GET /api/admin/users]", error);
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role = body.role === "ADMIN" ? "ADMIN" : "CLIENT";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Correo no válido." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Contraseña mínimo 8 caracteres." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese correo." }, { status: 409 });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name: name || null, email, passwordHash, role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return prismaQueryErrorResponse("[POST /api/admin/users]", error);
  }
}