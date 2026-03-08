/**
 * Subscription Status API Route
 * Gets current subscription information for a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptionByCustomerId, getUserTierFromSubscription } from '@/lib/stripe';
import { getUser } from '@/lib/db/users';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
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

    // If user has no Stripe customer ID, return free tier info
    if (!user.stripeCustomerId) {
      return NextResponse.json({
        success: true,
        data: {
          tier: 'free',
          status: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        },
      });
    }

    // Get subscription information from Stripe
    const subscription = await getSubscriptionByCustomerId(user.stripeCustomerId);
    
    if (!subscription) {
      return NextResponse.json({
        success: true,
        data: {
          tier: 'free',
          status: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        tier: subscription.tier,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        trialEnd: subscription.trialEnd?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('Subscription API error:', error);

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get subscription information' } },
      { status: 500 }
    );
  }
}