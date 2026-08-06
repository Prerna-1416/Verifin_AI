import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, unauthorized, serverError, forbidden, notFound } from '@/lib/api-auth';

const ACTIONS = ['PENDING', 'CONFIRMED_THREAT', 'FALSE_POSITIVE', 'ESCALATED'];

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    if (!user) return unauthorized();
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return forbidden();

    const body = await request.json();
    const { action } = body;
    if (!ACTIONS.includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    const flagged = await prisma.flaggedContent.findUnique({ where: { id: params.id } });
    if (!flagged) return notFound('Flagged content not found');

    const updated = await prisma.flaggedContent.update({
      where: { id: params.id },
      data: { action, reviewedBy: user.id, reviewedAt: new Date() },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return serverError(error);
  }
}
