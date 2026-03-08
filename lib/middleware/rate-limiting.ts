import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/cognito';
import { getMonthlyIntegrationCount } from '@/lib/db/integrations';
import { getUser } from '@/lib/db/users';

/**
 * Rate limiting configuration by user tier
 */
export const RATE_LIMITS = {
  free: {
    integrations: 5,
    templates: 10,
    extractions: 3,
  },
  pro: {
    integrations: 50,
    templates: 100,
    extractions: 25,
  },
  team: {
    integrations: -1, // unlimited
    templates: -1,    // unlimited
    extractions: -1,  // unlimited
  },
} as const;

export type UserTier = keyof typeof RATE_LIMITS;
export type RateLimitType = keyof typeof RATE_LIMITS.free;

/**
 * Rate limiting error response
 */
export interface RateLimitError {
  success: false;
  error: {
    code: 'RATE_LIMIT_EXCEEDED';
    message: string;
    details: {
      limit: number;
      used: number;
      resetDate: string;
      upgradeUrl?: string;
    };
  };
}

/**
 * Check if user has exceeded rate limit for a specific operation
 */
export async function checkRateLimit(
  request: NextRequest,
  limitType: RateLimitType
): Promise<{ allowed: boolean; response?: NextResponse }> {
  try {
    // Get current user
    const user = await getCurrentUser(request);
    if (!user) {
      return {
        allowed: false,
        response: NextResponse.json(
          {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required',
            },
          },
          { status: 401 }
        ),
      };
    }

    // Get user details including tier
    const userDetails = await getUser(user.userId);
    if (!userDetails) {
      return {
        allowed: false,
        response: NextResponse.json(
          {
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: 'User not found',
            },
          },
          { status: 404 }
        ),
      };
    }

    const userTier = userDetails.tier as UserTier;
    const limit = RATE_LIMITS[userTier][limitType];

    // Unlimited for team tier
    if (limit === -1) {
      return { allowed: true };
    }

    // Get current usage based on limit type
    let currentUsage = 0;
    switch (limitType) {
      case 'integrations':
        currentUsage = await getMonthlyIntegrationCount(user.userId);
        break;
      case 'templates':
        // TODO: Implement template usage tracking
        currentUsage = 0;
        break;
      case 'extractions':
        // TODO: Implement extraction usage tracking
        currentUsage = 0;
        break;
    }

    // Check if limit exceeded
    if (currentUsage >= limit) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      nextMonth.setHours(0, 0, 0, 0);

      const rateLimitError: RateLimitError = {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Monthly ${limitType} limit exceeded. You have used ${currentUsage} of ${limit} ${limitType} this month.`,
          details: {
            limit,
            used: currentUsage,
            resetDate: nextMonth.toISOString(),
            upgradeUrl: userTier === 'free' ? '/pricing' : undefined,
          },
        },
      };

      return {
        allowed: false,
        response: NextResponse.json(rateLimitError, { status: 429 }),
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Rate limiting error:', error);
    return {
      allowed: false,
      response: NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to check rate limit',
          },
        },
        { status: 500 }
      ),
    };
  }
}

/**
 * Rate limiting middleware wrapper for API routes
 */
export function withRateLimit(
  limitType: RateLimitType,
  handler: (request: NextRequest, context: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: any) => {
    const rateLimitCheck = await checkRateLimit(request, limitType);
    
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!;
    }

    return handler(request, context);
  };
}

/**
 * Get user's current usage and limits
 */
export async function getUserUsage(userId: string): Promise<{
  tier: UserTier;
  usage: Record<RateLimitType, { used: number; limit: number }>;
  resetDate: string;
}> {
  const user = await getUser(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const userTier = user.tier as UserTier;
  const limits = RATE_LIMITS[userTier];

  // Get current usage
  const integrationUsage = await getMonthlyIntegrationCount(userId);
  // TODO: Implement template and extraction usage tracking
  const templateUsage = 0;
  const extractionUsage = 0;

  // Calculate reset date (first day of next month)
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(1);
  nextMonth.setHours(0, 0, 0, 0);

  return {
    tier: userTier,
    usage: {
      integrations: {
        used: integrationUsage,
        limit: limits.integrations,
      },
      templates: {
        used: templateUsage,
        limit: limits.templates,
      },
      extractions: {
        used: extractionUsage,
        limit: limits.extractions,
      },
    },
    resetDate: nextMonth.toISOString(),
  };
}