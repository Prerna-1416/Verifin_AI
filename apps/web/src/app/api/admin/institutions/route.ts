import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, unauthorized, serverError, forbidden } from '@/lib/api-auth';

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user) return unauthorized();
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return forbidden();

    const institutions = await prisma.institution.findMany({
      include: {
        owner: { select: { name: true, email: true } },
        _count: { select: { notices: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: institutions });
  } catch (error) {
    return serverError(error);
  }
}
