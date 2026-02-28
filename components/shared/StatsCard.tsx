'use client';

import { useEffect, useState } from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  trend?: string;
  badge?: string;
  color?: 'indigo' | 'violet' | 'pink' | 'emerald';
}

const colorClasses = {
  indigo: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    hover: 'group-hover:bg-indigo-500',
    border: 'hover:border-indigo-500/30',
    trendBg: 'bg-emerald-500/10',
    trendText: 'text-emerald-400',
  },
  violet: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
    hover: 'group-hover:bg-violet-500',
    border: 'hover:border-violet-500/30',
    trendBg: 'bg-emerald-500/10',
    trendText: 'text-emerald-400',
  },
  pink: {
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
    hover: 'group-hover:bg-pink-500',
    border: 'hover:border-pink-500/30',
    trendBg: 'bg-gray-500/10',
    trendText: 'text-gray-500',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    hover: 'group-hover:bg-emerald-500',
    border: 'hover:border-emerald-500/30',
    trendBg: 'bg-emerald-500/10',
    trendText: 'text-emerald-400',
  },
};

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  badge,
  color = 'indigo',
}: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState<number | string>(0);
  const colors = colorClasses[color];

  // Animated number counter
  useEffect(() => {
    if (typeof value === 'number') {
      let start = 0;
      const end = value;
      const duration = 1000; // 1 second
      const increment = end / (duration / 16); // 60fps

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayValue(end);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  return (
    <div
      className={`bg-[#1E293B] p-5 rounded-xl border border-[#334155] ${colors.border} transition-colors group`}
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-2 ${colors.bg} rounded-lg ${colors.text} ${colors.hover} group-hover:text-white transition-colors`}
        >
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        {trend && (
          <span
            className={`text-xs font-medium ${colors.trendText} flex items-center gap-1 ${colors.trendBg} px-2 py-1 rounded`}
          >
            <span className="material-symbols-outlined text-[14px]">trending_up</span> {trend}
          </span>
        )}
        {badge && <span className="text-xs font-medium text-gray-500">{badge}</span>}
      </div>
      <div className="font-heading text-3xl font-bold text-white mb-1">{displayValue}</div>
      <p className="text-sm text-gray-400">{title}</p>
    </div>
  );
}
