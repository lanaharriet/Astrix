import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'astrix-super-secret-key-12345');

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('astrix-token')?.value;

    if (!token) {
      // Check if there is an astrix-user-session cookie (mock mode fallback)
      const userCookie = request.cookies.get('astrix-user-session')?.value;
      if (userCookie) {
        try {
          const user = JSON.parse(decodeURIComponent(userCookie));
          const segments = pathname.split('/');
          const dashboardRole = segments[2];
          if (dashboardRole && user.role !== 'admin' && user.role !== dashboardRole) {
            const url = request.nextUrl.clone();
            url.pathname = `/dashboard/${user.role}`;
            return NextResponse.redirect(url);
          }
          return NextResponse.next();
        } catch (e) {
          // Cookie corrupted, redirect to login
        }
      }

      // Unauthenticated, redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const userRole = payload.role as string;

      // Check if pathname starts with a role-specific dashboard
      const segments = pathname.split('/');
      const dashboardRole = segments[2]; // /dashboard/[role]

      if (dashboardRole && dashboardRole !== 'auth') {
        // Admin has access to all dashboards. Other roles must match exactly.
        if (userRole !== 'admin' && userRole !== dashboardRole) {
          const url = request.nextUrl.clone();
          url.pathname = `/dashboard/${userRole}`;
          return NextResponse.redirect(url);
        }
      }
    } catch (err) {
      // Fallback to astrix-user-session if token verification fails (mock mode fallback)
      const userCookie = request.cookies.get('astrix-user-session')?.value;
      if (userCookie) {
        try {
          const user = JSON.parse(decodeURIComponent(userCookie));
          const segments = pathname.split('/');
          const dashboardRole = segments[2];
          if (dashboardRole && user.role !== 'admin' && user.role !== dashboardRole) {
            const url = request.nextUrl.clone();
            url.pathname = `/dashboard/${user.role}`;
            return NextResponse.redirect(url);
          }
          return NextResponse.next();
        } catch (e) {
          // Fall through to redirect
        }
      }

      // Invalid token, redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      const response = NextResponse.redirect(url);
      response.cookies.delete('astrix-token');
      response.cookies.delete('astrix-user-session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
