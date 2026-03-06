/**
 * Unit tests for Lambda Executor
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { executeLambda, isLambdaAvailable, setLambdaClient } from '@/lib/sandbox/lambda-executor';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

describe('Lambda Executor', () => {
  let mockSend: ReturnType<typeof vi.fn>;
  let mockClient: LambdaClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSend = vi.fn();
    
    // Create mock Lambda client
    mockClient = {
      send: mockSend,
    } as any;
    
    // Inject mock client
    setLambdaClient(mockClient);
  });

  afterEach(() => {
    // Reset to null after each test
    setLambdaClient(null);
  });

  describe('executeLambda', () => {
    it('should execute code successfully', async () => {
      mockSend.mockResolvedValue({
        Payload: new TextEncoder().encode(
          JSON.stringify({
            success: true,
            output: 'Hello, World!',
            executionTime: 100,
          })
        ),
      });

      const result = await executeLambda({
        code: 'console.log("Hello, World!");',
        language: 'javascript',
      });

      expect(result.success).toBe(true);
      expect(result.output).toBe('Hello, World!');
      expect(result.executionTime).toBe(100);
      expect(mockSend).toHaveBeenCalledWith(expect.any(InvokeCommand));
    });

    it('should handle execution errors', async () => {
      mockSend.mockResolvedValue({
        Payload: new TextEncoder().encode(
          JSON.stringify({
            success: false,
            errors: ['SyntaxError: Unexpected token'],
          })
        ),
      });

      const result = await executeLambda({
        code: 'console.log("Hello',
        language: 'javascript',
      });

      expect(result.success).toBe(false);
      expect(result.errors).toContain('SyntaxError: Unexpected token');
    });

    it('should handle Lambda function errors', async () => {
      mockSend.mockResolvedValue({
        FunctionError: 'Unhandled',
        Payload: new TextEncoder().encode(
          JSON.stringify({
            success: false,
            errors: ['Runtime error'],
          })
        ),
      });

      const result = await executeLambda({
        code: 'throw new Error("test");',
        language: 'javascript',
      });

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]).toContain('Lambda execution error');
    });

    it('should handle missing payload', async () => {
      mockSend.mockResolvedValue({});

      const result = await executeLambda({
        code: 'console.log("test");',
        language: 'javascript',
      });

      expect(result.success).toBe(false);
      expect(result.errors).toContain('No response from Lambda function');
    });

    it('should handle network errors', async () => {
      mockSend.mockRejectedValue(new Error('Network timeout'));

      const result = await executeLambda({
        code: 'console.log("test");',
        language: 'javascript',
      });

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Network timeout');
    });

    it('should pass timeout parameter', async () => {
      mockSend.mockResolvedValue({
        Payload: new TextEncoder().encode(
          JSON.stringify({
            success: true,
            output: '',
            executionTime: 5000,
          })
        ),
      });

      await executeLambda({
        code: 'console.log("test");',
        language: 'javascript',
        timeout: 10000,
      });

      expect(mockSend).toHaveBeenCalled();
      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs).toBeInstanceOf(InvokeCommand);
    });
  });

  describe('isLambdaAvailable', () => {
    it('should return true when function name is set', () => {
      process.env.SANDBOX_EXECUTOR_FUNCTION_NAME = 'test-function';
      expect(isLambdaAvailable()).toBe(true);
    });

    it('should return false when function name is not set', () => {
      delete process.env.SANDBOX_EXECUTOR_FUNCTION_NAME;
      expect(isLambdaAvailable()).toBe(false);
    });
  });
});
