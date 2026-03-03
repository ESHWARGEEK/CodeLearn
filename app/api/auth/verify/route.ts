// API Route: POST /api/auth/verify
// Task 3.9: Email verification with confirmation code

import { NextRequest, NextResponse } from 'next/server';
import { confirmSignUp } from '@/lib/auth/cognito';
import { z } from 'zod';

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6).regex(/^\d+$/, 'Code must be 6 digits'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = verifySchema.parse(body);

    // Confirm signup with Cognito
    await confirmSignUp(validatedData.email, validatedData.code);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          message: 'Email verified successfully',
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Email verification error:', error);

    // Handle validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid verification code format',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    // Handle Cognito errors
    const errorMessage = error.message || 'Failed to verify email';
    let statusCode = 500;

    // Map common Cognito errors to user-friendly messages
    if (errorMessage.includes('CodeMismatchException') || errorMessage.includes('code')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CODE',
            message: 'Invalid verification code. Please check and try again.',
          },
        },
        { status: 400 }
      );
    }

    if (errorMessage.includes('ExpiredCodeException') || errorMessage.includes('expired')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EXPIRED_CODE',
            message: 'Verification code has expired. Please request a new code.',
          },
        },
        { status: 400 }
      );
    }

    if (errorMessage.includes('NotAuthorizedException')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ALREADY_VERIFIED',
            message: 'This email is already verified. Please login.',
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VERIFICATION_FAILED',
          message: errorMessage,
        },
      },
      { status: statusCode }
    );
  }
}
