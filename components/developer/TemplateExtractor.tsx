'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import JobStatusPoller from '@/components/shared/JobStatusPoller';
import { ExtractableComponent, ExtractionResult } from '@/types/templates';
import { validateGitHubUrl } from '@/lib/utils/github-url-validator';

interface TemplateExtractorState {
  repoUrl: string;
  analyzing: boolean;
  jobId: string | null;
  components: ExtractableComponent[];
  selectedComponent: ExtractableComponent | null;
  error: string | null;
  repositoryInfo: {
    name: string;
    description: string;
    stars: number;
    language: string;
    license: string;
  } | null;
}

const initialState: TemplateExtractorState = {
  repoUrl: '',
  analyzing: false,
  jobId: null,
  components: [],
  selectedComponent: null,
  error: null,
  repositoryInfo: null,
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

const complexityColors = {
  simple: 'text-emerald-400',
  moderate: 'text-yellow-400',
  complex: 'text-red-400',
};

const complexityIcons = {
  simple: 'radio_button_unchecked',
  moderate: 'adjust',
  complex: 'radio_button_checked',
};

export default function TemplateExtractor() {
  const [state, setState] = useState<TemplateExtractorState>(initialState);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({
      ...prev,
      repoUrl: e.target.value,
      error: null,
    }));
  };

  const handleAnalyze = async () => {
    if (!state.repoUrl.trim()) {
      setState(prev => ({
        ...prev,
        error: 'Please enter a GitHub repository URL',
      }));
      return;
    }

    // Use the comprehensive GitHub URL validator
    const validation = validateGitHubUrl(state.repoUrl);
    if (!validation.isValid) {
      setState(prev => ({
        ...prev,
        error: validation.error || 'Invalid GitHub URL',
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      analyzing: true,
      error: null,
      components: [],
      selectedComponent: null,
      repositoryInfo: null,
    }));

    try {
      const response = await fetch('/api/developer/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubUrl: validation.normalizedUrl, // Use normalized URL
        }),
      });

      const data = await response.json();

      if (data.success) {
        setState(prev => ({
          ...prev,
          jobId: data.data.jobId,
        }));
      } else {
        setState(prev => ({
          ...prev,
          analyzing: false,
          error: data.error?.message || 'Failed to start analysis',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        analyzing: false,
        error: 'Network error. Please try again.',
      }));
    }
  };

  const handleJobComplete = (result: unknown) => {
    const extractionResult = result as ExtractionResult;
    setState(prev => ({
      ...prev,
      analyzing: false,
      jobId: null,
      components: extractionResult.components,
      repositoryInfo: extractionResult.repositoryInfo,
    }));
  };

  const handleJobError = (error: string) => {
    setState(prev => ({
      ...prev,
      analyzing: false,
      jobId: null,
      error,
    }));
  };

  const handleComponentSelect = (component: ExtractableComponent) => {
    setState(prev => ({
      ...prev,
      selectedComponent: component,
    }));
  };

  const handleExtract = async () => {
    if (!state.selectedComponent) return;

    try {
      const response = await fetch('/api/developer/extract/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubUrl: state.repoUrl,
          componentId: state.selectedComponent.id,
          componentData: state.selectedComponent,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Reset state after successful extraction
        setState(initialState);
        // TODO: Show success message or redirect to template library
      } else {
        setState(prev => ({
          ...prev,
          error: data.error?.message || 'Failed to extract template',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Network error. Please try again.',
      }));
    }
  };

  const handleReset = () => {
    setState(initialState);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Template Extractor</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Extract reusable components from any GitHub repository and add them to your template library.
          Our AI analyzes the codebase and suggests the best components for extraction. Supports HTTPS and SSH URL formats.
        </p>
      </div>

      {/* URL Input Section */}
      <Card className="bg-[#1E293B] border-[#334155]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <span className="material-symbols-outlined">link</span>
            GitHub Repository
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              type="url"
              placeholder="https://github.com/owner/repo (supports HTTPS and SSH formats)"
              value={state.repoUrl}
              onChange={handleUrlChange}
              className="flex-1 bg-[#0F172A] border-[#334155] text-white placeholder:text-gray-500"
              disabled={state.analyzing}
            />
            <Button
              onClick={handleAnalyze}
              disabled={state.analyzing || !state.repoUrl.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6"
            >
              {state.analyzing ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[16px] mr-2">
                    sync
                  </span>
                  Analyzing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px] mr-2">
                    search
                  </span>
                  Analyze
                </>
              )}
            </Button>
          </div>

          {state.error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {state.error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Status Poller */}
      {state.jobId && (
        <JobStatusPoller
          jobId={state.jobId}
          onComplete={handleJobComplete}
          onError={handleJobError}
        />
      )}

      {/* Repository Info */}
      {state.repositoryInfo && (
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="material-symbols-outlined">info</span>
              Repository Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-white mb-1">{state.repositoryInfo.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{state.repositoryInfo.description}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Language:</span>
                  <span className="text-white">{state.repositoryInfo.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Stars:</span>
                  <span className="text-white">{state.repositoryInfo.stars.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">License:</span>
                  <span className="text-white">{state.repositoryInfo.license}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Components List */}
      {state.components.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Extractable Components ({state.components.length})
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <span className="material-symbols-outlined text-[16px] mr-1">refresh</span>
              Start Over
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {state.components.map((component) => (
              <Card
                key={component.id}
                className={`bg-[#1E293B] border-[#334155] cursor-pointer transition-all duration-200 hover:border-gray-500 ${
                  state.selectedComponent?.id === component.id
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : ''
                }`}
                onClick={() => handleComponentSelect(component)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                            categoryColors[component.category] || 'bg-gray-500/20 text-gray-300'
                          }`}
                        >
                          {component.category.replace('-', ' ')}
                        </span>
                        <div className="flex items-center gap-1">
                          <span
                            className={`material-symbols-outlined text-[14px] ${
                              complexityColors[component.complexity]
                            }`}
                          >
                            {complexityIcons[component.complexity]}
                          </span>
                          <span
                            className={`text-xs capitalize ${
                              complexityColors[component.complexity]
                            }`}
                          >
                            {component.complexity}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-white mb-1">{component.name}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                        {component.description}
                      </p>
                      <div className="text-xs text-gray-500">
                        <span className="material-symbols-outlined text-[12px] mr-1">folder</span>
                        {component.filePath}
                      </div>
                    </div>
                    {state.selectedComponent?.id === component.id && (
                      <div className="flex items-center justify-center w-6 h-6 bg-indigo-500 rounded-full shrink-0">
                        <span className="material-symbols-outlined text-white text-[14px]">
                          check
                        </span>
                      </div>
                    )}
                  </div>

                  {component.dependencies.length > 0 && (
                    <div className="pt-2 border-t border-gray-700">
                      <div className="text-xs text-gray-400 mb-1">Dependencies:</div>
                      <div className="flex flex-wrap gap-1">
                        {component.dependencies.slice(0, 3).map((dep, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-[10px]"
                          >
                            {dep}
                          </span>
                        ))}
                        {component.dependencies.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-[10px]">
                            +{component.dependencies.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Component Preview and Extract */}
      {state.selectedComponent && (
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">preview</span>
                Component Preview
              </div>
              <Button
                onClick={handleExtract}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <span className="material-symbols-outlined text-[16px] mr-2">download</span>
                Extract Template
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-white mb-2">{state.selectedComponent.name}</h3>
                <p className="text-gray-400 mb-4">{state.selectedComponent.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400 mb-1">File Path:</div>
                  <div className="text-white font-mono bg-[#0F172A] p-2 rounded">
                    {state.selectedComponent.filePath}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Category:</div>
                  <div className="text-white capitalize">
                    {state.selectedComponent.category.replace('-', ' ')}
                  </div>
                </div>
              </div>

              {state.selectedComponent.dependencies.length > 0 && (
                <div>
                  <div className="text-gray-400 mb-2">Dependencies:</div>
                  <div className="flex flex-wrap gap-2">
                    {state.selectedComponent.dependencies.map((dep, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                      >
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!state.analyzing && !state.jobId && state.components.length === 0 && !state.error && (
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-gray-400 text-2xl">
                code_blocks
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Ready to Extract Templates</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Enter a GitHub repository URL above to get started. Our AI will analyze the codebase
              and suggest the best components for extraction.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}