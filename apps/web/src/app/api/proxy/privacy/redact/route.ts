import { NextResponse } from 'next/server';

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';
const AI_KEY = process.env.AI_SERVICE_API_KEY || 'verifin-ai-service-key';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = typeof body?.text === 'string' ? body.text : '';
    if (!text.trim()) {
      return NextResponse.json({ success: false, error: 'text is required' }, { status: 400 });
    }
    const res = await fetch(`${AI_URL}/privacy/redact`, {
      method: 'POST',
      headers: { 'X-API-Key': AI_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch (error) {
    console.error('proxy/privacy/redact', error);
    return NextResponse.json({ success: false, error: 'AI service unreachable' }, { status: 502 });
  }
}