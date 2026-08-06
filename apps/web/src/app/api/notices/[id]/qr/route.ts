import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, unauthorized, serverError, notFound } from '@/lib/api-auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    if (!user) return unauthorized();

    const notice = await prisma.notice.findUnique({
      where: { id: params.id },
      include: { institution: true },
    });
    if (!notice) return notFound('Notice not found');
    if (notice.institution.ownerId !== user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const existing = await prisma.qRCode.findFirst({ where: { noticeId: notice.id } });
    if (existing) {
      return NextResponse.json({ success: true, data: existing });
    }

    const payload = JSON.stringify({
      v: 'verifin',
      type: 'notice',
      noticeId: notice.id,
      institutionId: notice.institutionId,
      title: notice.title,
      signedAt: notice.signedAt.toISOString(),
    });

    const qr = await prisma.qRCode.create({
      data: {
        noticeId: notice.id,
        institutionId: notice.institutionId,
        payload,
        qrImageUrl: `/verify/${notice.id}`,
      },
    });

    return NextResponse.json({ success: true, data: qr });
  } catch (error) {
    return serverError(error);
  }
}
