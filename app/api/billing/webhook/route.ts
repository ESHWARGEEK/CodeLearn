/**
 * Stripe Webhook API Route
 * Handles Stripe webhook events for subscription management
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyWebhookSignature, handleWebhookEvent, stripeConfig } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let eventType = 'unknown';
  let eventId = 'unknown';

  try {
    // Get the webhook secret
    const webhookSecret = stripeConfig.webhookSecret;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Get the request body and signature
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    const event = verifyWebhookSignature(body, signature, webhookSecret);
    eventType = event.type;
    eventId = event.id;

    // Log webhook received
    console.log('Webhook received:', {
      eventId: event.id,
      eventType: event.type,
      created: event.created,
      livemode: event.livemode
    });

    // Handle the webhook event
    await handleWebhookEvent(event);

    const processingTime = Date.now() - startTime;
    console.log('Webhook processed successfully:', {
      eventId: event.id,
      eventType: event.type,
      processingTimeMs: processingTime
    });

    return NextResponse.json({ 
      received: true,
      eventId: event.id,
      eventType: event.type,
      processingTimeMs: processingTime
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    console.error('Webhook error:', {
      eventId,
      eventType,
      processingTimeMs: processingTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    if (error instanceof Error && error.message === 'Invalid webhook signature') {
      return NextResponse.json(
        { 
          error: 'Invalid signature',
          eventId,
          eventType
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Webhook handler failed',
        eventId,
        eventType,
        processingTimeMs: processingTime
      },
      { status: 500 }
    );
  }
}