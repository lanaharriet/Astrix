import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'astrix-super-secret-key-12345');

// Helper to inject HTTP security headers on all outgoing responses
function injectSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://images.unsplash.com https://images.secure.unsplash.com https://api.placeholder.com; connect-src 'self'; frame-ancestors 'none';");
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Resolve User Session / Credentials
  let user: { id: string; email: string; role: string } | null = null;
  const token = request.cookies.get('astrix-token')?.value;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      user = {
        id: payload.id as string,
        email: payload.email as string,
        role: payload.role as string,
      };
    } catch (err) {
      // Invalid token, try to fall back or delete
    }
  }

  // Fallback to astrix-user-session if token is missing or failed (for dev mock mode compatibility)
  if (!user) {
    const userCookie = request.cookies.get('astrix-user-session')?.value;
    if (userCookie) {
      try {
        const decoded = JSON.parse(decodeURIComponent(userCookie));
        if (decoded && decoded.role) {
          user = {
            id: decoded.id || decoded._id,
            email: decoded.email,
            role: decoded.role,
          };
        }
      } catch (e) {
        // Cookie corrupted
      }
    }
  }

  // 2. Perform RBAC Checks
  
  // Dashboard routes guard
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      // Unauthenticated, redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      const response = NextResponse.redirect(url);
      response.cookies.delete('astrix-token');
      response.cookies.delete('astrix-user-session');
      return injectSecurityHeaders(response);
    }

    const segments = pathname.split('/');
    const dashboardRole = segments[2]; // /dashboard/[role]

    if (dashboardRole && dashboardRole !== 'auth') {
      // Admin has access to all dashboards. Other roles must match their dashboard exactly.
      if (user.role !== 'admin' && user.role !== dashboardRole) {
        const url = request.nextUrl.clone();
        url.pathname = `/dashboard/${user.role}`;
        return injectSecurityHeaders(NextResponse.redirect(url));
      }
    }
  }

  // Admin APIs guard
  if (pathname.startsWith('/api/admin')) {
    if (!user) {
      return injectSecurityHeaders(
        NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 })
      );
    }
    if (user.role !== 'admin') {
      return injectSecurityHeaders(
        NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 })
      );
    }
  }

  // Database APIs guard
  if (pathname.startsWith('/api/db')) {
    if (!user) {
      return injectSecurityHeaders(
        NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 })
      );
    }

    const validRoles = ['admin', 'faculty', 'student', 'parent'];
    if (!validRoles.includes(user.role)) {
      return injectSecurityHeaders(
        NextResponse.json({ error: 'Forbidden: Invalid role assignment' }, { status: 403 })
      );
    }

    // Protect sensitive database collections from non-admins
    const segments = pathname.split('/');
    const tableName = segments[3]; // /api/db/[table]
    if (tableName) {
      const sensitiveTables = ['audit_logs', 'system_settings'];
      if (sensitiveTables.includes(tableName) && user.role !== 'admin') {
        return injectSecurityHeaders(
          NextResponse.json({ error: 'Forbidden: Sensitive database access denied' }, { status: 403 })
        );
      }
    }
  }

  // 3. Fallthrough with Headers
  return injectSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets with standard extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
