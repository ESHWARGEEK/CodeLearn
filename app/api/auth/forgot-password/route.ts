// API Route: POST /api/auth/forgot-password
// Initiate password reset flow

import { NextRequest, NextResponse } from 'next/server';
import {
  CognitoIdentityProviderClient,
  ForgotPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = forgotPasswordSchema.parse(body);

    const client = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });

    const command = new ForgotPasswordCommand({
      ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
      Username: validatedData.email,
    });

    await client.send(command);

    return NextResponse.json(
      {
        success: true,
        message: 'Password reset code sent to your email',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Forgot password error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid email address',
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FORGOT_PASSWORD_FAILED',
          message: error.message || 'Failed to send reset code',
        },
      },
      { status: 500 }
    );
  }
}
