// API Route: POST /api/auth/signup
// Task 3.4: User signup with Cognito

import { NextRequest, NextResponse } from 'next/server';
import { signUpUser } from '@/lib/auth/cognito';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
  name: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = signupSchema.parse(body);

    // Create user in Cognito (auto-confirmed)
    const result = await signUpUser(
      validatedData.email,
      validatedData.password,
      validatedData.name
    );

    // Auto-login the user after successful registration
    const { signInUser, getUserFromToken } = await import('@/lib/auth/cognito');

    const tokens = await signInUser(validatedData.email, validatedData.password);
    const user = await getUserFromToken(tokens.accessToken);

    // Set httpOnly cookies
    const response = NextResponse.json(
      {
        success: true,
        data: {
          userId: result.userId,
          userConfirmed: true,
          user,
          tokens: {
            expiresIn: tokens.expiresIn,
          },
          message: 'Account created successfully',
        },
      },
      { status: 201 }
    );

    // Set httpOnly cookies for tokens
    response.cookies.set('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: tokens.expiresIn,
      path: '/',
    });

    response.cookies.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    response.cookies.set('idToken', tokens.idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: tokens.expiresIn,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Signup error:', error);

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

    // Handle Cognito errors
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SIGNUP_FAILED',
          message: error.message || 'Failed to create account',
        },
      },
      { status: 500 }
    );
  }
}
