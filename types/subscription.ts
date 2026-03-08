// Subscription Types for CodeLearn Platform
// Task 15.6: Define TypeScript interfaces for subscription management

export interface SubscriptionData {
  plan: 'free' | 'pro' | 'team';
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paymentMethod: PaymentMethod;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
}

export interface PaymentMethod {
  type: 'card' | 'paypal';
  last4: string;
  brand: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface SubscriptionResponse {
  success: boolean;
  data?: SubscriptionData;
  error?: {
    code: string;
    message: string;
  };
}

export interface CancelSubscriptionRequest {
  reason?: string;
}

export interface CancelSubscriptionResponse {
  success: boolean;
  message: string;
  data?: {
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface ReactivateSubscriptionResponse {
  success: boolean;
  message: string;
  data?: {
    cancelAtPeriodEnd: boolean;
    status: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface PlanFeatures {
  name: string;
  price: string;
  features: string[];
  integrations: number | 'unlimited';
  support: string;
}

export const PLAN_FEATURES: Record<string, PlanFeatures> = {
  free: {
    name: 'Free',
    price: '$0/month',
    features: [
      'Learning Mode access',
      'Basic AI mentor',
      'Community templates',
      'Basic sandbox execution'
    ],
    integrations: 10,
    support: 'Community'
  },
  pro: {
    name: 'Developer Pro',
    price: '$19/month',
    features: [
      'Everything in Free',
      'Developer Mode access',
      'Advanced AI mentor',
      'Template extraction',
      'Code integration',
      'Priority sandbox execution'
    ],
    integrations: 'unlimited',
    support: 'Email'
  },
  team: {
    name: 'Team',
    price: '$99/month',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Advanced analytics',
      'Custom templates',
      'Priority support',
      'SSO integration'
    ],
    integrations: 'unlimited',
    support: 'Priority'
  }
};