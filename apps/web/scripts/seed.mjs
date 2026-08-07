import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env');

// Load DATABASE_URL from apps/web/.env if not already in the environment.
if (!process.env.DATABASE_URL) {
  try {
    const content = readFileSync(envPath, 'utf8');
    const m = content.match(/^DATABASE_URL="?([^"\r\n]+)"?/m);
    if (m) process.env.DATABASE_URL = m[1];
  } catch {
    // .env missing; explicit error below.
  }
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not set. Create apps/web/.env (copy .env.example) and start MongoDB first.');
  process.exit(1);
}

const prisma = new PrismaClient();

const users = [
  { email: 'test@verifin.ai', password: 'TestPass123', name: 'Investor Test', role: 'INVESTOR' },
  { email: 'inst@verifin.ai', password: 'TestPass123', name: 'Institution Test', role: 'INSTITUTION' },
  { email: 'admin@verifin.ai', password: 'AdminPass123', name: 'Admin', role: 'SUPER_ADMIN' },
];

async function main() {
  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      console.log(`skip (already exists): ${u.email}`);
      continue;
    }
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.create({
      data: {
        email: u.email,
        passwordHash,
        name: u.name,
        role: u.role,
        isVerified: true,
      },
    });
    console.log(`created: ${u.email} (${u.role}) / ${u.password}`);
  }
  console.log('Seed complete. Demo accounts ready on this machine.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });