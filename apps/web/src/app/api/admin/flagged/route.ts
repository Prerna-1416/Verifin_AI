import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, unauthorized, serverError, forbidden } from '@/lib/api-auth';

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user) return unauthorized();
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return forbidden();

    const flagged = await prisma.flaggedContent.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        scan: { include: { user: { select: { name: true, email: true } } } },
      },
      take: 100,
    });

    return NextResponse.json({ success: true, data: flagged });
  } catch (error) {
    return serverError(error);
  }
}
