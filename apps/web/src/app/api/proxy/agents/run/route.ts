import { NextResponse } from 'next/server';

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';
const AI_KEY = process.env.AI_SERVICE_API_KEY || 'verifin-ai-service-key';

export async function POST() {
  try {
    const res = await fetch(`${AI_URL}/agents/run`, {
      method: 'POST',
      headers: { 'X-API-Key': AI_KEY },
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (error) {
    console.error('proxy/agents/run', error);
    return NextResponse.json(
      { success: false, error: 'AI service unreachable' },
      { status: 502 }
    );
  }
}