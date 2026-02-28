// Middleware for protected routes
// Task 3.5: JWT verification and authorization by tier

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/cognito';

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/learning',
  '/developer',
  '/portfolio',
  '/settings',
  '/onboarding',
];

// Define public routes (no authentication required)
const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/terms', '/privacy'];

// Define tier-based access control
const tierAccess: Record<string, string[]> = {
  free: ['/dashboard', '/learning', '/portfolio', '/settings', '/onboarding'],
  pro: ['/dashboard', '/learning', '/developer', '/portfolio', '/settings', '/onboarding'],
  team: ['/dashboard', '/learning', '/developer', '/portfolio', '/settings', '/onboarding'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow API routes (they handle their own auth)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    // Redirect to login if no token
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify JWT token
    const payload = await verifyToken(token);

    // Extract user tier from token
    const userTier = (payload['custom:tier'] as string) || 'free';

    // Check tier-based access
    const allowedRoutes = tierAccess[userTier] || tierAccess['free'];
    const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route));

    if (!hasAccess) {
      // Redirect to upgrade page if user doesn't have access
      return NextResponse.redirect(new URL('/upgrade', request.url));
    }

    // Add user info to request headers for downstream use
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.sub || '');
    response.headers.set('x-user-tier', userTier);
    response.headers.set('x-user-email', payload.email || '');

    return response;
  } catch (error) {
    console.error('Token verification failed:', error);

    // Redirect to login if token is invalid or expired
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('error', 'session_expired');

    // Clear invalid token
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth-token');
    response.cookies.delete('refresh-token');

    return response;
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
