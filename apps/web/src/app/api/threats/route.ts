import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, unauthorized, serverError } from '@/lib/api-auth';
import { threatCreateSchema } from '@/lib/validations';

export async function GET() {
  try {
    const threats = await prisma.threatFeed.findMany({
      where: { isActive: true },
      orderBy: { publishedAt: 'desc' },
      take: 50,
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
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = threatCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }

    const threat = await prisma.threatFeed.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        type: parsed.data.type,
        severity: parsed.data.severity,
        indicators: parsed.data.indicators ?? {},
        source: parsed.data.source,
        sourceUrl: parsed.data.sourceUrl || null,
        isActive: true,
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: threat });
  } catch (error) {
    return serverError(error);
  }
}
