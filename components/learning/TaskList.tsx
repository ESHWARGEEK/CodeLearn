'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Task {
  id: string;
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
  hints: string[];
  completed: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface TaskListProps {
  tasks: Task[];
  currentTaskId: string | null;
  onTaskSelect: (task: Task) => void;
}

export function TaskList({ tasks, currentTaskId, onTaskSelect }: TaskListProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'hard':
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  const completedCount = tasks.filter((task) => task.completed).length;
  const progressPercentage = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="flex h-full flex-col">
      {/* Header with Progress */}
      <div className="border-b p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Tasks</h3>
          <span className="text-xs text-muted-foreground">
            {completedCount}/{tasks.length}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {tasks.map((task) => {
            const isExpanded = expandedTasks.has(task.id);
            const isActive = currentTaskId === task.id;

            return (
              <div
                key={task.id}
                className={cn(
                  'rounded-lg border transition-all',
                  isActive
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border bg-background hover:bg-muted/50'
                )}
              >
                {/* Task Header */}
                <div className="flex items-start gap-3 p-3">
                  {/* Completion Status */}
                  <div className="mt-0.5 flex-shrink-0">
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Task Info */}
                  <button
                    onClick={() => onTaskSelect(task)}
                    className="flex-1 space-y-1 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        Task {task.order}
                      </span>
                      {task.difficulty && (
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-medium',
                            getDifficultyColor(task.difficulty)
                          )}
                        >
                          {task.difficulty}
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-sm font-medium leading-tight">
                      {task.title}
                    </h4>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{task.estimatedMinutes} min</span>
                    </div>
                  </button>

                  {/* Expand/Collapse Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskExpansion(task.id);
                    }}
                    className="flex-shrink-0 rounded p-1 hover:bg-muted"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t bg-muted/30 p-3 text-sm">
                    <div className="space-y-3">
                      {/* Description */}
                      <div>
                        <h5 className="mb-1 text-xs font-semibold text-muted-foreground">
                          Description
                        </h5>
                        <p className="text-sm leading-relaxed">
                          {task.description}
                        </p>
                      </div>

                      {/* Hints */}
                      {task.hints && task.hints.length > 0 && (
                        <div>
                          <h5 className="mb-1 text-xs font-semibold text-muted-foreground">
                            Hints
                          </h5>
                          <ul className="space-y-1">
                            {task.hints.map((hint, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-sm"
                              >
                                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                                <span className="leading-relaxed">{hint}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
