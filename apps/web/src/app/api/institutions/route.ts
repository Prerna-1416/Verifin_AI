import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, unauthorized, serverError } from '@/lib/api-auth';
import { institutionRegisterSchema } from '@/lib/validations';

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user) return unauthorized();

    const institution = await prisma.institution.findFirst({
      where: { ownerId: user.id },
      include: { notices: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });

    if (!institution) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: institution });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    if (!user) return unauthorized();

    const body = await request.json();
    const parsed = institutionRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }

    const existing = await prisma.institution.findFirst({ where: { ownerId: user.id } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'You already own an institution' }, { status: 409 });
    }

    const { name, registrationNo, website, logoUrl } = parsed.data;
    const { publicKey, privateKey } = await generateKeyPair();
    const privateKeyHash = hashKey(privateKey);

    const institution = await prisma.institution.create({
      data: {
        name,
        registrationNo,
        website: website || null,
        logoUrl: logoUrl || null,
        publicKey,
        privateKeyHash,
        ownerId: user.id,
      },
    });

    return NextResponse.json({ success: true, data: institution });
  } catch (error) {
    return serverError(error);
  }
}

function generateKeyPair() {
  const publicKey = `vf_pub_${randomHex(24)}`;
  const privateKey = `vf_priv_${randomHex(32)}`;
  return Promise.resolve({ publicKey, privateKey });
}

function randomHex(bytes: number) {
  const arr = new Uint8Array(bytes);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < bytes; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

function hashKey(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return `v1:${hash.toString(36)}`;
}
