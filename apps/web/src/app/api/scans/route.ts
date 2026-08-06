import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, unauthorized, serverError, badRequest } from '@/lib/api-auth';

const INPUT_TYPE_MAP: Record<string, 'TEXT' | 'URL' | 'IMAGE' | 'AUDIO' | 'FILE'> = {
  text: 'TEXT',
  url: 'URL',
  image: 'IMAGE',
  audio: 'AUDIO',
  file: 'FILE',
};

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user) return unauthorized();

    const scans = await prisma.scan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, data: scans });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    if (!user) return unauthorized();

    const body = await request.json();
    const {
      kind,
      input,
      prediction,
      confidence,
      riskScore,
      threatLevel,
      reasons,
      isFlagged,
      transcript,
    } = body;

    const inputType = INPUT_TYPE_MAP[String(kind).toLowerCase()];
    if (!inputType) return badRequest('Invalid scan kind');
    if (!prediction) return badRequest('prediction is required');

    const detectors = {
      primary: String(prediction),
      confidence: typeof confidence === 'number' ? confidence : null,
      threatLevel: threatLevel || null,
      reasons: Array.isArray(reasons) ? reasons : [],
      transcript: transcript || null,
    };

    const scan = await prisma.scan.create({
      data: {
        userId: user.id,
        inputType,
        inputContent: input ? String(input).slice(0, 2000) : `[${inputType}]`,
        riskScore: typeof riskScore === 'number' ? riskScore : 0,
        riskLevel: mapRiskLevel(threatLevel, riskScore),
        detectors,
        threats: isFlagged ? ['FLAGGED'] : [],
        isVerified: Boolean(isFlagged),
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    if (isFlagged) {
      await prisma.flaggedContent.create({
        data: {
          scanId: scan.id,
          reason: (Array.isArray(reasons) && reasons[0]) || 'Flagged by automated detection',
        },
      });
    }

    return NextResponse.json({ success: true, data: scan }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}

function mapRiskLevel(
  threatLevel: string | null,
  riskScore: number | null
): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const level = String(threatLevel || '').toUpperCase();
  if (['CRITICAL'].includes(level)) return 'CRITICAL';
  if (['HIGH'].includes(level)) return 'HIGH';
  if (['MEDIUM'].includes(level)) return 'MEDIUM';
  if (['LOW'].includes(level)) return 'LOW';
  if (typeof riskScore === 'number') {
    if (riskScore >= 80) return 'CRITICAL';
    if (riskScore >= 60) return 'HIGH';
    if (riskScore >= 40) return 'MEDIUM';
  }
  return 'LOW';
}
