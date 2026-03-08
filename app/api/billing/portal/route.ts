/**
 * Stripe Customer Portal API Route
 * Creates customer portal sessions for subscription management
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createCustomerPortalSession } from '@/lib/stripe/subscriptions';
import { getUser } from '@/lib/db/users';
import { verifyToken } from '@/lib/auth/jwt';

const portalSchema = z.object({
  returnUrl: z.string().url().optional(),
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

    // Check if user has a Stripe customer ID
    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_SUBSCRIPTION', message: 'User has no active subscription' } },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const validatedData = portalSchema.parse(body);

    // Create customer portal session
    const session = await createCustomerPortalSession(
      user.stripeCustomerId,
      validatedData.returnUrl
    );

    return NextResponse.json({
      success: true,
      data: {
        url: session.url,
      },
    });
  } catch (error) {
    console.error('Customer portal API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request data' } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create customer portal session' } },
      { status: 500 }
    );
  }
}