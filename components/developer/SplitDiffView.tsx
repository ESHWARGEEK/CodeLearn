'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DiffLine {
  type: 'addition' | 'deletion' | 'context' | 'header';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

interface SplitDiffViewProps {
  filePath: string;
  changes: string;
  className?: string;
}

interface ParsedDiff {
  beforeLines: DiffLine[];
  afterLines: DiffLine[];
  maxLines: number;
}

const SplitDiffView: React.FC<SplitDiffViewProps> = ({ filePath, changes, className = '' }) => {
  const parsedDiff = useMemo(() => {
    return parseDiffContent(changes);
  }, [changes]);

  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      default:
        return 'text';
    }
  };

  const renderLineNumber = (lineNumber?: number) => (
    <span className="w-12 text-right text-gray-500 select-none text-xs font-mono pr-2">
      {lineNumber || ''}
    </span>
  );

  const renderDiffLine = (line: DiffLine, side: 'before' | 'after') => {
    let bgColor = '';
    let textColor = 'text-gray-300';
    let borderColor = 'border-transparent';

    if (line.type === 'addition') {
      bgColor = 'bg-emerald-500/10';
      textColor = 'text-emerald-300';
      borderColor = 'border-emerald-500/30';
    } else if (line.type === 'deletion') {
      bgColor = 'bg-red-500/10';
      textColor = 'text-red-300';
      borderColor = 'border-red-500/30';
    } else if (line.type === 'header') {
      bgColor = 'bg-blue-500/10';
      textColor = 'text-blue-300';
      borderColor = 'border-blue-500/30';
    }

    const lineNumber = side === 'before' ? line.oldLineNumber : line.newLineNumber;

    return (
      <div
        className={`flex font-mono text-sm ${bgColor} ${textColor} border-l-2 ${borderColor} min-h-[1.5rem] leading-6`}
      >
        {renderLineNumber(lineNumber)}
        <span className="flex-1 px-2 whitespace-pre-wrap break-all">
          {line.content || ' '}
        </span>
      </div>
    );
  };

  return (
    <Card className={`bg-[#1E293B] border-[#334155] ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-sm">
          <span className="material-symbols-outlined text-[16px]">difference</span>
          {filePath}
          <span className="ml-auto text-xs text-gray-400">
            {getLanguageFromPath(filePath)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="bg-[#0F172A] rounded-b-lg overflow-hidden">
          <div className="grid grid-cols-2 border-b border-gray-700">
            {/* Before Header */}
            <div className="px-4 py-2 bg-red-500/10 border-r border-gray-700">
              <div className="flex items-center gap-2 text-sm text-red-300">
                <span className="material-symbols-outlined text-[16px]">remove</span>
                Before
              </div>
            </div>
            {/* After Header */}
            <div className="px-4 py-2 bg-emerald-500/10">
              <div className="flex items-center gap-2 text-sm text-emerald-300">
                <span className="material-symbols-outlined text-[16px]">add</span>
                After
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 max-h-96 overflow-y-auto">
            {/* Before Column */}
            <div className="border-r border-gray-700">
              {parsedDiff.beforeLines.map((line, index) => (
                <div key={`before-${index}`}>
                  {renderDiffLine(line, 'before')}
                </div>
              ))}
            </div>

            {/* After Column */}
            <div>
              {parsedDiff.afterLines.map((line, index) => (
                <div key={`after-${index}`}>
                  {renderDiffLine(line, 'after')}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Parse unified diff format into split view format
function parseDiffContent(diffContent: string): ParsedDiff {
  const lines = diffContent.split('\n');
  const beforeLines: DiffLine[] = [];
  const afterLines: DiffLine[] = [];
  
  let oldLineNumber = 1;
  let newLineNumber = 1;
  let inHunk = false;

  for (const line of lines) {
    if (line.startsWith('@@')) {
      // Hunk header - extract line numbers
      const match = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/);
      if (match) {
        oldLineNumber = parseInt(match[1], 10);
        newLineNumber = parseInt(match[2], 10);
        inHunk = true;
        
        // Add header line to both sides
        beforeLines.push({
          type: 'header',
          content: line,
          oldLineNumber: undefined,
          newLineNumber: undefined,
        });
        afterLines.push({
          type: 'header',
          content: line,
          oldLineNumber: undefined,
          newLineNumber: undefined,
        });
      }
      continue;
    }

    if (!inHunk) continue;

    if (line.startsWith('-')) {
      // Deletion - only show in before column
      beforeLines.push({
        type: 'deletion',
        content: line.slice(1),
        oldLineNumber: oldLineNumber++,
        newLineNumber: undefined,
      });
      // Add empty line to after column to maintain alignment
      afterLines.push({
        type: 'context',
        content: '',
        oldLineNumber: undefined,
        newLineNumber: undefined,
      });
    } else if (line.startsWith('+')) {
      // Addition - only show in after column
      afterLines.push({
        type: 'addition',
        content: line.slice(1),
        oldLineNumber: undefined,
        newLineNumber: newLineNumber++,
      });
      // Add empty line to before column to maintain alignment
      beforeLines.push({
        type: 'context',
        content: '',
        oldLineNumber: undefined,
        newLineNumber: undefined,
      });
    } else {
      // Context line - show in both columns
      const content = line.startsWith(' ') ? line.slice(1) : line;
      beforeLines.push({
        type: 'context',
        content,
        oldLineNumber: oldLineNumber++,
        newLineNumber: undefined,
      });
      afterLines.push({
        type: 'context',
        content,
        oldLineNumber: undefined,
        newLineNumber: newLineNumber++,
      });
    }
  }

  return {
    beforeLines,
    afterLines,
    maxLines: Math.max(beforeLines.length, afterLines.length),
  };
}

export default SplitDiffView;