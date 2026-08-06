import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, unauthorized, serverError, forbidden, notFound } from '@/lib/api-auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    if (!user) return unauthorized();
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return forbidden();

    const body = await request.json();
    const { isVerified } = body;
    if (typeof isVerified !== 'boolean') {
      return NextResponse.json({ success: false, error: 'isVerified must be a boolean' }, { status: 400 });
    }

    const institution = await prisma.institution.findUnique({ where: { id: params.id } });
    if (!institution) return notFound('Institution not found');

    const updated = await prisma.institution.update({
      where: { id: params.id },
      data: { isVerified },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return serverError(error);
  }
}
