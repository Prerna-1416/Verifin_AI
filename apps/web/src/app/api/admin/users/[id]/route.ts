import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, unauthorized, serverError, forbidden } from '@/lib/api-auth';

const ROLES = ['INVESTOR', 'INSTITUTION', 'ADMIN', 'SUPER_ADMIN'];

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    if (!user) return unauthorized();
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return forbidden();

    const { role } = await request.json();
    if (!ROLES.includes(role)) {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 });
    }
    if (user.id === params.id && user.role === 'ADMIN' && role === 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Cannot self-promote' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true, isVerified: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return serverError(error);
  }
}
