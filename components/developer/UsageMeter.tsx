'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface UsageData {
  tier: 'free' | 'pro' | 'team';
  usage: {
    integrations: { used: number; limit: number; percentage: number };
    templates: { used: number; limit: number; percentage: number };
    extractions: { used: number; limit: number; percentage: number };
  };
  resetDate: string;
  upgradeAvailable: boolean;
}

interface UsageMeterProps {
  userId: string;
  showUpgradeCTA?: boolean;
  compact?: boolean;
}

const TIER_COLORS = {
  free: 'bg-gray-500',
  pro: 'bg-indigo-500',
  team: 'bg-purple-500',
} as const;

const TIER_LABELS = {
  free: 'Free',
  pro: 'Pro',
  team: 'Team',
} as const;

export default function UsageMeter({ userId, showUpgradeCTA = true, compact = false }: UsageMeterProps) {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsageData();
  }, [userId]);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/developer/usage/${userId}`);
      const data = await response.json();

      if (data.success) {
        setUsageData(data.data);
      } else {
        setError(data.error?.message || 'Failed to load usage data');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatResetDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  if (loading) {
    return (
      <Card className="bg-[#1E293B] border-[#334155]">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-400">Loading usage data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-[#1E293B] border-[#334155]">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-red-400">error</span>
            </div>
            <p className="text-red-400 mb-3">{error}</p>
            <Button
              onClick={fetchUsageData}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usageData) {
    return null;
  }

  if (compact) {
    return (
      <Card className="bg-[#1E293B] border-[#334155]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-400">analytics</span>
              <span className="text-white font-medium">Usage</span>
            </div>
            <Badge className={`${TIER_COLORS[usageData.tier]} text-white`}>
              {TIER_LABELS[usageData.tier]}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Integrations</span>
              <span className="text-white">
                {usageData.usage.integrations.used}
                {usageData.usage.integrations.limit === -1 ? '' : `/${usageData.usage.integrations.limit}`}
              </span>
            </div>
            {usageData.usage.integrations.limit !== -1 && (
              <Progress 
                value={usageData.usage.integrations.percentage} 
                className="h-2"
              />
            )}
          </div>

          {showUpgradeCTA && usageData.upgradeAvailable && usageData.usage.integrations.percentage >= 80 && (
            <Button
              size="sm"
              className="w-full mt-3 bg-indigo-600 hover:bg-indigo-500 text-white"
              onClick={() => window.open('/pricing', '_blank')}
            >
              Upgrade for Unlimited
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1E293B] border-[#334155]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <span className="material-symbols-outlined">analytics</span>
            Usage & Limits
          </CardTitle>
          <Badge className={`${TIER_COLORS[usageData.tier]} text-white`}>
            {TIER_LABELS[usageData.tier]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Integrations */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-400 text-[20px]">integration_instructions</span>
              <span className="text-white font-medium">Integrations</span>
            </div>
            <span className="text-gray-300">
              {usageData.usage.integrations.used}
              {usageData.usage.integrations.limit === -1 ? ' (Unlimited)' : `/${usageData.usage.integrations.limit}`}
            </span>
          </div>
          {usageData.usage.integrations.limit !== -1 && (
            <>
              <Progress 
                value={usageData.usage.integrations.percentage} 
                className="h-3 mb-1"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{usageData.usage.integrations.percentage}% used</span>
                <span>Resets {formatResetDate(usageData.resetDate)}</span>
              </div>
            </>
          )}
        </div>

        {/* Templates */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-[20px]">library_books</span>
              <span className="text-white font-medium">Templates</span>
            </div>
            <span className="text-gray-300">
              {usageData.usage.templates.used}
              {usageData.usage.templates.limit === -1 ? ' (Unlimited)' : `/${usageData.usage.templates.limit}`}
            </span>
          </div>
          {usageData.usage.templates.limit !== -1 && (
            <>
              <Progress 
                value={usageData.usage.templates.percentage} 
                className="h-3 mb-1"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{usageData.usage.templates.percentage}% used</span>
                <span>Resets {formatResetDate(usageData.resetDate)}</span>
              </div>
            </>
          )}
        </div>

        {/* Extractions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400 text-[20px]">code</span>
              <span className="text-white font-medium">Extractions</span>
            </div>
            <span className="text-gray-300">
              {usageData.usage.extractions.used}
              {usageData.usage.extractions.limit === -1 ? ' (Unlimited)' : `/${usageData.usage.extractions.limit}`}
            </span>
          </div>
          {usageData.usage.extractions.limit !== -1 && (
            <>
              <Progress 
                value={usageData.usage.extractions.percentage} 
                className="h-3 mb-1"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{usageData.usage.extractions.percentage}% used</span>
                <span>Resets {formatResetDate(usageData.resetDate)}</span>
              </div>
            </>
          )}
        </div>

        {/* Upgrade CTA */}
        {showUpgradeCTA && usageData.upgradeAvailable && (
          <div className="pt-4 border-t border-gray-700">
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-indigo-400">rocket_launch</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold">Upgrade to Pro</h4>
                  <p className="text-gray-400 text-sm">Get unlimited integrations and templates</p>
                </div>
              </div>
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
                onClick={() => window.open('/pricing', '_blank')}
              >
                View Pricing Plans
              </Button>
            </div>
          </div>
        )}

        {/* High usage warning */}
        {usageData.tier === 'free' && (
          usageData.usage.integrations.percentage >= 80 ||
          usageData.usage.templates.percentage >= 80 ||
          usageData.usage.extractions.percentage >= 80
        ) && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-yellow-400 text-[16px]">warning</span>
              <span className="text-yellow-400 font-medium text-sm">Usage Warning</span>
            </div>
            <p className="text-yellow-300 text-xs">
              You&apos;re approaching your monthly limits. Consider upgrading to avoid interruptions.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}