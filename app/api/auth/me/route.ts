// API Route: GET /api/auth/me
// Task 3.4: Get current user details

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth/cognito';

export async function GET(request: NextRequest) {
  try {
    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'No access token provided',
          },
        },
        { status: 401 }
      );
    }

    // Get user details from token
    const user = await getUserFromToken(accessToken);

    return NextResponse.json(
      {
        success: true,
        data: {
          user,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get user error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: error.message || 'Invalid or expired token',
        },
      },
      { status: 401 }
    );
  }
}
