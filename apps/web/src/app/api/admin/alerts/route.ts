import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, unauthorized, forbidden, serverError } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    if (!user) return unauthorized();
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return forbidden();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const alerts = await prisma.regulatorAlert.findMany({
      where: status ? { status: status as never } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return NextResponse.json({
      success: true,
      data: alerts,
      meta: {
        emailConfigured: Boolean(process.env.RESEND_API_KEY),
        regulatorEmail: process.env.REGULATOR_EMAIL || 'notifications@verifin.ai',
      },
    });
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
    const { title, description, regulator, severity, threatType, agent } = body;
    if (!title || !description || !regulator) {
      return NextResponse.json({ success: false, error: 'title, description, regulator are required' }, { status: 400 });
    }

    const alert = await prisma.regulatorAlert.create({
      data: {
        title,
        description,
        regulator,
        threatType: threatType || 'OTHER',
        severity: severity || 'MEDIUM',
        agent: agent || null,
        status: 'NEW',
        confidence: 1,
      },
    });

    return NextResponse.json({ success: true, data: alert });
  } catch (error) {
    return serverError(error);
  }
}