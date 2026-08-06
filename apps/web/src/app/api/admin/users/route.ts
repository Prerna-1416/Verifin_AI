import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, unauthorized, serverError, forbidden } from '@/lib/api-auth';

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user) return unauthorized();
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return forbidden();

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return serverError(error);
  }
}
