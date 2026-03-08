/**
 * Reactivate Subscription API Route
 * Reactivates a cancelled subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { reactivateSubscription, getSubscriptionByCustomerId } from '@/lib/stripe/subscriptions';
import { getUser } from '@/lib/db/users';
import { verifyToken } from '@/lib/auth/jwt';

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

    // Get current subscription
    const subscription = await getSubscriptionByCustomerId(user.stripeCustomerId);
    if (!subscription) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_SUBSCRIPTION', message: 'No active subscription found' } },
        { status: 400 }
      );
    }

    // Check if subscription is not cancelled
    if (!subscription.cancelAtPeriodEnd) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_CANCELLED', message: 'Subscription is not cancelled' } },
        { status: 400 }
      );
    }

    // Reactivate subscription
    const success = await reactivateSubscription(subscription.id);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: { code: 'REACTIVATE_FAILED', message: 'Failed to reactivate subscription' } },
        { status: 500 }
      );
    }

    console.log(`Subscription reactivated for user ${payload.userId}: ${subscription.id}`);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Subscription has been reactivated successfully',
        cancelAtPeriodEnd: false,
        currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
      },
    });
  } catch (error) {
    console.error('Reactivate subscription API error:', error);

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to reactivate subscription' } },
      { status: 500 }
    );
  }
}