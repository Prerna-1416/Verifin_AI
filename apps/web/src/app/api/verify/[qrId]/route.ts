import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serverError, notFound } from '@/lib/api-auth';

export async function GET(request: Request, { params }: { params: { qrId: string } }) {
  try {
    const id = params.qrId;
    if (!/^[a-f0-9]{24}$/i.test(id)) return notFound('Notice not found');

    const qr = await prisma.qRCode.findUnique({
      where: { id },
      include: { notice: { include: { institution: true } } },
    });

    const noticeData = qr?.notice
      ? qr.notice
      : await prisma.notice.findUnique({
          where: { id },
          include: { institution: true },
        });

    if (!noticeData) return notFound('Notice not found');

    if (noticeData.status !== 'ACTIVE') {
      return NextResponse.json({ success: true, status: 'revoked', data: null });
    }

    return NextResponse.json({
      success: true,
      status: 'valid',
      data: {
        notice: {
          id: noticeData.id,
          title: noticeData.title,
          content: noticeData.content,
          signedBy: noticeData.signedBy,
          signedAt: noticeData.signedAt,
          documentUrl: noticeData.documentUrl,
          expiresAt: noticeData.expiresAt,
          signature: noticeData.signature,
        },
        institution: {
          id: noticeData.institution.id,
          name: noticeData.institution.name,
          registrationNo: noticeData.institution.registrationNo,
          website: noticeData.institution.website,
          isVerified: noticeData.institution.isVerified,
        },
      },
    });
  } catch (error) {
    return serverError(error);
  }
}
