import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@delaespriella.local";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "CambiarLuego123!";

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: "Administrador",
      role: UserRole.ADMIN,
      passwordHash,
    },
    update: {
      role: UserRole.ADMIN,
      passwordHash,
    },
  });

  // eslint-disable-next-line no-console -- script output
  console.log(`Usuario ADMIN listo: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
