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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  // Special handling for '/' to avoid matching all routes
  const isPublicRoute = publicRoutes.some((route) => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });

  if (isPublicRoute) {
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
    // Simplified: Just verify token exists and is valid (basic check)
    // No complex tier-based access control for now
    const payload = await verifyToken(token);

    // Add basic user info to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.sub || '');
    requestHeaders.set('x-user-email', payload.email || '');

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    // If token verification fails, just redirect to login
    // No complex error handling
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);

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
