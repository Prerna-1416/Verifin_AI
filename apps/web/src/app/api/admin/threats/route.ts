import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, unauthorized, serverError, forbidden, badRequest } from '@/lib/api-auth';

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user) return unauthorized();
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return forbidden();

    const threats = await prisma.threatFeed.findMany({
      orderBy: { publishedAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: threats });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    if (!user) return unauthorized();
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return forbidden();

    const body = await request.json();
    const { title, description, type, severity, indicators, source, sourceUrl, isActive } = body;
    if (!title || !description || !source) return badRequest('title, description, source are required');

    const threat = await prisma.threatFeed.create({
      data: {
        title,
        description,
        type: type || 'OTHER',
        severity: severity || 'LOW',
        indicators: indicators ?? {},
        source,
        sourceUrl: sourceUrl || null,
        isActive: isActive ?? true,
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: threat });
  } catch (error) {
    return serverError(error);
  }
}
