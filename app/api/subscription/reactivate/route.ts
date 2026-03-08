import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/verify';
import { reactivateUserSubscription, getUserSubscription } from '@/lib/db/subscriptions';

// POST /api/subscription/reactivate - Reactivate a cancelled subscription
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current subscription to check if it exists and is cancelled
    const userSubscription = await getUserSubscription(authResult.userId);
    if (!userSubscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    if (!userSubscription.cancelAtPeriodEnd) {
      return NextResponse.json(
        { error: 'Subscription is not cancelled' },
        { status: 400 }
      );
    }

    // Reactivate the subscription
    await reactivateUserSubscription(authResult.userId);

    // TODO: Also reactivate in Stripe
    // This should:
    // 1. Remove the cancellation from the subscription in Stripe
    // 2. Send reactivation confirmation email

    console.log(`Reactivated subscription for user: ${authResult.userId}`);

    return NextResponse.json({
      success: true,
      message: 'Subscription has been reactivated',
      data: {
        cancelAtPeriodEnd: false,
        status: 'active'
      }
    });

  } catch (error) {
    console.error('Error reactivating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}