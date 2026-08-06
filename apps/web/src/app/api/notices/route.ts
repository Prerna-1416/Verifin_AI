import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, unauthorized, serverError, notFound } from '@/lib/api-auth';
import { noticeCreateSchema } from '@/lib/validations';
import { createHash } from 'crypto';

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user) return unauthorized();

    const institution = await prisma.institution.findFirst({ where: { ownerId: user.id } });
    if (!institution) return notFound('No institution for this account');

    const notices = await prisma.notice.findMany({
      where: { institutionId: institution.id },
      orderBy: { signedAt: 'desc' },
      include: { qrCodes: true },
    });

    return NextResponse.json({ success: true, data: notices });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    if (!user) return unauthorized();

    const institution = await prisma.institution.findFirst({ where: { ownerId: user.id } });
    if (!institution) return notFound('No institution for this account');

    const body = await request.json();
    const parsed = noticeCreateSchema.safeParse(body);
    if (!parsed.success) {
      console.error('[NOTICES] validation failed', parsed.error.issues, 'body:', body);
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message, issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { title, content, documentUrl, expiresAt } = parsed.data;

    const signature = createHash('sha256')
      .update(`${institution.id}:${title}:${content}:${Date.now()}`)
      .digest('hex');

    const notice = await prisma.notice.create({
      data: {
        institutionId: institution.id,
        title,
        content,
        documentUrl: documentUrl || null,
        signature,
        signedBy: user.name || user.email,
        signedAt: new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({ success: true, data: notice });
  } catch (error) {
    return serverError(error);
  }
}
