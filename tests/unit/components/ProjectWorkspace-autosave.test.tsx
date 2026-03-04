import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { ProjectWorkspace } from '@/components/learning/ProjectWorkspace';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

// Mock Monaco Editor
vi.mock('@/components/learning/MonacoEditor', () => ({
  MonacoEditor: ({ code, onChange }: { code: string; onChange: (code: string) => void }) => (
    <textarea
      data-testid="monaco-editor"
      value={code}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

describe('ProjectWorkspace - Auto-save', () => {
  const mockProjectId = 'test-project-123';
  const mockUserId = 'test-user-456';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Mock initial data loading
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/tasks')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              tasks: [
                {
                  id: 'task-1',
                  title: 'Setup Project',
                  description: 'Initialize the project',
                  order: 1,
                  estimatedMinutes: 30,
                  hints: ['Use create-next-app'],
                  completed: false,
                },
              ],
            },
          }),
        });
      }
      
      if (url.includes('/code')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              code: '// Initial code\n',
            },
          }),
        });
      }
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should auto-save code after 30 seconds of inactivity', async () => {
    const { container } = render(
      <ProjectWorkspace projectId={mockProjectId} userId={mockUserId} />
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });

    // Clear initial fetch calls
    vi.clearAllMocks();

    // Simulate code change
    const editor = screen.getByTestId('monaco-editor');
    await act(async () => {
      editor.dispatchEvent(
        new Event('change', { bubbles: true })
      );
      (editor as HTMLTextAreaElement).value = '// New code\nconsole.log("test");';
    });

    // Fast-forward 30 seconds
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    // Verify auto-save was called
    await waitFor(() => {
      const saveCalls = (global.fetch as any).mock.calls.filter(
        (call: any) => call[0].includes('/save') && call[1]?.method === 'POST'
      );
      expect(saveCalls.length).toBeGreaterThan(0);
    });
  });

  it('should display "Auto-saving..." status during auto-save', async () => {
    render(<ProjectWorkspace projectId={mockProjectId} userId={mockUserId} />);

    await waitFor(() => {
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });

    // Mock slow save response
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/save')) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({ success: true }),
            });
          }, 1000);
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    });

    // Simulate code change
    const editor = screen.getByTestId('monaco-editor');
    await act(async () => {
      (editor as HTMLTextAreaElement).value = '// Changed code';
      editor.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Fast-forward to trigger auto-save
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    // Check for auto-saving status
    await waitFor(() => {
      expect(screen.getByText(/Auto-saving.../i)).toBeInTheDocument();
    });
  });

  it('should display "Auto-saved ✓" after successful auto-save', async () => {
    render(<ProjectWorkspace projectId={mockProjectId} userId={mockUserId} />);

    await waitFor(() => {
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });

    // Simulate code change
    const editor = screen.getByTestId('monaco-editor');
    await act(async () => {
      (editor as HTMLTextAreaElement).value = '// Changed code';
      editor.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Fast-forward to trigger auto-save
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    // Wait for save to complete
    await waitFor(() => {
      expect(screen.getByText(/Auto-saved ✓/i)).toBeInTheDocument();
    });
  });

  it('should reset auto-save timer when code changes', async () => {
    render(<ProjectWorkspace projectId={mockProjectId} userId={mockUserId} />);

    await waitFor(() => {
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });

    vi.clearAllMocks();

    const editor = screen.getByTestId('monaco-editor');

    // First change
    await act(async () => {
      (editor as HTMLTextAreaElement).value = '// First change';
      editor.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Advance 20 seconds
    await act(async () => {
      vi.advanceTimersByTime(20000);
    });

    // Second change (should reset timer)
    await act(async () => {
      (editor as HTMLTextAreaElement).value = '// Second change';
      editor.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Advance another 20 seconds (total 40s, but timer was reset)
    await act(async () => {
      vi.advanceTimersByTime(20000);
    });

    // Should not have saved yet (only 20s since last change)
    const saveCalls = (global.fetch as any).mock.calls.filter(
      (call: any) => call[0].includes('/save')
    );
    expect(saveCalls.length).toBe(0);

    // Advance final 10 seconds to complete 30s from last change
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    // Now it should have saved
    await waitFor(() => {
      const saveCallsAfter = (global.fetch as any).mock.calls.filter(
        (call: any) => call[0].includes('/save')
      );
      expect(saveCallsAfter.length).toBeGreaterThan(0);
    });
  });

  it('should not auto-save if code has not changed', async () => {
    render(<ProjectWorkspace projectId={mockProjectId} userId={mockUserId} />);

    await waitFor(() => {
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });

    vi.clearAllMocks();

    // Fast-forward 30 seconds without changing code
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    // Should not have called save
    const saveCalls = (global.fetch as any).mock.calls.filter(
      (call: any) => call[0].includes('/save')
    );
    expect(saveCalls.length).toBe(0);
  });

  it('should not auto-save default placeholder code', async () => {
    // Mock empty code response
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/code')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              code: '// Start coding here...\n',
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { tasks: [] } }),
      });
    });

    render(<ProjectWorkspace projectId={mockProjectId} userId={mockUserId} />);

    await waitFor(() => {
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });

    vi.clearAllMocks();

    // Fast-forward 30 seconds
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    // Should not have called save for placeholder code
    const saveCalls = (global.fetch as any).mock.calls.filter(
      (call: any) => call[0].includes('/save')
    );
    expect(saveCalls.length).toBe(0);
  });

  it('should update lastSavedCode after manual save', async () => {
    render(<ProjectWorkspace projectId={mockProjectId} userId={mockUserId} />);

    await waitFor(() => {
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });

    // Change code
    const editor = screen.getByTestId('monaco-editor');
    await act(async () => {
      (editor as HTMLTextAreaElement).value = '// Manual save test';
      editor.dispatchEvent(new Event('change', { bubbles: true }));
    });

    vi.clearAllMocks();

    // Click manual save button
    const saveButton = screen.getByRole('button', { name: /Save/i });
    await act(async () => {
      saveButton.click();
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/save'),
        expect.any(Object)
      );
    });

    // Fast-forward 30 seconds
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    // Should not auto-save again since code hasn't changed since manual save
    const saveCallsAfter = (global.fetch as any).mock.calls.filter(
      (call: any) => call[0].includes('/save')
    );
    expect(saveCallsAfter.length).toBe(1); // Only the manual save
  });

  it('should handle auto-save errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<ProjectWorkspace projectId={mockProjectId} userId={mockUserId} />);

    await waitFor(() => {
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });

    // Mock save failure
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/save')) {
        return Promise.resolve({
          ok: false,
          status: 500,
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    });

    // Change code
    const editor = screen.getByTestId('monaco-editor');
    await act(async () => {
      (editor as HTMLTextAreaElement).value = '// Error test';
      editor.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Fast-forward to trigger auto-save
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    // Should not crash, just log error
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Auto-save failed:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('should cleanup timer on unmount', async () => {
    const { unmount } = render(
      <ProjectWorkspace projectId={mockProjectId} userId={mockUserId} />
    );

    await waitFor(() => {
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });

    // Change code
    const editor = screen.getByTestId('monaco-editor');
    await act(async () => {
      (editor as HTMLTextAreaElement).value = '// Unmount test';
      editor.dispatchEvent(new Event('change', { bubbles: true }));
    });

    vi.clearAllMocks();

    // Unmount before auto-save triggers
    unmount();

    // Fast-forward 30 seconds
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    // Should not have called save after unmount
    const saveCalls = (global.fetch as any).mock.calls.filter(
      (call: any) => call[0].includes('/save')
    );
    expect(saveCalls.length).toBe(0);
  });
});
