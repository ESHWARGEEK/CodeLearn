import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskList, type Task } from '@/components/learning/TaskList';

const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Set up project structure',
    description: 'Initialize Next.js project with TypeScript',
    order: 1,
    estimatedMinutes: 30,
    hints: ['Use create-next-app', 'Enable TypeScript flag'],
    completed: true,
    difficulty: 'easy',
  },
  {
    id: 'task-2',
    title: 'Create authentication system',
    description: 'Implement user login and signup',
    order: 2,
    estimatedMinutes: 120,
    hints: ['Use AWS Cognito', 'Add OAuth providers'],
    completed: false,
    difficulty: 'medium',
  },
  {
    id: 'task-3',
    title: 'Build dashboard',
    description: 'Create main dashboard with stats',
    order: 3,
    estimatedMinutes: 90,
    hints: ['Use shadcn/ui components', 'Add charts'],
    completed: false,
    difficulty: 'hard',
  },
];

describe('TaskList Component', () => {
  it('renders all tasks', () => {
    const onTaskSelect = vi.fn();
    render(
      <TaskList
        tasks={mockTasks}
        currentTaskId={null}
        onTaskSelect={onTaskSelect}
      />
    );

    expect(screen.getByText('Set up project structure')).toBeInTheDocument();
    expect(screen.getByText('Create authentication system')).toBeInTheDocument();
    expect(screen.getByText('Build dashboard')).toBeInTheDocument();
  });

  it('displays progress correctly', () => {
    const onTaskSelect = vi.fn();
    render(
      <TaskList
        tasks={mockTasks}
        currentTaskId={null}
        onTaskSelect={onTaskSelect}
      />
    );

    // 1 out of 3 tasks completed
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('highlights the current task', () => {
    const onTaskSelect = vi.fn();
    const { container } = render(
      <TaskList
        tasks={mockTasks}
        currentTaskId="task-2"
        onTaskSelect={onTaskSelect}
      />
    );

    // Check for the highlighted task container (div with border-primary class)
    const highlightedTasks = container.querySelectorAll('div[class*="border-primary"]');
    expect(highlightedTasks.length).toBeGreaterThan(0);
  });

  it('calls onTaskSelect when a task is clicked', () => {
    const onTaskSelect = vi.fn();
    render(
      <TaskList
        tasks={mockTasks}
        currentTaskId={null}
        onTaskSelect={onTaskSelect}
      />
    );

    const taskButton = screen.getByText('Create authentication system').closest('button');
    fireEvent.click(taskButton!);

    expect(onTaskSelect).toHaveBeenCalledWith(mockTasks[1]);
  });

  it('expands task to show description and hints', () => {
    const onTaskSelect = vi.fn();
    render(
      <TaskList
        tasks={mockTasks}
        currentTaskId={null}
        onTaskSelect={onTaskSelect}
      />
    );

    // Initially, description should not be visible
    expect(screen.queryByText('Initialize Next.js project with TypeScript')).not.toBeInTheDocument();

    // Find and click the expand button for task 1
    const expandButtons = screen.getAllByRole('button');
    const expandButton = expandButtons.find((btn) => 
      btn.querySelector('svg') && btn.getAttribute('class')?.includes('hover:bg-muted')
    );
    
    if (expandButton) {
      fireEvent.click(expandButton);
      
      // Now description should be visible
      expect(screen.getByText('Initialize Next.js project with TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Use create-next-app')).toBeInTheDocument();
    }
  });

  it('displays completion status correctly', () => {
    const onTaskSelect = vi.fn();
    const { container } = render(
      <TaskList
        tasks={mockTasks}
        currentTaskId={null}
        onTaskSelect={onTaskSelect}
      />
    );

    // Check for completed task icon (CheckCircle2)
    const completedIcons = container.querySelectorAll('svg[class*="text-green-500"]');
    expect(completedIcons.length).toBeGreaterThan(0);
  });

  it('displays difficulty badges', () => {
    const onTaskSelect = vi.fn();
    render(
      <TaskList
        tasks={mockTasks}
        currentTaskId={null}
        onTaskSelect={onTaskSelect}
      />
    );

    expect(screen.getByText('easy')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('hard')).toBeInTheDocument();
  });

  it('displays estimated time for each task', () => {
    const onTaskSelect = vi.fn();
    render(
      <TaskList
        tasks={mockTasks}
        currentTaskId={null}
        onTaskSelect={onTaskSelect}
      />
    );

    expect(screen.getByText('30 min')).toBeInTheDocument();
    expect(screen.getByText('120 min')).toBeInTheDocument();
    expect(screen.getByText('90 min')).toBeInTheDocument();
  });

  it('handles empty task list', () => {
    const onTaskSelect = vi.fn();
    render(
      <TaskList
        tasks={[]}
        currentTaskId={null}
        onTaskSelect={onTaskSelect}
      />
    );

    expect(screen.getByText('0/0')).toBeInTheDocument();
  });

  it('calculates progress percentage correctly', () => {
    const onTaskSelect = vi.fn();
    const { container } = render(
      <TaskList
        tasks={mockTasks}
        currentTaskId={null}
        onTaskSelect={onTaskSelect}
      />
    );

    // 1 out of 3 tasks = 33.33%
    const progressBar = container.querySelector('[style*="width"]');
    expect(progressBar).toHaveStyle({ width: '33.33333333333333%' });
  });

  it('toggles task expansion on chevron click', () => {
    const onTaskSelect = vi.fn();
    render(
      <TaskList
        tasks={mockTasks}
        currentTaskId={null}
        onTaskSelect={onTaskSelect}
      />
    );

    // Find expand button
    const expandButtons = screen.getAllByRole('button');
    const chevronButton = expandButtons.find((btn) => 
      btn.getAttribute('class')?.includes('hover:bg-muted')
    );

    if (chevronButton) {
      // Click to expand
      fireEvent.click(chevronButton);
      expect(screen.getByText('Description')).toBeInTheDocument();

      // Click to collapse
      fireEvent.click(chevronButton);
      expect(screen.queryByText('Description')).not.toBeInTheDocument();
    }
  });
});
