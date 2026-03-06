/**
 * Unit tests for ConsoleOutput component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConsoleOutput } from '@/components/learning/ConsoleOutput';

describe('ConsoleOutput', () => {
  it('should render empty state when no content', () => {
    render(<ConsoleOutput />);

    expect(screen.getByText('No output yet')).toBeInTheDocument();
    expect(screen.getByText('Run your code to see console output')).toBeInTheDocument();
  });

  it('should display raw output', () => {
    render(<ConsoleOutput output="Hello, World!" />);

    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });

  it('should display errors', () => {
    const errors = ['SyntaxError: Unexpected token', 'ReferenceError: x is not defined'];
    render(<ConsoleOutput errors={errors} />);

    expect(screen.getByText('SyntaxError: Unexpected token')).toBeInTheDocument();
    expect(screen.getByText('ReferenceError: x is not defined')).toBeInTheDocument();
  });

  it('should display structured console output', () => {
    const consoleOutput = [
      { type: 'log' as const, message: 'Log message', timestamp: Date.now() },
      { type: 'error' as const, message: 'Error message', timestamp: Date.now() },
      { type: 'warn' as const, message: 'Warning message', timestamp: Date.now() },
      { type: 'info' as const, message: 'Info message', timestamp: Date.now() },
    ];

    render(<ConsoleOutput consoleOutput={consoleOutput} />);

    expect(screen.getByText('Log message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByText('Warning message')).toBeInTheDocument();
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('should display execution time', () => {
    render(<ConsoleOutput output="Done" executionTime={1234} />);

    expect(screen.getByText('Executed in 1234ms')).toBeInTheDocument();
  });

  it('should prefer structured output over raw output', () => {
    const consoleOutput = [
      { type: 'log' as const, message: 'Structured log', timestamp: Date.now() },
    ];

    render(
      <ConsoleOutput
        output="Raw output"
        consoleOutput={consoleOutput}
      />
    );

    expect(screen.getByText('Structured log')).toBeInTheDocument();
    expect(screen.queryByText('Raw output')).not.toBeInTheDocument();
  });

  it('should display both console output and errors', () => {
    const consoleOutput = [
      { type: 'log' as const, message: 'Before error', timestamp: Date.now() },
    ];
    const errors = ['Error occurred'];

    render(
      <ConsoleOutput
        consoleOutput={consoleOutput}
        errors={errors}
      />
    );

    expect(screen.getByText('Before error')).toBeInTheDocument();
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
  });

  it('should render console header', () => {
    render(<ConsoleOutput output="Test" />);

    expect(screen.getByText('Console')).toBeInTheDocument();
  });

  it('should handle empty arrays gracefully', () => {
    render(<ConsoleOutput errors={[]} consoleOutput={[]} />);

    expect(screen.getByText('No output yet')).toBeInTheDocument();
  });

  it('should handle multiline output', () => {
    const output = 'Line 1\nLine 2\nLine 3';
    render(<ConsoleOutput output={output} />);

    expect(screen.getByText(output)).toBeInTheDocument();
  });
});
