
import { NextResponse } from "next/server";

import { v2 as cloudinary } from 'cloudinary';

import { auth } from "@/auth";

export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png"]);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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


  const urls: string[] = [];

  for (const file of files) {
    if (!file.size) continue;
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `El archivo «${file.name}» supera el tamaño máximo de 5 MB.` },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {

      return NextResponse.json(
        { error: `Tipo no permitido: ${file.type}. Solo JPG o PNG.` },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Subir a Cloudinary como stream desde buffer
    const url = await new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "autostore/vehicles",   // carpeta en tu cuenta Cloudinary
          resource_type: "image",
          // Cloudinary genera el public_id automáticamente (UUID interno)
        },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error("Upload fallido"));
          resolve(result.secure_url);     // URL https permanente con CDN
        },
      );
      stream.end(buffer);
    });

    urls.push(url);

  }

  if (urls.length === 0) {
    return NextResponse.json({ error: "No se pudieron procesar los archivos." }, { status: 400 });
  }

  return NextResponse.json({ urls });
}
