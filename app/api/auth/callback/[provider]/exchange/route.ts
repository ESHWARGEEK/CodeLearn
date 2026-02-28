// API Route: POST /api/auth/callback/[provider]/exchange
// Task 3.4: OAuth token exchange after state validation

import { NextRequest, NextResponse } from 'next/server';
import { exchangeOAuthCode, getUserFromToken } from '@/lib/auth/cognito';
import { z } from 'zod';

const exchangeSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
});

export async function POST(request: NextRequest, { params }: { params: { provider: string } }) {
  try {
    const { provider } = params;

    // Validate provider
    if (provider !== 'github' && provider !== 'google') {
      return NextResponse.json({ success: false, error: 'Invalid provider' }, { status: 400 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = exchangeSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || 'Invalid request data';
      return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
    }

    const { code } = validation.data;

    // Exchange authorization code for tokens
    const tokens = await exchangeOAuthCode(code, provider as 'github' | 'google');

    // Get user details
    const user = await getUserFromToken(tokens.accessToken);

    // Create response with success
    // Include onboardingComplete to determine redirect destination
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.userId,
        email: user.email,
        name: user.name,
        onboardingComplete: user.onboardingComplete,
      },
    });

    // Set secure httpOnly cookies
    // Using 'lax' instead of 'strict' to allow cookies after OAuth redirects
    response.cookies.set('auth-token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expiresIn,
      path: '/',
    });

    response.cookies.set('refresh-token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('OAuth token exchange error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to exchange authorization code',
      },
      { status: 500 }
    );
  }
}
