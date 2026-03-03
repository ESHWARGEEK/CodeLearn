// API Route: POST /api/auth/resend-code
// Task 3.9: Resend verification code with rate limiting

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  CognitoIdentityProviderClient,
  ResendConfirmationCodeCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import * as crypto from 'crypto';

const resendSchema = z.object({
  email: z.string().email(),
});

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET;

/**
 * Compute SecretHash for Cognito operations
 */
function computeSecretHash(username: string): string | undefined {
  if (!CLIENT_SECRET) {
    return undefined;
  }

  const message = username + CLIENT_ID;
  const hmac = crypto.createHmac('sha256', CLIENT_SECRET);
  hmac.update(message);
  return hmac.digest('base64');
}

// Simple in-memory rate limiting (for production, use Redis or DynamoDB)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimitMap.get(email);

  if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW) {
    return false; // Rate limited
  }

  rateLimitMap.set(email, now);

  // Clean up old entries (older than 5 minutes)
  for (const [key, timestamp] of rateLimitMap.entries()) {
    if (now - timestamp > 5 * 60 * 1000) {
      rateLimitMap.delete(key);
    }
  }

  return true; // Allowed
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = resendSchema.parse(body);

    // Check rate limit
    if (!checkRateLimit(validatedData.email)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Please wait 1 minute before requesting another code.',
          },
        },
        { status: 429 }
      );
    }

    // Resend confirmation code
    const secretHash = computeSecretHash(validatedData.email);

    const command = new ResendConfirmationCodeCommand({
      ClientId: CLIENT_ID,
      Username: validatedData.email,
      SecretHash: secretHash,
    });

    await cognitoClient.send(command);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          message: 'Verification code sent successfully',
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Resend code error:', error);

    // Handle validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid email address',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    // Handle Cognito errors
    const errorMessage = error.message || 'Failed to resend verification code';

    if (errorMessage.includes('LimitExceededException')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'LIMIT_EXCEEDED',
            message: 'Too many attempts. Please try again later.',
          },
        },
        { status: 429 }
      );
    }

    if (errorMessage.includes('InvalidParameterException')) {
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
          code: 'RESEND_FAILED',
          message: errorMessage,
        },
      },
      { status: 500 }
    );
  }
}
