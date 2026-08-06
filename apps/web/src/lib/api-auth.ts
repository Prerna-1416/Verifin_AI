import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { Role } from '@prisma/client';

export type AuthedUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  isVerified: boolean;
};

export async function requireAuth(): Promise<AuthedUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? null,
    role: session.user.role,
    isVerified: session.user.isVerified,
  };
}

export function unauthorized() {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
}

export function badRequest(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 400 });
}

export function notFound(message = 'Not found') {
  return NextResponse.json({ success: false, error: message }, { status: 404 });
}

export function serverError(error: unknown) {
  console.error('[API]', error);
  return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
}
