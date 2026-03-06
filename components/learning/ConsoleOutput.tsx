'use client';

import React from 'react';
import { Terminal, AlertCircle, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConsoleOutputItem {
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: number;
}

interface ConsoleOutputProps {
  output?: string;
  errors?: string[];
  consoleOutput?: ConsoleOutputItem[];
  executionTime?: number;
}

export function ConsoleOutput({
  output,
  errors = [],
  consoleOutput = [],
  executionTime,
}: ConsoleOutputProps) {
  const hasContent = output || errors.length > 0 || consoleOutput.length > 0;

  const getIcon = (type: ConsoleOutputItem['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getTextColor = (type: ConsoleOutputItem['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-400';
      case 'warn':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-400';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-950 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-slate-400" />
          <span className="font-semibold text-slate-200">Console</span>
        </div>
        {executionTime !== undefined && (
          <span className="text-xs text-slate-400">
            Executed in {executionTime}ms
          </span>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 font-mono text-xs">
          {!hasContent && (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <Terminal className="mb-2 h-8 w-8" />
              <p>No output yet</p>
              <p className="mt-1 text-xs">Run your code to see console output</p>
            </div>
          )}

          {/* Display structured console output if available */}
          {consoleOutput.length > 0 && (
            <div className="space-y-1">
              {consoleOutput.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  {getIcon(item.type)}
                  <span className={getTextColor(item.type)}>{item.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Display raw output if no structured output */}
          {consoleOutput.length === 0 && output && (
            <div className="whitespace-pre-wrap text-gray-300">
              {output}
            </div>
          )}

          {/* Display errors */}
          {errors.length > 0 && (
            <div className="mt-4 space-y-2">
              {errors.map((error, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 rounded border border-red-900/50 bg-red-950/20 p-2"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                  <span className="text-red-400">{error}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
