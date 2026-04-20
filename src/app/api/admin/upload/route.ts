import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

import { NextResponse } from "next/server";

import { auth } from "@/auth";

export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
]);

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Formulario inválido" }, { status: 400 });
  }

  const files = formData.getAll("files").filter((e): e is File => e instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "No se enviaron archivos." }, { status: 400 });
  }
  if (files.length > 20) {
    return NextResponse.json({ error: "Máximo 20 archivos por solicitud." }, { status: 400 });
  }

  const dir = join(process.cwd(), "public", "uploads", "vehicles");
  await mkdir(dir, { recursive: true });

  const urls: string[] = [];

  for (const file of files) {
    if (!file.size) continue;
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `El archivo «${file.name}» supera el tamaño máximo de 5 MB.` },
        { status: 400 },
      );
    }
    const ext = ALLOWED.get(file.type);
    if (!ext) {
      return NextResponse.json(
        { error: `Tipo no permitido: ${file.type}. Solo JPG o PNG.` },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const name = `${randomUUID()}.${ext}`;
    const diskPath = join(dir, name);
    await writeFile(diskPath, buffer);
    urls.push(`/uploads/vehicles/${name}`);
  }

  if (urls.length === 0) {
    return NextResponse.json({ error: "No se pudieron procesar los archivos." }, { status: 400 });
  }

  return NextResponse.json({ urls });
}
