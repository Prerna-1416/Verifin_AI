import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const roleRoutes: Record<string, string[]> = {
  '/investor': ['INVESTOR', 'ADMIN', 'SUPER_ADMIN'],
  '/institution': ['INSTITUTION', 'ADMIN', 'SUPER_ADMIN'],
  '/admin': ['ADMIN', 'SUPER_ADMIN'],
};

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  // Check if route requires authentication
  const requiresAuth = Object.keys(roleRoutes).some((route) =>
    pathname.startsWith(route)
  );

  if (!requiresAuth) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!session?.user) {
    const loginUrl = new URL('/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access
  const userRole = session.user.role;
  const allowedRoles = Object.entries(roleRoutes).find(([route]) =>
    pathname.startsWith(route)
  )?.[1];

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    const redirectMap: Record<string, string> = {
      INVESTOR: '/investor',
      INSTITUTION: '/institution',
      ADMIN: '/admin',
      SUPER_ADMIN: '/admin',
    };
    return NextResponse.redirect(new URL(redirectMap[userRole] || '/', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/investor/:path*',
    '/institution/:path*',
    '/admin/:path*',
    '/api/investor/:path*',
    '/api/institution/:path*',
    '/api/admin/:path*',
  ],
};