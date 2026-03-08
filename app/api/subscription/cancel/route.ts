import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/verify';
import { cancelUserSubscription, getUserSubscription } from '@/lib/db/subscriptions';

// POST /api/subscription/cancel - Cancel user's subscription
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current subscription to check if it exists
    const userSubscription = await getUserSubscription(authResult.userId);
    if (!userSubscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // Cancel the subscription (mark as cancelled but maintain access until period end)
    await cancelUserSubscription(authResult.userId);

    // TODO: Also cancel in Stripe
    // This should:
    // 1. Cancel the subscription at period end in Stripe
    // 2. Send cancellation confirmation email

    console.log(`Cancelled subscription for user: ${authResult.userId}`);

    return NextResponse.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the current billing period',
      data: {
        cancelAtPeriodEnd: true,
        currentPeriodEnd: userSubscription.currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}