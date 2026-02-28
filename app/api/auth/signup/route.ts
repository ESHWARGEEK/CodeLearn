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

    // Create user in Cognito
    const result = await signUpUser(
      validatedData.email,
      validatedData.password,
      validatedData.name
    );

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          userId: result.userId,
          userConfirmed: result.userConfirmed,
          message: result.userConfirmed
            ? 'Account created successfully'
            : 'Please check your email for verification code',
        },
      },
      { status: 201 }
    );
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
