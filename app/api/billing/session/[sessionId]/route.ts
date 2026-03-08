/**
 * Billing Session API Route
 * Retrieves checkout session details for success page
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';

interface RouteParams {
  params: {
    sessionId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_SESSION_ID', message: 'Session ID is required' } },
        { status: 400 }
      );
    }

    // Retrieve checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'subscription'],
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'SESSION_NOT_FOUND', message: 'Checkout session not found' } },
        { status: 404 }
      );
    }

    // Extract relevant information
    const lineItem = session.line_items?.data[0];
    const amount = lineItem?.amount_total ? lineItem.amount_total / 100 : 0;
    
    // Determine tier from price ID or amount
    let tier = 'pro';
    if (amount >= 99) {
      tier = 'team';
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        customerEmail: session.customer_details?.email || session.customer_email,
        tier,
        amount,
        currency: session.currency || 'usd',
        status: session.status,
        paymentStatus: session.payment_status,
        subscriptionId: typeof session.subscription === 'string' 
          ? session.subscription 
          : session.subscription?.id,
      },
    });
  } catch (error) {
    console.error('Session API error:', error);

    // Handle specific Stripe errors
    if (error instanceof Error && error.message.includes('No such checkout session')) {
      return NextResponse.json(
        { success: false, error: { code: 'SESSION_NOT_FOUND', message: 'Checkout session not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve session information' } },
      { status: 500 }
    );
  }
}