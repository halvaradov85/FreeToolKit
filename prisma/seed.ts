import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { TOOLS } from '@freetoolkit/shared';

const prisma = new PrismaClient();

async function main() {
  // Sembrar los overrides de catálogo (todas las herramientas habilitadas por defecto).
  for (const tool of TOOLS) {
    await prisma.tool.upsert({
      where: { id: tool.id },
      update: {},
      create: { id: tool.id, enabled: true, freeLimitPerDayOverride: null },
    });
  }
  console.log(`Sembradas ${TOOLS.length} herramientas en Tool.`);

  // Usuario admin inicial (solo si no existe).
  const adminEmail = 'admin@freetoolkit.local';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const passwordHash = await bcrypt.hash('admin1234', 12);
    await prisma.user.create({
      data: { email: adminEmail, passwordHash, role: 'ADMIN', tier: 'PRO' },
    });
    console.log(`Admin creado: ${adminEmail} (contraseña: admin1234) — cámbiala.`);
  } else {
    console.log('Admin ya existe, no se recrea.');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
