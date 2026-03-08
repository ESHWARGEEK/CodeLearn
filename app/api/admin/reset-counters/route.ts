import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/cognito';
import { manualResetTrigger, getResetStatistics } from '@/lib/utils/monthly-reset';

interface ResetResponse {
  success: boolean;
  data?: {
    resetCount: number;
    message: string;
    statistics: {
      currentMonth: string;
      previousMonth: string;
      nextResetDate: string;
    };
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

export async function POST(request: NextRequest) {
  try {
    // Get current user for authorization
    const user = await getCurrentUser(request) as User | null;
    if (!user) {
      const errorResponse: ResetResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // TODO: In production, add admin role check
    // For now, we'll allow any authenticated user for testing purposes
    // if (!isAdmin(user)) {
    //   return NextResponse.json({
    //     success: false,
    //     error: {
    //       code: 'FORBIDDEN',
    //       message: 'Admin access required',
    //     },
    //   }, { status: 403 });
    // }

    // Get reset statistics first
    const statistics = await getResetStatistics();

    // Perform manual reset
    const resetResult = await manualResetTrigger();

    const response: ResetResponse = {
      success: resetResult.success,
      data: {
        resetCount: resetResult.resetCount,
        message: resetResult.message,
        statistics: {
          currentMonth: statistics.currentMonth,
          previousMonth: statistics.previousMonth,
          nextResetDate: statistics.nextResetDate,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Manual reset error:', error);
    
    const errorResponse: ResetResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to reset counters',
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get current user for authorization
    const user = await getCurrentUser(request) as User | null;
    if (!user) {
      const errorResponse: ResetResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Get reset statistics
    const statistics = await getResetStatistics();

    const response = {
      success: true,
      data: {
        statistics: {
          currentMonth: statistics.currentMonth,
          previousMonth: statistics.previousMonth,
          shouldReset: statistics.shouldReset,
          nextResetDate: statistics.nextResetDate,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Reset statistics error:', error);
    
    const errorResponse: ResetResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get reset statistics',
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}