'use client';

interface BillingManagementProps {
  userId?: string;
}

export default function BillingManagement({ userId }: BillingManagementProps) {
  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-indigo-400 text-[28px]">
            credit_card
          </span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Billing Management</h3>
          <p className="text-sm text-gray-400">Manage your subscription and payment methods</p>
        </div>
      </div>
      
      <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-8 text-center">
        <span className="material-symbols-outlined text-gray-500 text-[48px] mb-3 block">
          construction
        </span>
        <p className="text-gray-400 mb-2">Billing features are currently in development</p>
        <p className="text-sm text-gray-500">
          Payment processing and subscription management will be available soon
        </p>
      </div>
    </div>
  );
}
