/**
 * Upcoming Invoice API Route
 * Retrieves upcoming invoice information for a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUpcomingInvoice } from '@/lib/stripe/subscriptions';
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

    // If user has no Stripe customer ID, return no upcoming invoice
    if (!user.stripeCustomerId) {
      return NextResponse.json({
        success: true,
        data: {
          invoice: null,
        },
      });
    }

    // Get upcoming invoice from Stripe
    const upcomingInvoice = await getUpcomingInvoice(user.stripeCustomerId);

    return NextResponse.json({
      success: true,
      data: {
        invoice: upcomingInvoice,
      },
    });
  } catch (error) {
    console.error('Upcoming invoice API error:', error);

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve upcoming invoice' } },
      { status: 500 }
    );
  }
}