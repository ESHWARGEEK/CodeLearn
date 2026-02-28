import { NextRequest, NextResponse } from 'next/server';
import { getItem, queryItems, TABLES } from '@/lib/db/dynamodb';

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_USER_ID',
            message: 'User ID is required',
          },
        },
        { status: 400 }
      );
    }

    // Get user profile to check tier
    const user = await getItem(TABLES.USERS, {
      PK: `USER#${userId}`,
      SK: 'PROFILE',
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        },
        { status: 404 }
      );
    }

    // Get current month for rate limiting
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Query integrations for this user in current month
    const integrations = await queryItems(
      TABLES.INTEGRATIONS,
      'SK = :userId AND #month = :month',
      {
        ':userId': `USER#${userId}`,
        ':month': currentMonth,
      },
      'userId-month-index'
    );

    // Define tier limits
    const tierLimits = {
      free: 5,
      pro: -1, // unlimited
      team: -1, // unlimited
    };

    const tier = (user.tier as 'free' | 'pro' | 'team') || 'free';
    const limit = tierLimits[tier];
    const integrationsThisMonth = integrations.length;

    // Calculate reset date (first day of next month)
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Get all-time integration count
    const allIntegrations = await queryItems(
      TABLES.INTEGRATIONS,
      'SK = :userId',
      {
        ':userId': `USER#${userId}`,
      },
      'userId-month-index'
    );

    return NextResponse.json({
      success: true,
      data: {
        userId,
        tier,
        integrationsThisMonth,
        limit,
        resetDate: resetDate.toISOString(),
        isLimitReached: limit !== -1 && integrationsThisMonth >= limit,
        remainingIntegrations: limit === -1 ? -1 : Math.max(0, limit - integrationsThisMonth),
        allTimeIntegrations: allIntegrations.length,
        recentIntegrations: integrations
          .sort((a, b) => (b.createdAt as number) - (a.createdAt as number))
          .slice(0, 5)
          .map((i) => ({
            id: i.PK.replace('INTEGRATION#', ''),
            templateId: i.templateId,
            projectId: i.projectId,
            status: i.status,
            createdAt: i.createdAt,
          })),
      },
    });
  } catch (error) {
    console.error('Error fetching developer usage:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch developer usage',
        },
      },
      { status: 500 }
    );
  }
}
