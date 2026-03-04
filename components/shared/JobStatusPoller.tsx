'use client';

import { useEffect, useState } from 'react';

interface JobStatusPollerProps {
  jobId: string;
  onComplete: (result: unknown) => void;
  onError: (error: string) => void;
  pollInterval?: number; // milliseconds
}

type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

interface JobData {
  jobId: string;
  status: JobStatus;
  progress: number; // 0-100
  result?: unknown;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export default function JobStatusPoller({
  jobId,
  onComplete,
  onError,
  pollInterval = 2000,
}: JobStatusPollerProps) {
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const pollJobStatus = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        const data = await response.json();

        if (data.success && data.data) {
          setJobData(data.data);

          if (data.data.status === 'completed') {
            clearInterval(intervalId);
            onComplete(data.data.result);
          } else if (data.data.status === 'failed') {
            clearInterval(intervalId);
            onError(data.data.error || 'Job failed');
          }
        } else {
          throw new Error(data.error?.message || 'Failed to fetch job status');
        }
      } catch (error) {
        clearInterval(intervalId);
        onError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    // Initial poll
    pollJobStatus();

    // Set up polling interval
    intervalId = setInterval(pollJobStatus, pollInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [jobId, pollInterval, onComplete, onError]);

  const handleCancel = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/cancel`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        setIsCancelled(true);
        onError('Job cancelled by user');
      }
    } catch (error) {
      console.error('Failed to cancel job:', error);
    }
  };

  if (!jobData) {
    return (
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400 text-sm">Initializing...</p>
      </div>
    );
  }

  const statusColors = {
    queued: 'text-gray-400',
    processing: 'text-indigo-400',
    completed: 'text-emerald-400',
    failed: 'text-red-400',
  };

  const statusIcons = {
    queued: 'schedule',
    processing: 'sync',
    completed: 'check_circle',
    failed: 'error',
  };

  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
      {/* Status header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`material-symbols-outlined ${statusColors[jobData.status]} ${jobData.status === 'processing' ? 'animate-spin' : ''}`}
          >
            {statusIcons[jobData.status]}
          </span>
          <span className={`font-medium ${statusColors[jobData.status]} capitalize`}>
            {jobData.status}
          </span>
        </div>
        {jobData.status === 'processing' && !isCancelled && (
          <button
            onClick={handleCancel}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Progress bar */}
      {(jobData.status === 'queued' || jobData.status === 'processing') && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Progress</span>
            <span>{jobData.progress}%</span>
          </div>
          <div className="h-2 w-full bg-[#0F172A] rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${jobData.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Status message */}
      <div className="mt-4">
        {jobData.status === 'queued' && (
          <p className="text-sm text-gray-400">
            Your request is in the queue. This usually takes a few seconds...
          </p>
        )}
        {jobData.status === 'processing' && (
          <p className="text-sm text-gray-400">
            AI is working on your request. This may take a minute...
          </p>
        )}
        {jobData.status === 'completed' && (
          <p className="text-sm text-emerald-400">✓ Job completed successfully!</p>
        )}
        {jobData.status === 'failed' && (
          <p className="text-sm text-red-400">
            ✗ {jobData.error || 'Job failed. Please try again.'}
          </p>
        )}
        {isCancelled && <p className="text-sm text-gray-400">Job cancelled by user.</p>}
      </div>

      {/* Job metadata */}
      <div className="mt-4 pt-4 border-t border-[#334155] text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Job ID:</span>
          <span className="font-mono">{jobData.jobId}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Started:</span>
          <span>{new Date(jobData.createdAt).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
