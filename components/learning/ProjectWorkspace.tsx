'use client';

import { useState, useEffect, useRef } from 'react';
import { MonacoEditor } from './MonacoEditor';
import { Button } from '@/components/ui/button';
import { Play, Save, Loader2, Check } from 'lucide-react';

interface ProjectWorkspaceProps {
  projectId: string;
  userId: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
  hints: string[];
  completed: boolean;
}

export function ProjectWorkspace({ projectId, userId }: ProjectWorkspaceProps) {
  const [code, setCode] = useState<string>('// Start coding here...\n');
  const [language] = useState<string>('typescript');
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedCodeRef = useRef<string>('// Start coding here...\n');

  useEffect(() => {
    loadProjectData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const loadProjectData = async () => {
    try {
      const tasksResponse = await fetch(`/api/learning/project/${projectId}/tasks`);
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        if (tasksData.success && tasksData.data?.tasks) {
          setTasks(tasksData.data.tasks);
          if (tasksData.data.tasks.length > 0) {
            setCurrentTask(tasksData.data.tasks[0]);
          }
        }
      }

      const codeResponse = await fetch(`/api/learning/project/${projectId}/code`);
      if (codeResponse.ok) {
        const codeData = await codeResponse.json();
        if (codeData.success && codeData.data?.code) {
          setCode(codeData.data.code);
          lastSavedCodeRef.current = codeData.data.code;
        }
      }
    } catch (error) {
      console.error('Failed to load project data:', error);
    }
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);

    // Reset auto-save timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Only set up auto-save if code is different from placeholder and last saved
    const isPlaceholder = newCode === '// Start coding here...\n';
    const isChanged = newCode !== lastSavedCodeRef.current;

    if (!isPlaceholder && isChanged) {
      setAutoSaveStatus('idle');
      autoSaveTimerRef.current = setTimeout(() => {
        performAutoSave(newCode);
      }, 30000);
    }
  };

  const performAutoSave = async (codeToSave: string) => {
    setAutoSaveStatus('saving');
    try {
      const response = await fetch(`/api/learning/project/${projectId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: currentTask?.id,
          code: codeToSave,
          completed: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to auto-save code');
      }

      lastSavedCodeRef.current = codeToSave;
      setAutoSaveStatus('saved');

      // Reset status after 2 seconds
      setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('idle');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/learning/project/${projectId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: currentTask?.id,
          code,
          completed: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save code');
      }

      lastSavedCodeRef.current = code;
      setAutoSaveStatus('saved');
      setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRun = async () => {
    setIsExecuting(true);
    setConsoleOutput([]);

    try {
      const response = await fetch('/api/sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          timeout: 15000,
          environment: 'lambda',
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        if (result.data.output) {
          setConsoleOutput((prev) => [...prev, result.data.output]);
        }
        if (result.data.errors && result.data.errors.length > 0) {
          setConsoleOutput((prev) => [...prev, ...result.data.errors.map((e: string) => `Error: ${e}`)]);
        }
        if (result.data.previewUrl) {
          setPreviewUrl(result.data.previewUrl);
        }
      } else {
        setConsoleOutput(['Execution failed. Please try again.']);
      }
    } catch (error) {
      console.error('Execution failed:', error);
      setConsoleOutput(['Failed to execute code. Please check your code and try again.']);
    } finally {
      setIsExecuting(false);
    }
  };

  console.log('Project workspace for user:', userId);

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center justify-between border-b bg-background px-4 py-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Project Workspace</h2>
          {currentTask && (
            <span className="text-sm text-muted-foreground">
              Task {currentTask.order}: {currentTask.title}
            </span>
          )}
          {autoSaveStatus === 'saving' && (
            <span className="flex items-center gap-1 text-xs text-amber-600">
              <Loader2 className="h-3 w-3 animate-spin" />
              Auto-saving...
            </span>
          )}
          {autoSaveStatus === 'saved' && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <Check className="h-3 w-3" />
              Auto-saved ✓
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>

          <Button size="sm" onClick={handleRun} disabled={isExecuting}>
            {isExecuting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/5 overflow-y-auto border-r bg-muted/30 p-4">
          <h3 className="mb-4 text-sm font-semibold">Tasks</h3>
          <div className="space-y-2">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => setCurrentTask(task)}
                className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                  currentTask?.id === task.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-background hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      task.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                  <span className="font-medium">Task {task.order}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{task.title}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex w-1/2 flex-col">
          <div className="flex-1">
            <MonacoEditor
              code={code}
              language={language}
              onChange={handleCodeChange}
              onSave={handleSave}
            />
          </div>

          {consoleOutput.length > 0 && (
            <div className="h-32 overflow-y-auto border-t bg-black p-2 font-mono text-xs text-green-400">
              {consoleOutput.map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          )}
        </div>

        <div className="w-[30%] border-l bg-muted/30 p-4">
          <h3 className="mb-4 text-sm font-semibold">Preview</h3>
          {previewUrl ? (
            <iframe
              src={previewUrl}
              className="h-full w-full rounded-lg border bg-white"
              title="Code Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Run your code to see the preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
