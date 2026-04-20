# Auto Store Motors (AutoStore)

Plataforma web del concesionario construida con **Next.js 15** (App Router), **PostgreSQL**, **Prisma**, **Auth.js (NextAuth v5)** y **Tailwind + shadcn/ui**.

---

## Requisitos previos

| Herramienta | Uso |
|-------------|-----|
| **Node.js** | Versión **20 LTS** o superior (recomendado). |
| **npm** | Viene con Node; el proyecto usa `package-lock.json`. |
| **PostgreSQL** | Base de datos obligatoria para Prisma (local o remota). |

Opcional: cuenta de **Google Cloud** (OAuth) si quieres iniciar sesión con Google.

---

## Cómo correr el proyecto en local (paso a paso)

### 1. Obtener el código e instalar dependencias

En la carpeta del repositorio:

```bash
npm install
```

### 2. Crear la base de datos PostgreSQL

Crea una base vacía (por ejemplo `autostore`) en tu instancia local de PostgreSQL. Anota **usuario**, **contraseña**, **host**, **puerto** y **nombre de la base**.

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y edítalo:

```bash
copy .env.example .env
```

En Windows PowerShell puedes usar `Copy-Item .env.example .env`. En macOS/Linux: `cp .env.example .env`.

Abre `.env` y completa como mínimo:

- **`DATABASE_URL`**: cadena de conexión Prisma, por ejemplo  
  `postgresql://USUARIO:CONTRASEÑA@localhost:5432/autostore?schema=public`
- **`AUTH_SECRET`** (y opcionalmente **`NEXTAUTH_SECRET`** con el mismo valor): secreto para firmar sesiones. Puedes generar uno seguro con:
  - OpenSSL: `openssl rand -base64 32`
- **`AUTH_URL`** y **`NEXTAUTH_URL`**: en local suele ser `http://localhost:3000` (debe coincidir con la URL donde corre Next.js).

Google OAuth es **opcional**: si dejas `AUTH_GOOGLE_ID` y `AUTH_GOOGLE_SECRET` vacíos, solo funcionará el inicio de sesión por **correo y contraseña** (credentials).

### 4. Aplicar migraciones de base de datos

Aplica el esquema Prisma a PostgreSQL:

```bash
npx prisma migrate deploy
```

En desarrollo, si prefieres crear migraciones nuevas mientras cambias el esquema, puedes usar:

```bash
npm run db:migrate
```

### 5. (Recomendado) Crear el primer usuario administrador

El script de semilla crea o actualiza un usuario con rol **ADMIN** (contraseña hasheada con bcrypt):

```bash
npm run db:seed
```

Por defecto usa los valores de `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` del `.env` (ver `.env.example`). **Cambia la contraseña** antes o después del primer acceso.

### 6. Generar el cliente Prisma (si hace falta)

Tras cambiar el esquema o clonar el repo sin `node_modules`:

```bash
npm run db:generate
```

### 7. Arrancar el servidor de desarrollo

```bash
npm run dev
```

Abre en el navegador: [http://localhost:3000](http://localhost:3000).

### 8. Acceder al panel administrativo

- Ruta del inventario (protegida): [http://localhost:3000/admin/inventory](http://localhost:3000/admin/inventory)  
- Si no hay sesión, el middleware redirige al login: [http://localhost:3000/login](http://localhost:3000/login)  
- Entra con el usuario creado por el seed (u otro **ADMIN** en base de datos).

### Comandos útiles en local

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (Turbopack). |
| `npm run lint` | ESLint. |
| `npm run db:studio` | Interfaz visual de Prisma Studio sobre la base. |
| `npm run db:push` | Sincroniza el esquema sin migración formal (solo útil en prototipos; en equipo preferir migraciones). |

---

## Cómo correr el proyecto en producción (paso a paso)

El despliegue puede hacerse en un **VPS**, **contenedor**, **PaaS** (por ejemplo Vercel, Railway, Render) o similar. Los pasos lógicos son siempre los mismos: variables de entorno, base de datos, migraciones, build y proceso Node.

### 1. Preparar PostgreSQL en producción

- Crea la base de datos y un usuario con permisos adecuados.
- Habilita **SSL** si tu proveedor lo exige (añade parámetros a `DATABASE_URL`, por ejemplo `?sslmode=require` según el proveedor).

### 2. Definir variables de entorno en el entorno de producción

Configura en el panel del hosting o en tu orquestador (sin commitear secretos al repositorio):

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL de producción. |
| `AUTH_SECRET` | Obligatorio en producción: cadena larga y aleatoria (nunca reutilizar la de desarrollo). |
| `AUTH_URL` / `NEXTAUTH_URL` | URL **pública HTTPS** de tu sitio, por ejemplo `https://tudominio.com`. Debe coincidir con la URL real (incluido `www` o no). |
| `NODE_ENV` | `production` (muchas plataformas lo fijan automáticamente). |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Si usas Google OAuth: credenciales de la app en Google Cloud; en la consola de Google añade la **URI de redirección** autorizada que indique Auth.js (ruta `/api/auth/callback/google` bajo tu dominio). |

Opcional: `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` solo si ejecutas el seed una vez en un entorno controlado (no dejes contraseñas por defecto en producción).

### 3. Instalar dependencias y construir la aplicación

En el servidor o en la fase de build del CI:

```bash
npm ci
npm run db:generate
npm run build
```

Usa `npm ci` en pipelines cuando exista `package-lock.json` para instalaciones reproducibles.

### 4. Aplicar migraciones en la base de producción

Antes o justo después del primer despliegue (según tu estrategia), ejecuta migraciones contra la base de datos de producción:

```bash
npx prisma migrate deploy
```

Este comando es el adecuado en CI/CD y servidores: no crea migraciones nuevas, solo aplica las existentes en `prisma/migrations`.

### 5. (Opcional una sola vez) Usuario administrador inicial

Si aún no tienes un ADMIN en la base de producción, puedes ejecutar **una vez** (con las variables de entorno ya configuradas):

```bash
npm run db:seed
```

Asegúrate de usar credenciales seguras y de no exponer el script en entornos públicos sin control.

### 6. Arrancar el servidor Node

Next.js en producción usa el servidor integrado:

```bash
npm run start
```

Por defecto escucha en el puerto **3000**. En muchos hosts debes configurar la variable `PORT` o un proxy inverso (Nginx, Caddy, balanceador) que termine TLS y reenvíe a ese puerto.

### 7. HTTPS y dominio

- En producción, sirve el sitio solo por **HTTPS**.
- Las URLs en `AUTH_URL` / `NEXTAUTH_URL` deben ser las definitivas; las cookies de sesión dependen del dominio correcto.

### Checklist rápido de producción

- [ ] `DATABASE_URL` apunta al PostgreSQL de producción.  
- [ ] `AUTH_SECRET` es único y seguro.  
- [ ] `AUTH_URL` / `NEXTAUTH_URL` coinciden con la URL pública.  
- [ ] `npx prisma migrate deploy` ejecutado correctamente.  
- [ ] `npm run build` sin errores y `npm run start` (o el comando del PaaS) en marcha.  
- [ ] OAuth de Google (si aplica) con redirect URIs actualizados al dominio real.

---

## Estructura relevante (referencia)

- `src/app/` — rutas y UI (App Router).  
- `src/auth.ts` — configuración Auth.js (Node, Prisma).  
- `src/auth.edge.ts` — capa compatible con Edge para el middleware.  
- `prisma/schema.prisma` — modelo de datos.  
- `prisma/migrations/` — migraciones versionadas.

---

## Licencia y soporte

Proyecto privado del concesionario. Para dudas internas, contacta al equipo de desarrollo.
