// API Route: POST /api/auth/logout
// Task 3.4: User logout with token invalidation

import { NextRequest, NextResponse } from 'next/server';
import { signOutUser } from '@/lib/auth/cognito';

export async function POST(request: NextRequest) {
  try {
    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    if (accessToken) {
      // Sign out user globally (invalidate all tokens)
      await signOutUser(accessToken);
    }

    // Clear httpOnly cookies
    const response = NextResponse.json(
      {
        success: true,
        data: {
          message: 'Logged out successfully',
        },
      },
      { status: 200 }
    );

    // Clear auth cookies
    response.cookies.delete('auth-token');
    response.cookies.delete('refresh-token');

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);

    // Even if logout fails, clear cookies
    const response = NextResponse.json(
      {
        success: true,
        data: {
          message: 'Logged out successfully',
        },
      },
      { status: 200 }
    );

    response.cookies.delete('auth-token');
    response.cookies.delete('refresh-token');

    return response;
  }
}
