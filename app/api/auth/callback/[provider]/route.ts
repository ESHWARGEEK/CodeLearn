// API Route: GET /api/auth/callback/[provider]
// Task 3.4: OAuth callback handler for GitHub and Google

import { NextRequest, NextResponse } from 'next/server';
import { exchangeOAuthCode, getUserFromToken } from '@/lib/auth/cognito';

export async function GET(request: NextRequest, { params }: { params: { provider: string } }) {
  try {
    const { provider } = params;
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
    }

    // Validate provider
    if (provider !== 'github' && provider !== 'google') {
      return NextResponse.redirect(new URL('/login?error=invalid_provider', request.url));
    }

    // Exchange authorization code for tokens
    const tokens = await exchangeOAuthCode(code, provider as 'github' | 'google');

    // Get user details
    const user = await getUserFromToken(tokens.accessToken);

    // Create response with redirect to dashboard
    const response = NextResponse.redirect(new URL('/dashboard', request.url));

    // Set secure httpOnly cookies
    response.cookies.set('auth-token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: tokens.expiresIn,
      path: '/',
    });

    response.cookies.set('refresh-token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('OAuth callback error:', error);

    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message || 'oauth_failed')}`, request.url)
    );
  }
}
