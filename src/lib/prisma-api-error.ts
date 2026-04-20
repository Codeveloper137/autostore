import { NextResponse } from "next/server";

/**
 * Respuesta JSON uniforme cuando una consulta Prisma falla (conexión, migraciones, etc.).
 */
export function prismaQueryErrorResponse(logLabel: string, error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  const lower = msg.toLowerCase();

  console.error(logLabel, error);

  const connection =
    msg.includes("P1001") ||
    msg.includes("Can't reach database server") ||
    lower.includes("econnrefused") ||
    lower.includes("enotfound") ||
    lower.includes("getaddrinfo");

  const schema =
    msg.includes("P2022") ||
    (lower.includes("column") && (lower.includes("does not exist") || lower.includes("unknown column"))) ||
    lower.includes("no existe la columna") ||
    (lower.includes("relation") && lower.includes("does not exist"));

  let errorUser =
    "Error al consultar la base de datos. Revisa DATABASE_URL y que PostgreSQL esté disponible.";
  if (connection) {
    errorUser =
      "No se pudo conectar a PostgreSQL. Comprueba que el servicio esté en marcha y que DATABASE_URL en .env sea correcta (host, puerto, usuario y contraseña).";
  } else if (schema) {
    errorUser =
      "La base de datos no tiene las columnas/tablas esperadas. Ejecuta las migraciones: npx prisma migrate dev (o npx prisma db push) y reinicia el servidor de desarrollo.";
  }

  return NextResponse.json(
    {
      error: errorUser,
      code: connection ? "DB_CONNECTION" : schema ? "DB_SCHEMA" : "DB_QUERY",
      ...(process.env.NODE_ENV === "development" ? { details: msg } : {}),
    },
    { status: 503 },
  );
}
