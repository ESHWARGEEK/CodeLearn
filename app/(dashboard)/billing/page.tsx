/**
 * Billing Dashboard Page
 * Main subscription management interface
 */

'use client';

import { BillingManagement } from '@/components/billing/BillingManagement';

export default function BillingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-600 mt-1">Manage your subscription and billing information</p>
      </div>
      
      <BillingManagement />
    </div>
  );
}