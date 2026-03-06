/**
 * Unit tests for Sandbox Result Handler
 */

import { describe, it, expect } from 'vitest';
import {
  formatExecutionResult,
  sanitizeOutput,
  sanitizeErrors,
  categorizeError,
  parseConsoleOutput,
  generateUserFriendlyError,
  validateExecutionResult,
  mergeExecutionResults,
  type ExecutionResult,
} from '@/lib/sandbox/result-handler';

describe('Result Handler', () => {
  describe('formatExecutionResult', () => {
    it('should format successful execution result', () => {
      const result: ExecutionResult = {
        success: true,
        output: 'Hello, World!',
        executionTime: 100,
      };

      const formatted = formatExecutionResult(result, Date.now() - 100);

      expect(formatted.success).toBe(true);
      expect(formatted.data).toBeDefined();
      expect(formatted.data?.output).toBe('Hello, World!');
      expect(formatted.data?.errors).toEqual([]);
      expect(formatted.data?.executionTime).toBe(100);
      expect(formatted.data?.previewUrl).toBeNull();
    });

    it('should format failed execution result', () => {
      const result: ExecutionResult = {
        success: false,
        errors: ['SyntaxError: Unexpected token'],
        executionTime: 50,
      };

      const formatted = formatExecutionResult(result, Date.now() - 50);

      expect(formatted.success).toBe(false);
      expect(formatted.data).toBeDefined();
      expect(formatted.data?.errors).toContain('SyntaxError: Unexpected token');
    });

    it('should include metrics', () => {
      const startTime = Date.now();
      const result: ExecutionResult = {
        success: true,
        output: 'Done',
      };

      // Add small delay to ensure duration > 0
      const formatted = formatExecutionResult(result, startTime - 1);

      expect(formatted.data?.metrics).toBeDefined();
      expect(formatted.data?.metrics?.startTime).toBe(startTime - 1);
      expect(formatted.data?.metrics?.duration).toBeGreaterThan(0);
    });

    it('should include console output if present', () => {
      const result: ExecutionResult = {
        success: true,
        output: 'Test',
        consoleOutput: [
          { type: 'log', message: 'Hello', timestamp: Date.now() },
        ],
      };

      const formatted = formatExecutionResult(result, Date.now());

      expect(formatted.data?.consoleOutput).toBeDefined();
      expect(formatted.data?.consoleOutput?.length).toBe(1);
    });
  });

  describe('sanitizeOutput', () => {
    it('should return empty string for empty input', () => {
      expect(sanitizeOutput('')).toBe('');
    });

    it('should escape HTML characters', () => {
      const output = '<script>alert("xss")</script>';
      const sanitized = sanitizeOutput(output);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
    });

    it('should remove ANSI escape codes', () => {
      const output = '\u001b[31mRed text\u001b[0m';
      const sanitized = sanitizeOutput(output);

      expect(sanitized).not.toContain('\u001b');
      expect(sanitized).toContain('Red text');
    });

    it('should truncate output exceeding 10KB', () => {
      const largeOutput = 'a'.repeat(11 * 1024);
      const sanitized = sanitizeOutput(largeOutput);

      expect(sanitized.length).toBeLessThan(largeOutput.length);
      expect(sanitized).toContain('[Output truncated');
    });

    it('should handle special characters', () => {
      const output = 'Test & "quotes" <tags>';
      const sanitized = sanitizeOutput(output);

      expect(sanitized).toContain('&amp;');
      expect(sanitized).toContain('&quot;');
      expect(sanitized).toContain('&lt;');
      expect(sanitized).toContain('&gt;');
    });
  });

  describe('sanitizeErrors', () => {
    it('should sanitize array of errors', () => {
      const errors = [
        'Error at /home/user123/project/file.js',
        '<script>alert("xss")</script>',
      ];

      const sanitized = sanitizeErrors(errors);

      expect(sanitized[0]).toContain('/home/user');
      expect(sanitized[0]).not.toContain('user123');
      expect(sanitized[1]).not.toContain('<script>');
      expect(sanitized[1]).toContain('&lt;script&gt;');
    });

    it('should truncate long error messages', () => {
      const longError = 'Error: ' + 'a'.repeat(2000);
      const sanitized = sanitizeErrors([longError]);

      expect(sanitized[0].length).toBeLessThan(longError.length);
      expect(sanitized[0]).toContain('[truncated]');
    });

    it('should remove Windows file paths', () => {
      const error = 'Error at C:\\Users\\john\\project\\file.js';
      const sanitized = sanitizeErrors([error]);

      expect(sanitized[0]).toContain('C:\\Users\\user');
      expect(sanitized[0]).not.toContain('john');
    });

    it('should remove Mac file paths', () => {
      const error = 'Error at /Users/jane/project/file.js';
      const sanitized = sanitizeErrors([error]);

      expect(sanitized[0]).toContain('/Users/user');
      expect(sanitized[0]).not.toContain('jane');
    });
  });

  describe('categorizeError', () => {
    it('should categorize syntax errors', () => {
      const result = categorizeError('SyntaxError: Unexpected token');
      expect(result.category).toBe('syntax');
      expect(result.severity).toBe('medium');
    });

    it('should categorize runtime errors', () => {
      const result = categorizeError('ReferenceError: x is not defined');
      expect(result.category).toBe('runtime');
      expect(result.severity).toBe('medium');
    });

    it('should categorize timeout errors', () => {
      const result = categorizeError('Execution timed out after 15 seconds');
      expect(result.category).toBe('timeout');
      expect(result.severity).toBe('high');
    });

    it('should categorize memory errors', () => {
      const result = categorizeError('JavaScript heap out of memory');
      expect(result.category).toBe('memory');
      expect(result.severity).toBe('high');
    });

    it('should categorize network errors', () => {
      const result = categorizeError('Network request failed: ECONNREFUSED');
      expect(result.category).toBe('network');
      expect(result.severity).toBe('low');
    });

    it('should categorize unknown errors', () => {
      const result = categorizeError('Something went wrong');
      expect(result.category).toBe('unknown');
      expect(result.severity).toBe('medium');
    });
  });

  describe('parseConsoleOutput', () => {
    it('should parse empty output', () => {
      const result = parseConsoleOutput('');
      expect(result).toEqual([]);
    });

    it('should parse log messages', () => {
      const output = 'Hello, World!\nTest message';
      const result = parseConsoleOutput(output);

      expect(result.length).toBe(2);
      expect(result[0].type).toBe('log');
      expect(result[0].message).toBe('Hello, World!');
      expect(result[1].message).toBe('Test message');
    });

    it('should detect error messages', () => {
      const output = '[ERROR] Something went wrong\nError: Failed';
      const result = parseConsoleOutput(output);

      expect(result[0].type).toBe('error');
      expect(result[0].message).toBe('Something went wrong');
      expect(result[1].type).toBe('error');
    });

    it('should detect warning messages', () => {
      const output = '[WARN] Deprecated function used';
      const result = parseConsoleOutput(output);

      expect(result[0].type).toBe('warn');
      expect(result[0].message).toBe('Deprecated function used');
    });

    it('should detect info messages', () => {
      const output = '[INFO] Process started';
      const result = parseConsoleOutput(output);

      expect(result[0].type).toBe('info');
      expect(result[0].message).toBe('Process started');
    });

    it('should include timestamps', () => {
      const output = 'Test message';
      const result = parseConsoleOutput(output);

      expect(result[0].timestamp).toBeDefined();
      expect(typeof result[0].timestamp).toBe('number');
    });
  });

  describe('generateUserFriendlyError', () => {
    it('should handle empty errors', () => {
      const message = generateUserFriendlyError([]);
      expect(message).toContain('unknown error');
    });

    it('should generate friendly message for syntax errors', () => {
      const message = generateUserFriendlyError(['SyntaxError: Unexpected token']);
      expect(message).toContain('Syntax error');
      expect(message).toContain('brackets');
    });

    it('should generate friendly message for runtime errors', () => {
      const message = generateUserFriendlyError(['ReferenceError: x is not defined']);
      expect(message).toContain('Runtime error');
      expect(message).toContain('variables');
    });

    it('should generate friendly message for timeout errors', () => {
      const message = generateUserFriendlyError(['Execution timed out']);
      expect(message).toContain('timed out');
      expect(message).toContain('infinite loop');
    });

    it('should generate friendly message for memory errors', () => {
      const message = generateUserFriendlyError(['Out of memory']);
      expect(message).toContain('memory');
      expect(message).toContain('reducing');
    });

    it('should generate friendly message for network errors', () => {
      const message = generateUserFriendlyError(['Network error: ECONNREFUSED']);
      expect(message).toContain('Network');
      expect(message).toContain('restricted');
    });

    it('should return original error for unknown types', () => {
      const originalError = 'Custom error message';
      const message = generateUserFriendlyError([originalError]);
      expect(message).toBe(originalError);
    });
  });

  describe('validateExecutionResult', () => {
    it('should validate correct result structure', () => {
      const result: ExecutionResult = {
        success: true,
        output: 'Test',
        executionTime: 100,
      };

      expect(validateExecutionResult(result)).toBe(true);
    });

    it('should reject null or undefined', () => {
      expect(validateExecutionResult(null)).toBe(false);
      expect(validateExecutionResult(undefined)).toBe(false);
    });

    it('should reject non-object values', () => {
      expect(validateExecutionResult('string')).toBe(false);
      expect(validateExecutionResult(123)).toBe(false);
      expect(validateExecutionResult(true)).toBe(false);
    });

    it('should reject missing success field', () => {
      const result = { output: 'Test' };
      expect(validateExecutionResult(result)).toBe(false);
    });

    it('should reject invalid success type', () => {
      const result = { success: 'true' };
      expect(validateExecutionResult(result)).toBe(false);
    });

    it('should reject invalid output type', () => {
      const result = { success: true, output: 123 };
      expect(validateExecutionResult(result)).toBe(false);
    });

    it('should reject invalid errors type', () => {
      const result = { success: false, errors: 'error string' };
      expect(validateExecutionResult(result)).toBe(false);
    });

    it('should accept result with optional fields', () => {
      const result: ExecutionResult = {
        success: true,
        output: 'Test',
        errors: ['Error 1'],
        executionTime: 100,
        previewUrl: 'https://example.com',
      };

      expect(validateExecutionResult(result)).toBe(true);
    });
  });

  describe('mergeExecutionResults', () => {
    it('should handle empty array', () => {
      const merged = mergeExecutionResults([]);
      expect(merged.success).toBe(false);
      expect(merged.errors).toContain('No execution results to merge');
    });

    it('should return single result unchanged', () => {
      const result: ExecutionResult = {
        success: true,
        output: 'Test',
        executionTime: 100,
      };

      const merged = mergeExecutionResults([result]);
      expect(merged).toEqual(result);
    });

    it('should merge multiple successful results', () => {
      const results: ExecutionResult[] = [
        { success: true, output: 'Step 1', executionTime: 100 },
        { success: true, output: 'Step 2', executionTime: 150 },
      ];

      const merged = mergeExecutionResults(results);

      expect(merged.success).toBe(true);
      expect(merged.output).toContain('Step 1');
      expect(merged.output).toContain('Step 2');
      expect(merged.executionTime).toBe(250);
    });

    it('should mark as failed if any result failed', () => {
      const results: ExecutionResult[] = [
        { success: true, output: 'Step 1', executionTime: 100 },
        { success: false, errors: ['Error in step 2'], executionTime: 50 },
      ];

      const merged = mergeExecutionResults(results);

      expect(merged.success).toBe(false);
      expect(merged.errors).toContain('Error in step 2');
    });

    it('should combine all errors', () => {
      const results: ExecutionResult[] = [
        { success: false, errors: ['Error 1'], executionTime: 50 },
        { success: false, errors: ['Error 2', 'Error 3'], executionTime: 75 },
      ];

      const merged = mergeExecutionResults(results);

      expect(merged.errors?.length).toBe(3);
      expect(merged.errors).toContain('Error 1');
      expect(merged.errors).toContain('Error 2');
      expect(merged.errors).toContain('Error 3');
    });

    it('should sum execution times', () => {
      const results: ExecutionResult[] = [
        { success: true, executionTime: 100 },
        { success: true, executionTime: 200 },
        { success: true, executionTime: 300 },
      ];

      const merged = mergeExecutionResults(results);

      expect(merged.executionTime).toBe(600);
    });
  });
});
