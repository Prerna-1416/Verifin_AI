import { NextResponse } from 'next/server';

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';
const AI_KEY = process.env.AI_SERVICE_API_KEY || 'verifin-ai-service-key';

export async function GET() {
  try {
    const res = await fetch(`${AI_URL}/privacy/policy`, {
      headers: { 'X-API-Key': AI_KEY },
      cache: 'no-store',
    });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch (error) {
    console.error('proxy/privacy/policy', error);
    return NextResponse.json({ success: false, error: 'AI service unreachable' }, { status: 502 });
  }
}