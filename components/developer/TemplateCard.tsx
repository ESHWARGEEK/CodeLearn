'use client';

import React from 'react';
import Link from 'next/link';
import { Template } from '@/types/templates';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface TemplateCardProps {
  template: Template;
  onIntegrate?: (templateId: string) => void;
  onPreview?: (templateId: string) => void;
}

const technologyIcons: Record<string, string> = {
  react: '⚛️',
  vue: '💚',
  nextjs: '▲',
  nodejs: '🟢',
  typescript: '🔷',
  javascript: '💛',
  tailwind: '🎨',
  express: '🚂',
};

const categoryColors: Record<string, string> = {
  authentication: 'bg-red-500/20 text-red-300',
  'ui-components': 'bg-blue-500/20 text-blue-300',
  'api-integration': 'bg-green-500/20 text-green-300',
  'data-visualization': 'bg-purple-500/20 text-purple-300',
  forms: 'bg-yellow-500/20 text-yellow-300',
  navigation: 'bg-indigo-500/20 text-indigo-300',
  layout: 'bg-pink-500/20 text-pink-300',
  utilities: 'bg-gray-500/20 text-gray-300',
  hooks: 'bg-orange-500/20 text-orange-300',
  'state-management': 'bg-cyan-500/20 text-cyan-300',
};

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}

function renderStars(rating: number): JSX.Element[] {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <span key={i} className="text-yellow-400">
        ★
      </span>
    );
  }

  if (hasHalfStar) {
    stars.push(
      <span key="half" className="text-yellow-400">
        ☆
      </span>
    );
  }

  const remainingStars = 5 - Math.ceil(rating);
  for (let i = 0; i < remainingStars; i++) {
    stars.push(
      <span key={`empty-${i}`} className="text-gray-600">
        ☆
      </span>
    );
  }

  return stars;
}

export default function TemplateCard({ template, onIntegrate, onPreview }: TemplateCardProps) {
  const handleIntegrate = () => {
    onIntegrate?.(template.id);
  };

  const handlePreview = () => {
    onPreview?.(template.id);
  };

  return (
    <Card className="bg-[#1E293B] border-[#334155] hover:border-gray-500 transition-all duration-200 overflow-hidden group">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700">
              <span className="text-xl">
                {technologyIcons[template.technology] || '📦'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                    categoryColors[template.category] || 'bg-gray-500/20 text-gray-300'
                  }`}
                >
                  {template.category.replace('-', ' ')}
                </span>
                <span className="text-gray-500 text-xs">• {template.technology}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                {template.name}
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2">{template.description}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {renderStars(template.rating)}
              <span className="text-sm text-gray-400 ml-1">
                {template.rating.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <span className="material-symbols-outlined text-[16px]">download</span>
              {formatNumber(template.downloads)}
            </div>
          </div>
          <Link
            href={template.sourceRepo}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-indigo-400 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            Source
          </Link>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <span className="material-symbols-outlined text-[16px] mr-1">visibility</span>
            Preview
          </Button>
          <Button
            size="sm"
            onClick={handleIntegrate}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            <span className="material-symbols-outlined text-[16px] mr-1">integration_instructions</span>
            Integrate
          </Button>
        </div>
      </div>
    </Card>
  );
}