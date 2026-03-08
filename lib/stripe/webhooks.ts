/**
 * Stripe Webhook Handlers
 * Handles Stripe webhook events for subscription management
 */

import Stripe from 'stripe';
import { stripe, stripeConfig } from './config';
import { updateUserTier } from '../db/users';
import { getUserTierFromSubscription, getSubscriptionById } from './subscriptions';

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw new Error('Invalid webhook signature');
  }
}

/**
 * Handle subscription created event
 */
export async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    const subscriptionInfo = await getSubscriptionById(subscription.id);
    if (!subscriptionInfo) {
      console.error('Failed to get subscription info');
      return;
    }

    const tier = getUserTierFromSubscription(subscriptionInfo);
    await updateUserTier(userId, tier, subscription.customer as string, subscription.id);

    console.log(`Subscription created for user ${userId}, tier: ${tier}`);
    
    // Log subscription creation details for monitoring
    console.log('Subscription creation details:', {
      userId,
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      status: subscription.status,
      tier,
      trialEnd: subscription.trial_end,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end
    });
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

/**
 * Handle subscription updated event
 */
export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    const subscriptionInfo = await getSubscriptionById(subscription.id);
    if (!subscriptionInfo) {
      console.error('Failed to get subscription info');
      return;
    }

    const tier = getUserTierFromSubscription(subscriptionInfo);
    await updateUserTier(userId, tier, subscription.customer as string, subscription.id);

    console.log(`Subscription updated for user ${userId}, tier: ${tier}, status: ${subscription.status}`);
    
    // Log subscription update details for monitoring
    console.log('Subscription update details:', {
      userId,
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      status: subscription.status,
      tier,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
      trialEnd: subscription.trial_end
    });
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

/**
 * Handle subscription deleted event
 */
export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    // Downgrade user to free tier and clear Stripe references
    await updateUserTier(userId, 'free', null, null);

    console.log(`Subscription deleted for user ${userId}, downgraded to free tier`);
    
    // Log subscription deletion details for monitoring
    console.log('Subscription deletion details:', {
      userId,
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      canceledAt: subscription.canceled_at,
      endedAt: subscription.ended_at,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    });
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

/**
 * Handle invoice payment succeeded event
 */
export async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    if (!invoice.subscription) {
      console.log('Invoice payment succeeded without subscription, skipping tier update');
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const userId = subscription.metadata?.userId;
    
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    // Get subscription info to determine tier
    const subscriptionInfo = await getSubscriptionById(subscription.id);
    if (!subscriptionInfo) {
      console.error('Failed to get subscription info for payment success');
      return;
    }

    // Update user tier immediately on successful payment
    const tier = getUserTierFromSubscription(subscriptionInfo);
    await updateUserTier(userId, tier, subscription.customer as string, subscription.id);

    console.log(`Payment succeeded for user ${userId}, amount: ${invoice.amount_paid}, tier updated to: ${tier}`);
    
    // Log payment success details for monitoring
    console.log('Payment success details:', {
      userId,
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      tier,
      invoiceId: invoice.id,
      billingReason: invoice.billing_reason,
      periodStart: invoice.period_start,
      periodEnd: invoice.period_end
    });
    
    // TODO: Send payment confirmation email here
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

/**
 * Handle invoice payment failed event
 */
export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    if (!invoice.subscription) {
      console.log('Invoice payment failed without subscription, skipping');
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const userId = subscription.metadata?.userId;
    
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    console.log(`Payment failed for user ${userId}, amount: ${invoice.amount_due}, attempt: ${invoice.attempt_count}`);
    
    // Log payment failure details for monitoring
    console.error('Payment failure details:', {
      userId,
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      amount: invoice.amount_due,
      currency: invoice.currency,
      attemptCount: invoice.attempt_count,
      nextPaymentAttempt: invoice.next_payment_attempt,
      invoiceId: invoice.id,
      status: invoice.status,
      subscriptionStatus: subscription.status,
      billingReason: invoice.billing_reason
    });
    
    // Handle multiple payment failures
    if (invoice.attempt_count >= 3) {
      console.error(`Multiple payment failures for user ${userId}, subscription may be at risk`);
      // TODO: Consider sending urgent payment failure notification
      // TODO: Consider temporary tier downgrade after multiple failures
    }
    
    // TODO: Send payment failure notification email
    // TODO: Consider downgrading user after multiple failures
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}

/**
 * Handle customer subscription trial will end event
 */
export async function handleSubscriptionTrialWillEnd(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    console.log(`Trial ending soon for user ${userId}, trial ends: ${subscription.trial_end}`);
    
    // TODO: Send trial ending notification email
  } catch (error) {
    console.error('Error handling subscription trial will end:', error);
  }
}

/**
 * Handle payment method attachment failed event
 */
export async function handlePaymentMethodAttachmentFailed(paymentMethod: Stripe.PaymentMethod) {
  try {
    console.log(`Payment method attachment failed: ${paymentMethod.id}`);
    
    // Log for monitoring
    console.error('Payment method attachment failure:', {
      paymentMethodId: paymentMethod.id,
      customerId: paymentMethod.customer,
      type: paymentMethod.type,
      created: paymentMethod.created
    });
  } catch (error) {
    console.error('Error handling payment method attachment failed:', error);
  }
}

/**
 * Main webhook event handler
 */
export async function handleWebhookEvent(event: Stripe.Event) {
  console.log(`Processing webhook event: ${event.type}`, {
    eventId: event.id,
    created: event.created,
    livemode: event.livemode
  });

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.trial_will_end':
        await handleSubscriptionTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'payment_method.attached':
        // Log successful payment method attachment
        console.log(`Payment method attached: ${(event.data.object as Stripe.PaymentMethod).id}`);
        break;

      case 'setup_intent.succeeded':
        // Log successful setup intent (payment method setup)
        console.log(`Setup intent succeeded: ${(event.data.object as Stripe.SetupIntent).id}`);
        break;

      case 'setup_intent.setup_failed':
        // Log failed setup intent
        console.error(`Setup intent failed: ${(event.data.object as Stripe.SetupIntent).id}`, {
          lastPaymentError: (event.data.object as Stripe.SetupIntent).last_payment_error
        });
        break;

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    // Log successful event processing
    console.log(`Successfully processed webhook event: ${event.type}`, {
      eventId: event.id
    });
  } catch (error) {
    console.error(`Error processing webhook event ${event.type}:`, {
      eventId: event.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}