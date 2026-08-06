import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, unauthorized, serverError, forbidden } from '@/lib/api-auth';

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user) return unauthorized();
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return forbidden();

    const [users, institutions, notices, threats, scans, flagged, recentScans, recentUsers] =
      await Promise.all([
        prisma.user.count(),
        prisma.institution.count(),
        prisma.notice.count(),
        prisma.threatFeed.count(),
        prisma.scan.count(),
        prisma.flaggedContent.count({ where: { action: 'PENDING' } }),
        prisma.scan.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { user: { select: { name: true, email: true } } } }),
        prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
      ]);

    return NextResponse.json({
      success: true,
      data: { users, institutions, notices, threats, scans, flagged, recentScans, recentUsers },
    });
  } catch (error) {
    return serverError(error);
  }
}
