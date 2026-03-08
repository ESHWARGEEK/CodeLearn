import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/cognito';
import { getUserUsage, UserTier, RateLimitType } from '@/lib/middleware/rate-limiting';

interface UsageResponse {
  success: boolean;
  data?: {
    tier: UserTier;
    usage: Record<RateLimitType, { used: number; limit: number; percentage: number }>;
    resetDate: string;
    upgradeAvailable: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
}

interface User {
  userId: string;
  email: string;
  name: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      const errorResponse: UsageResponse = {
        success: false,
        error: {
          code: 'MISSING_USER_ID',
          message: 'User ID is required',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Get current user for authorization
    const currentUser = await getCurrentUser(request) as User | null;
    if (!currentUser) {
      const errorResponse: UsageResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Users can only view their own usage
    if (currentUser.userId !== userId) {
      const errorResponse: UsageResponse = {
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access denied. You can only view your own usage.',
        },
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Get user usage data
    const usageData = await getUserUsage(userId);

    // Calculate usage percentages and format response
    const formattedUsage: Record<RateLimitType, { used: number; limit: number; percentage: number }> = {
      integrations: {
        used: usageData.usage.integrations.used,
        limit: usageData.usage.integrations.limit,
        percentage: usageData.usage.integrations.limit === -1 
          ? 0 
          : Math.round((usageData.usage.integrations.used / usageData.usage.integrations.limit) * 100),
      },
      templates: {
        used: usageData.usage.templates.used,
        limit: usageData.usage.templates.limit,
        percentage: usageData.usage.templates.limit === -1 
          ? 0 
          : Math.round((usageData.usage.templates.used / usageData.usage.templates.limit) * 100),
      },
      extractions: {
        used: usageData.usage.extractions.used,
        limit: usageData.usage.extractions.limit,
        percentage: usageData.usage.extractions.limit === -1 
          ? 0 
          : Math.round((usageData.usage.extractions.used / usageData.usage.extractions.limit) * 100),
      },
    };

    const response: UsageResponse = {
      success: true,
      data: {
        tier: usageData.tier,
        usage: formattedUsage,
        resetDate: usageData.resetDate,
        upgradeAvailable: usageData.tier === 'free',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Usage retrieval error:', error);
    
    if (error instanceof Error && error.message === 'User not found') {
      const errorResponse: UsageResponse = {
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }
    
    const errorResponse: UsageResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve usage data',
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}