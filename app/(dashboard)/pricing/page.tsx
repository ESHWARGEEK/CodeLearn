/**
 * Pricing Page
 * Displays subscription plans and handles checkout
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Zap, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-context';

interface PricingPlan {
  id: 'free' | 'pro' | 'team';
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
  icon: React.ReactNode;
}

const plans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Perfect for learning and exploring',
    features: [
      '5 template integrations per month',
      'Access to Learning Mode',
      'Basic AI mentor assistance',
      'Community support',
      'Public portfolio',
    ],
    buttonText: 'Current Plan',
    icon: <Check className="h-6 w-6" />,
  },
  {
    id: 'pro',
    name: 'Developer Pro',
    price: 19,
    description: 'For professional developers',
    features: [
      'Unlimited template integrations',
      'Priority AI processing',
      'Advanced code analysis',
      'Email support',
      'Private repositories',
      'Custom templates',
    ],
    popular: true,
    buttonText: 'Upgrade to Pro',
    icon: <Zap className="h-6 w-6" />,
  },
  {
    id: 'team',
    name: 'Team',
    price: 99,
    description: 'For development teams',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Shared template library',
      'Admin dashboard',
      'Priority support',
      'Custom integrations',
    ],
    buttonText: 'Upgrade to Team',
    icon: <Users className="h-6 w-6" />,
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: 'pro' | 'team') => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(planId);

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          tier: planId,
          successUrl: `${window.location.origin}/billing/success`,
          cancelUrl: `${window.location.origin}/billing/cancel`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to Stripe Checkout
        window.location.href = data.data.url;
      } else {
        console.error('Checkout error:', data.error);
        
        // Handle specific error cases
        if (data.error?.code === 'ALREADY_SUBSCRIBED') {
          alert('You already have an active subscription. Please manage your subscription from your account settings.');
        } else if (data.error?.code === 'UNAUTHORIZED') {
          alert('Please log in to upgrade your plan.');
          router.push('/login');
        } else {
          alert(data.error?.message || 'Failed to create checkout session. Please try again.');
        }
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('An error occurred while processing your request. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const getButtonProps = (plan: PricingPlan) => {
    if (plan.id === 'free') {
      return {
        variant: 'outline' as const,
        disabled: true,
        onClick: () => {},
      };
    }

    if (user?.tier === plan.id) {
      return {
        variant: 'outline' as const,
        disabled: true,
        onClick: () => {},
        children: 'Current Plan',
      };
    }

    return {
      variant: plan.popular ? ('default' as const) : ('outline' as const),
      disabled: loading === plan.id,
      onClick: () => handleUpgrade(plan.id as 'pro' | 'team'),
      children: loading === plan.id ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        plan.buttonText
      ),
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free and upgrade as you grow. All plans include access to our AI-powered learning platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                plan.popular ? 'ring-2 ring-blue-500 relative' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 mr-3">
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-gray-600">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-600 ml-2">/month</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  {...getButtonProps(plan)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Need a custom solution? Contact our sales team.
          </p>
          <Button variant="outline">
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
}