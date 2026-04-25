import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

import { auth } from "@/auth";
import { prisma } from "@/infrastructure/persistence/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = (await req.json().catch(() => ({}))) as { subject?: string; replyText?: string };

  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const replyText = typeof body.replyText === "string" ? body.replyText.trim() : "";

  if (!replyText) {
    return NextResponse.json({ error: "El mensaje de respuesta no puede estar vacío." }, { status: 400 });
  }

  // Obtener el mensaje original
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { user: { select: { name: true } } },
  });

  if (!quote) {
    return NextResponse.json({ error: "Mensaje no encontrado." }, { status: 404 });
  }

  // Verificar configuración SMTP
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return NextResponse.json(
      { error: "El servidor de correo no está configurado. Revisa las variables SMTP_* en .env." },
      { status: 503 },
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
      to: quote.email,
      subject: subject || `Re: Tu consulta en Auto Store Motors`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <p>Hola${quote.fullName ? `, <strong>${quote.fullName}</strong>` : ""}:</p>
          <div style="white-space: pre-wrap; line-height: 1.6;">${replyText.replace(/\n/g, "<br>")}</div>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="font-size: 12px; color: #6b7280;">
            Este correo es una respuesta a tu consulta enviada el
            ${new Date(quote.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}.
          </p>
          <p style="font-size: 12px; color: #6b7280;">
            <strong>Auto Store Motors</strong> — Concesionario de vehículos
          </p>
        </div>
      `,
      // Adjuntar mensaje original como texto en reply
      text: `${replyText}\n\n---\nMensaje original de ${quote.fullName}:\n${quote.message}`,
    });

    // Actualizar estado a IN_PROGRESS si estaba PENDING
    if (quote.status === "PENDING") {
      await prisma.quote.update({ where: { id }, data: { status: "IN_PROGRESS" } });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error desconocido";
    console.error("[POST /api/admin/messages/[id]/reply]", error);
    return NextResponse.json(
      { error: `No se pudo enviar el correo: ${msg}` },
      { status: 500 },
    );
  }
}