import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, unauthorized, forbidden, notFound, serverError } from '@/lib/api-auth';

const STATUSES = ['NEW', 'REVIEWED', 'ESCALATED', 'CLOSED'];

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    if (!user) return unauthorized();
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return forbidden();

    const body = await request.json().catch(() => ({}));
    const status = body?.status as string | undefined;
    if (status && !STATUSES.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }
    if (!status) {
      return NextResponse.json({ success: false, error: 'status is required' }, { status: 400 });
    }

    const existing = await prisma.regulatorAlert.findUnique({ where: { id: params.id } });
    if (!existing) return notFound('Alert not found');

    const updated = await prisma.regulatorAlert.update({
      where: { id: params.id },
      data: { status: status as never },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    if (!user) return unauthorized();
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return forbidden();

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'RESEND_API_KEY not configured' }, { status: 400 });
    }

    const alert = await prisma.regulatorAlert.findUnique({ where: { id: params.id } });
    if (!alert) return notFound('Alert not found');

    const to = (process.env.REGULATOR_EMAIL || 'notifications@verifin.ai').trim();
    const from = process.env.EMAIL_FROM || 'VeriFin AI ThreatHunter <onboarding@resend.dev>';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `[VeriFin ThreatHunter] ${alert.severity} ${alert.threatType} — ${alert.title.slice(0, 120)}`,
        html: `<h2>${alert.severity} ${alert.threatType} — ${alert.title}</h2><p>Regulator: ${alert.regulator}</p><p>${alert.description.replace(/</g, '&lt;').replace(/\n/g, '<br/>')}</p>`,
      }),
    });

    if (!res.ok) {
      console.error('[alerts/resend]', res.status, await res.text());
      return serverError(new Error(`Resend returned ${res.status}`));
    }

    const updated = await prisma.regulatorAlert.update({
      where: { id: params.id },
      data: { notifiedAt: new Date(), status: alert.status === 'NEW' ? 'ESCALATED' : alert.status },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return serverError(error);
  }
}