import { readFileSync } from 'node:fs';
import { createHash, sign as cryptoSign, generateKeyPairSync } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env');

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

const demoInstitutions = [
  {
    name: 'Zerodha Broking Ltd',
    registrationNo: 'INZ-000016633',
    website: 'https://zerodha.com',
    notices: [
      {
        title: 'KYC Re-verification Advisory',
        content:
          'Attention all Zerodha clients,\n\nZerodha is currently conducting a regulatory KYC re-verification for accounts opened before 2024. This is free of cost.\n\nWe will NEVER ask you for your trading password, PIN, OTP, or payment of any processing fee. If you receive a call, SMS or email asking you to pay a fee or share your OTP, it is a scam.\n\nTo verify your profile, use the official Zerodha App only.\n\nRegards,\nCompliance Team\nZerodha Securities Limited',
      },
      {
        title: 'New Margin Trading Facility rollout',
        content:
          'Zerodha is introducing an upgraded Margin Trading Facility (MTF) for client accounts.\n\nEligible clients can avail margin against their holdings subject to SEBI margin regulations. There is NO upfront activation fee.\n\nTo enable MTF, log in to your Zerodha account and accept the facility terms. Do not share your credentials with anyone.',
      },
    ],
  },
  {
    name: 'HDFC Securities Limited',
    registrationNo: 'INZ-000016039',
    website: 'https://www.hdfcsec.com',
    notices: [
      {
        title: 'Delivery Instruction Slips (DIS) policy update',
        content:
          'Dear HDFC Securities client,\n\nAs per SEBI regulations, physical Delivery Instruction Slips (DIS) are being phased out. Please use the electronic DIS facility available in your trading account.\n\nHDFC Securities will never ask for your OTP, PIN or CVV over the telephone. In case a caller asks for these details, treat the call as fraudulent and disconnect immediately.\n\nRegards,\nClient Operations',
      },
    ],
  },
  {
    name: 'Securities and Exchange Board of India',
    registrationNo: 'SEBI-REG-2025-0001',
    website: 'https://www.sebi.gov.in',
    notices: [
      {
        title: 'PUBLIC ADVISORY against fake recovery agents',
        content:
          'PUBLIC ADVISORY\n\nSEBI has observed fraudulent activity by persons posing as recovery agents or "SEBI registered advisors". SEBI does not contact investors to ask for money, "recovery fees", or KYC verification payments.\n\nInvestors are advised to trade only through SEBI registered intermediaries. Verify any communication against the SEBI list of registered intermediaries available on sebi.gov.in.\n\nIssued under Section 11 of the SEBI Act, 1992.\n\nRegards,\nOffice of Investor Education',
      },
    ],
  },
];

async function upsertUser(u) {
  const existing = await prisma.user.findUnique({ where: { email: u.email } });
  if (existing) return existing;
  const passwordHash = await bcrypt.hash(u.password, 10);
  return prisma.user.create({
    data: {
      email: u.email,
      passwordHash,
      name: u.name,
      role: u.role,
      isVerified: true,
    },
  });
}

async function main() {
  const admin = await upsertUser(users[2]);
  const investor = await upsertUser(users[0]);
  await upsertUser(users[1]);

  for (const inst of demoInstitutions) {
    const existing = await prisma.institution.findUnique({
      where: { registrationNo: inst.registrationNo },
    });
    if (existing) {
      console.log(`skip (already exists): ${inst.name}`);
      continue;
    }

    const { publicKey, privateKey } = generateKeyPairSync('ed25519');
    const publicHex = publicKey.export({ type: 'spki', format: 'der' }).toString('hex');
    const privateHex = privateKey.export({ type: 'pkcs8', format: 'der' }).toString('hex');

    const created = await prisma.institution.create({
      data: {
        name: inst.name,
        registrationNo: inst.registrationNo,
        website: inst.website,
        publicKey: publicHex,
        privateKeyHash: privateHex,
        isVerified: true,
        ownerId: admin.id,
      },
    });
    console.log(`created institution: ${inst.name}`);

    for (const notice of inst.notices) {
      const contentHash = createHash('sha256').update(notice.content).digest('hex');
      const payload = { title: notice.title, content_hash: contentHash, institution: inst.name };
      const message = JSON.stringify(payload, Object.keys(payload).sort());
      const signature = cryptoSign(null, Buffer.from(message), privateKey).toString('hex');

      const createdNotice = await prisma.notice.create({
        data: {
          institutionId: created.id,
          title: notice.title,
          content: notice.content,
          signature,
          signedBy: inst.name,
          signedAt: new Date(),
          status: 'ACTIVE',
        },
      });
      console.log(`  notice: ${notice.title} (${signature.slice(0, 12)}...)`);

      const qrPayload = JSON.stringify({
        v: 1,
        notice_id: createdNotice.id,
        institution_id: created.id,
        content_hash: contentHash,
        sig: signature,
        ts: new Date().toISOString(),
      });
      await prisma.qRCode.create({
        data: {
          noticeId: createdNotice.id,
          institutionId: created.id,
          payload: qrPayload,
          qrImageUrl: `/verify/${createdNotice.id}`,
        },
      });
      console.log(`series qr → /verify/${createdNotice.id}`);
    }
  }

  const scanCount = await prisma.scan.count();
  if (scanCount === 0) {
    const sampleScans = [
      {
        inputType: 'TEXT',
        inputContent: 'URGENT: Your Zerodha account is blocked. Verify at zerodhna.com to avoid a fee.',
        riskScore: 82,
        riskLevel: 'CRITICAL',
        threats: ['Known Malicious Domain', 'Urgency Manipulation'],
        status: 'COMPLETED',
      },
      {
        inputType: 'URL',
        inputContent: 'https://groww-verify.top/login',
        riskScore: 78,
        riskLevel: 'HIGH',
        threats: ['Typo-Squatting'],
        status: 'COMPLETED',
      },
      {
        inputType: 'TEXT',
        inputContent: 'HDFC Bank: Your OTP is 448291. Do not share it with anyone.',
        riskScore: 3,
        riskLevel: 'LOW',
        threats: [],
        status: 'COMPLETED',
      },
    ];
    for (const s of sampleScans) {
      await prisma.scan.create({
        data: {
          userId: investor.id,
          inputType: s.inputType,
          inputContent: s.inputContent,
          riskScore: s.riskScore,
          riskLevel: s.riskLevel,
          threats: s.threats,
          detectors: [],
          status: s.status,
          completedAt: new Date(),
          createdAt: new Date(),
        },
      });
    }
    console.log('created demo scans (3)');
  } else {
    console.log(`skip scans: ${scanCount} already exist`);
  }

  console.log('\nSeed complete.');
  console.log('Registry: /registry   Verify sample: /verify/<noticeId> printed above.');
  console.log('Accounts: test@ / inst@ / admin@ (see README).');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });