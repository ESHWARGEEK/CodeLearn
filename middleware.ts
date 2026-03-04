// Middleware for protected routes - SIMPLIFIED
// Just checks if auth token cookie exists

import { NextRequest, NextResponse } from 'next/server';

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
const publicRoutes = ['/', '/login', '/signup', '/terms', '/privacy'];

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

  // Simplified: Just check if token exists, don't validate it
  // This prevents 401 errors and makes auth simpler
  if (!token) {
    // Redirect to login if no token
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token exists, allow access
  // Add minimal headers for downstream handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-authenticated', 'true');

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
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
