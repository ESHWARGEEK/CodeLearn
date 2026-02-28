// API Route: POST /api/auth/refresh
// Task 3.4: Refresh access token

import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/auth/cognito';
import { z } from 'zod';

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = refreshSchema.parse(body);

    // Refresh access token
    const tokens = await refreshAccessToken(validatedData.refreshToken);

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
    response.cookies.set('auth-token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: tokens.expiresIn,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Token refresh error:', error);

    // Handle validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

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
