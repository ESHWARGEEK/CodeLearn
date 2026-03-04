'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink, Monitor, Tablet, Smartphone, Loader2 } from 'lucide-react';

interface LivePreviewProps {
  previewUrl: string | null;
  loading?: boolean;
  error?: string | null;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const viewportSizes = {
  desktop: { width: '100%', height: '100%', icon: Monitor, label: 'Desktop' },
  tablet: { width: '768px', height: '100%', icon: Tablet, label: 'Tablet' },
  mobile: { width: '375px', height: '100%', icon: Smartphone, label: 'Mobile' },
};

export function LivePreview({ previewUrl, loading = false, error = null }: LivePreviewProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    setIframeLoaded(false);
    setIframeKey((prev) => prev + 1);
  }, [previewUrl]);

  const handleRefresh = () => {
    setIframeLoaded(false);
    setIframeKey((prev) => prev + 1);
  };

  const handleOpenInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleIframeLoad = () => {
    setIframeLoaded(true);
  };

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-background px-4 py-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Preview</h3>
          {previewUrl && (
            <div className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
              <span className="text-xs text-green-600 dark:text-green-400">Live</span>
            </div>
          )}
        </div>

        {previewUrl && (
          <div className="flex items-center gap-2">
            {/* Viewport Selector */}
            <div className="flex items-center gap-1 rounded-lg border bg-background p-1">
              {(Object.keys(viewportSizes) as ViewportSize[]).map((size) => {
                const ViewportIcon = viewportSizes[size].icon;
                return (
                  <button
                    key={size}
                    onClick={() => setViewport(size)}
                    className={`rounded p-1.5 transition-colors ${
                      viewport === size
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    title={viewportSizes[size].label}
                  >
                    <ViewportIcon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              title="Refresh preview"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Preview Content */}
      <div className="relative flex flex-1 items-center justify-center overflow-auto p-4">
        {loading && (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Executing code...</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex max-w-md flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <svg
                className="h-6 w-6 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-destructive">Execution Failed</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        {!previewUrl && !loading && !error && (
          <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
            <div className="rounded-full bg-muted p-4">
              <Monitor className="h-8 w-8" />
            </div>
            <div>
              <p className="font-medium">No Preview Available</p>
              <p className="mt-1 text-sm">Run your code to see the preview</p>
            </div>
          </div>
        )}

        {previewUrl && !loading && !error && (
          <div
            className="relative flex h-full w-full items-center justify-center"
            style={{
              maxWidth: viewport === 'desktop' ? '100%' : viewportSizes[viewport].width,
            }}
          >
            {!iframeLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <iframe
              key={iframeKey}
              src={previewUrl}
              className="h-full w-full rounded-lg border bg-white shadow-sm"
              title="Code Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
              onLoad={handleIframeLoad}
              style={{
                opacity: iframeLoaded ? 1 : 0,
                transition: 'opacity 0.2s ease-in-out',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
