/**
 * Test Stripe Helper
 * Utilities for testing Stripe integration
 */

import { vi } from 'vitest';

interface TestInvoice {
  customer: string;
  amount: number;
  status: string;
  description: string;
}

interface TestSubscription {
  customerId: string;
  status: string;
  tier: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd: Date;
}

interface WebhookEvent {
  type: string;
  data: {
    object: any;
  };
}

class TestStripe {
  private invoices: any[] = [];
  private subscriptions: any[] = [];
  private customers: any[] = [];

  async setup() {
    // Reset test data
    this.invoices = [];
    this.subscriptions = [];
    this.customers = [];

    // Mock Stripe methods
    vi.doMock('@/lib/stripe/config', () => ({
      stripe: {
        invoices: {
          list: vi.fn().mockImplementation(({ customer }) => {
            const customerInvoices = this.invoices.filter(inv => inv.customer === customer);
            return Promise.resolve({ data: customerInvoices });
          }),
          retrieveUpcoming: vi.fn().mockImplementation(({ customer }) => {
            // Return mock upcoming invoice
            return Promise.resolve({
              id: 'in_upcoming',
              amount_due: 1900,
              currency: 'usd',
              period_start: Math.floor(Date.now() / 1000),
              period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
              next_payment_attempt: Math.floor((Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000),
            });
          }),
        },
        subscriptions: {
          list: vi.fn().mockImplementation(({ customer }) => {
            const customerSubs = this.subscriptions.filter(sub => sub.customer === customer);
            return Promise.resolve({ data: customerSubs });
          }),
          retrieve: vi.fn().mockImplementation((subscriptionId) => {
            const subscription = this.subscriptions.find(sub => sub.id === subscriptionId);
            return Promise.resolve(subscription);
          }),
          update: vi.fn().mockImplementation((subscriptionId, updates) => {
            const subscription = this.subscriptions.find(sub => sub.id === subscriptionId);
            if (subscription) {
              Object.assign(subscription, updates);
            }
            return Promise.resolve(subscription);
          }),
        },
        billingPortal: {
          sessions: {
            create: vi.fn().mockImplementation(({ customer, return_url }) => {
              return Promise.resolve({
                url: `https://billing.stripe.com/session/test_${customer}?return_url=${encodeURIComponent(return_url)}`,
              });
            }),
          },
        },
        checkout: {
          sessions: {
            retrieve: vi.fn().mockImplementation((sessionId) => {
              return Promise.resolve({
                id: sessionId,
                customer_details: {
                  email: 'test@example.com',
                },
                currency: 'usd',
                status: 'complete',
                payment_status: 'paid',
                line_items: {
                  data: [{
                    amount_total: 1900,
                  }],
                },
                subscription: 'sub_test_123',
              });
            }),
          },
        },
        customers: {
          list: vi.fn().mockImplementation(({ email }) => {
            const customer = this.customers.find(cust => cust.email === email);
            return Promise.resolve({ data: customer ? [customer] : [] });
          }),
          create: vi.fn().mockImplementation((customerData) => {
            const customer = {
              id: `cus_test_${Date.now()}`,
              ...customerData,
            };
            this.customers.push(customer);
            return Promise.resolve(customer);
          }),
        },
      },
    }));
  }

  async cleanup() {
    vi.clearAllMocks();
    this.invoices = [];
    this.subscriptions = [];
    this.customers = [];
  }

  async createInvoice(invoiceData: TestInvoice) {
    const invoice = {
      id: `in_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customer: invoiceData.customer,
      amount_paid: invoiceData.amount,
      currency: 'usd',
      status: invoiceData.status,
      created: Math.floor(Date.now() / 1000),
      hosted_invoice_url: `https://invoice.stripe.com/test_${Date.now()}`,
      invoice_pdf: `https://invoice.stripe.com/test_${Date.now()}.pdf`,
      description: invoiceData.description,
      lines: {
        data: [{ description: invoiceData.description }],
      },
      period_start: Math.floor(Date.now() / 1000),
      period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
    };

    this.invoices.push(invoice);
    return invoice;
  }

  async createSubscription(subscriptionData: TestSubscription) {
    const subscription = {
      id: `sub_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customer: subscriptionData.customerId,
      status: subscriptionData.status,
      cancel_at_period_end: subscriptionData.cancelAtPeriodEnd || false,
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor(subscriptionData.currentPeriodEnd.getTime() / 1000),
      trial_end: null,
      items: {
        data: [{
          price: {
            id: subscriptionData.tier === 'pro' ? 'price_pro' : 'price_team',
          },
        }],
      },
      metadata: {},
    };

    this.subscriptions.push(subscription);
    return subscription;
  }

  generateWebhookSignature(event: WebhookEvent): string {
    // Generate a mock webhook signature for testing
    const timestamp = Math.floor(Date.now() / 1000);
    const payload = JSON.stringify(event);
    const signature = `t=${timestamp},v1=test_signature_${Buffer.from(payload).toString('base64').substr(0, 10)}`;
    return signature;
  }

  mockWebhookEvent(eventType: string, eventData: any) {
    return {
      type: eventType,
      data: {
        object: eventData,
      },
      created: Math.floor(Date.now() / 1000),
      id: `evt_test_${Date.now()}`,
      livemode: false,
      pending_webhooks: 1,
      request: {
        id: `req_test_${Date.now()}`,
        idempotency_key: null,
      },
    };
  }
}

export const testStripe = new TestStripe();