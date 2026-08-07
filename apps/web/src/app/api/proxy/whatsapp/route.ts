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
    const form = new URLSearchParams();
    form.set('text', text);
    const res = await fetch(`${AI_URL}/bot/whatsapp/analyze`, {
      method: 'POST',
      headers: {
        'X-API-Key': AI_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (error) {
    console.error('proxy/whatsapp', error);
    return NextResponse.json(
      { success: false, error: 'AI service unreachable' },
      { status: 502 }
    );
  }
}