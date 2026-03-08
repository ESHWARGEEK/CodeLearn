/**
 * Stripe Checkout API Route
 * Creates checkout sessions for subscription purchases
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createCheckoutSession } from '@/lib/stripe';
import { getUser } from '@/lib/db/users';
import { verifyToken } from '@/lib/auth/jwt';

const checkoutSchema = z.object({
  tier: z.enum(['pro', 'team']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid token' } },
        { status: 401 }
      );
    }

    // Get user information
    const user = await getUser(payload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const validatedData = checkoutSchema.parse(body);

    // Check if user is already on a paid plan
    if (user.tier !== 'free') {
      return NextResponse.json(
        { success: false, error: { code: 'ALREADY_SUBSCRIBED', message: 'User already has an active subscription' } },
        { status: 400 }
      );
    }

    // Create checkout session
    const session = await createCheckoutSession({
      userId: user.PK.replace('USER#', ''),
      userEmail: user.email,
      tier: validatedData.tier,
      successUrl: validatedData.successUrl,
      cancelUrl: validatedData.cancelUrl,
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        url: session.url,
      },
    });
  } catch (error) {
    console.error('Checkout API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request data' } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create checkout session' } },
      { status: 500 }
    );
  }
}