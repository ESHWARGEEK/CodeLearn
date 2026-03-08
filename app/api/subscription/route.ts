import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/verify';
import { getUserSubscription, formatSubscriptionData } from '@/lib/db/subscriptions';

// GET /api/subscription - Get user's subscription details
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user subscription from database
    const userSubscription = await getUserSubscription(authResult.userId);
    
    if (!userSubscription) {
      return NextResponse.json(
        { error: 'User subscription not found' },
        { status: 404 }
      );
    }

    // Format for API response
    const subscriptionData = formatSubscriptionData(userSubscription);

    return NextResponse.json({
      success: true,
      data: subscriptionData
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}