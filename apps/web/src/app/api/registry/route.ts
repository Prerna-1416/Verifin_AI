import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serverError } from '@/lib/api-auth';

export async function GET() {
  try {
    const institutions = await prisma.institution.findMany({
      where: { isVerified: true },
      include: {
        _count: { select: { notices: true } },
        notices: {
          where: { status: 'ACTIVE' },
          select: { id: true, title: true, signedAt: true, expiresAt: true },
          orderBy: { signedAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: institutions });
  } catch (error) {
    return serverError(error);
  }
}
