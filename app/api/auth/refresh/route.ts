// API Route: POST /api/auth/refresh
// Task 3.4: Refresh access token

import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/auth/cognito';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from httpOnly cookie
    const refreshToken = request.cookies.get('refresh-token')?.value;
    // Get access token for username extraction (needed for SECRET_HASH)
    const accessToken = request.cookies.get('auth-token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_REFRESH_TOKEN',
            message: 'No refresh token provided',
          },
        },
        { status: 401 }
      );
    }

    // Refresh access token (pass old access token for SECRET_HASH computation)
    const tokens = await refreshAccessToken(refreshToken, accessToken);

    // Update httpOnly cookie with new access token
    const response = NextResponse.json(
      {
        success: true,
        data: {
          tokens,
        },
      },
      { status: 200 }
    );

    // Update secure httpOnly cookie
    // Using 'lax' instead of 'strict' to allow cookies after OAuth redirects
    response.cookies.set('auth-token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expiresIn,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Token refresh error:', error);

    // Handle refresh errors
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'REFRESH_FAILED',
          message: error.message || 'Failed to refresh token',
        },
      },
      { status: 401 }
    );
  }
}
