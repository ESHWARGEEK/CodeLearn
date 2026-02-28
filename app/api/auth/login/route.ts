// API Route: POST /api/auth/login
// Task 3.4: User login with JWT token generation

import { NextRequest, NextResponse } from 'next/server';
import { signInUser, getUserFromToken } from '@/lib/auth/cognito';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = loginSchema.parse(body);

    // Sign in user with Cognito
    const tokens = await signInUser(validatedData.email, validatedData.password);

    // Get user details
    const user = await getUserFromToken(tokens.accessToken);

    // Set httpOnly cookie with access token
    const response = NextResponse.json(
      {
        success: true,
        data: {
          user,
          tokens,
        },
      },
      { status: 200 }
    );

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
    console.error('Login error:', error);

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

    // Handle authentication errors
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message: error.message || 'Invalid email or password',
        },
      },
      { status: 401 }
    );
  }
}
