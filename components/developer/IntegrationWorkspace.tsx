'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import JobStatusPoller from '@/components/shared/JobStatusPoller';
import SplitDiffView from '@/components/developer/SplitDiffView';

interface IntegrationWorkspaceProps {
  integrationId: string;
  jobId: string;
}

interface DiffFile {
  path: string;
  changes: string;
  additions: number;
  deletions: number;
}

interface IntegrationDiff {
  additions: number;
  deletions: number;
  files: DiffFile[];
}

interface IntegrationPreview {
  diff: IntegrationDiff;
  previewUrl: string;
  explanation: string;
}

interface IntegrationWorkspaceState {
  diff: IntegrationDiff | null;
  previewUrl: string | null;
  explanation: string | null;
  loading: boolean;
  error: string | null;
  selectedFile: string | null;
  isApproving: boolean;
  isUndoing: boolean;
  jobCompleted: boolean;
}

const initialState: IntegrationWorkspaceState = {
  diff: null,
  previewUrl: null,
  explanation: null,
  loading: true,
  error: null,
  selectedFile: null,
  isApproving: false,
  isUndoing: false,
  jobCompleted: false,
};

export default function IntegrationWorkspace({ jobId }: IntegrationWorkspaceProps) {
  const [state, setState] = useState<IntegrationWorkspaceState>(initialState);

  const handleJobComplete = async (result: unknown) => {
    console.log('Job completed with result:', result);
    try {
      setState(prev => ({ ...prev, jobCompleted: true }));
      
      // Fetch the integration preview
      const response = await fetch(`/api/developer/integration/${jobId}/preview`);
      const data = await response.json();

      if (data.success) {
        const preview = data.data as IntegrationPreview;
        setState(prev => ({
          ...prev,
          diff: preview.diff,
          previewUrl: preview.previewUrl,
          explanation: preview.explanation,
          loading: false,
          selectedFile: preview.diff.files[0]?.path || null,
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: data.error?.message || 'Failed to load integration preview',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Network error. Please try again.',
      }));
    }
  };

  const handleJobError = (error: string) => {
    setState(prev => ({
      ...prev,
      loading: false,
      error,
      jobCompleted: false,
    }));
  };

  const handleApprove = async () => {
    setState(prev => ({ ...prev, isApproving: true }));

    try {
      const response = await fetch(`/api/developer/integration/${jobId}/approve`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        // Show success message or redirect
        setState(prev => ({ ...prev, isApproving: false }));
        // TODO: Show success toast and redirect to project
      } else {
        setState(prev => ({
          ...prev,
          isApproving: false,
          error: data.error?.message || 'Failed to approve integration',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isApproving: false,
        error: 'Network error. Please try again.',
      }));
    }
  };

  const handleUndo = async () => {
    setState(prev => ({ ...prev, isUndoing: true }));

    try {
      const response = await fetch(`/api/developer/integration/${jobId}/undo`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        // Reset to initial state or redirect
        setState(initialState);
        // TODO: Show undo success message
      } else {
        setState(prev => ({
          ...prev,
          isUndoing: false,
          error: data.error?.message || 'Failed to undo integration',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isUndoing: false,
        error: 'Network error. Please try again.',
      }));
    }
  };

  const handleFileSelect = (filePath: string) => {
    setState(prev => ({ ...prev, selectedFile: filePath }));
  };

  if (!state.jobCompleted) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Integration Workspace</h1>
          <p className="text-gray-400">
            AI is analyzing your template and preparing the integration...
          </p>
        </div>

        <JobStatusPoller
          jobId={jobId}
          onComplete={handleJobComplete}
          onError={handleJobError}
        />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Integration Workspace</h1>
        </div>

        <Card className="bg-[#1E293B] border-[#334155]">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-red-400 text-2xl">error</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Integration Failed</h3>
            <p className="text-red-400 mb-4">{state.error}</p>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state.loading || !state.diff) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Integration Workspace</h1>
        </div>

        <Card className="bg-[#1E293B] border-[#334155]">
          <CardContent className="text-center py-12">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading integration preview...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedFileData = state.diff.files.find(f => f.path === state.selectedFile);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Integration Preview</h1>
          <p className="text-gray-400 mt-1">
            Review the changes and approve the integration when ready
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleUndo}
            disabled={state.isUndoing}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            {state.isUndoing ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[16px] mr-2">
                  sync
                </span>
                Undoing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px] mr-2">undo</span>
                Undo
              </>
            )}
          </Button>
          <Button
            onClick={handleApprove}
            disabled={state.isApproving}
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            {state.isApproving ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[16px] mr-2">
                  sync
                </span>
                Approving...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px] mr-2">check</span>
                Approve Integration
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-400">add</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{state.diff.additions}</div>
                <div className="text-sm text-gray-400">Additions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1E293B] border-[#334155]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-red-400">remove</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{state.diff.deletions}</div>
                <div className="text-sm text-gray-400">Deletions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1E293B] border-[#334155]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-indigo-400">description</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{state.diff.files.length}</div>
                <div className="text-sm text-gray-400">Files Changed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* File List Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-[#1E293B] border-[#334155]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="material-symbols-outlined">folder</span>
                Changed Files
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {state.diff.files.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => handleFileSelect(file.path)}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      state.selectedFile === file.path
                        ? 'bg-indigo-500/20 text-indigo-300 border-r-2 border-indigo-500'
                        : 'text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">
                        {file.path.endsWith('.tsx') || file.path.endsWith('.jsx')
                          ? 'code'
                          : file.path.endsWith('.css')
                          ? 'palette'
                          : 'description'}
                      </span>
                      <span className="truncate">{file.path}</span>
                    </div>
                    <div className="flex gap-2 mt-1 text-xs">
                      <span className="text-emerald-400">+{file.additions}</span>
                      <span className="text-red-400">-{file.deletions}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* AI Explanation Panel */}
          {state.explanation && (
            <Card className="bg-[#1E293B] border-[#334155]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <span className="material-symbols-outlined">psychology</span>
                  AI Explanation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">{state.explanation}</p>
              </CardContent>
            </Card>
          )}

          {/* Split Diff View */}
          {selectedFileData && (
            <SplitDiffView
              filePath={selectedFileData.path}
              changes={selectedFileData.changes}
            />
          )}

          {/* Live Preview */}
          {state.previewUrl && (
            <Card className="bg-[#1E293B] border-[#334155]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <span className="material-symbols-outlined">preview</span>
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="bg-white rounded-b-lg overflow-hidden">
                  <iframe
                    src={state.previewUrl}
                    className="w-full h-96 border-0"
                    title="Integration Preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}