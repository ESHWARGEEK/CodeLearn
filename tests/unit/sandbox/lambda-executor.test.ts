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

    it('should enforce maximum timeout of 15 seconds', async () => {
      mockSend.mockResolvedValue({
        Payload: new TextEncoder().encode(
          JSON.stringify({
            success: true,
            output: '',
            executionTime: 10000,
          })
        ),
      });

      const result = await executeLambda({
        code: 'console.log("test");',
        language: 'javascript',
        timeout: 10000, // Request 10 seconds (within limit)
      });

      expect(result.success).toBe(true);
      expect(result.resourceLimits?.timeout).toBe(10000);
      expect(result.resourceLimits?.enforced).toBe(true);
    });

    it('should reject timeout exceeding limits', async () => {
      const result = await executeLambda({
        code: 'console.log("test");',
        language: 'javascript',
        timeout: 20000, // Exceeds 15s limit
      });

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]).toContain('Requested timeout 20000ms exceeds maximum 15000ms');
    });

    it('should reject memory exceeding limits', async () => {
      const result = await executeLambda({
        code: 'console.log("test");',
        language: 'javascript',
        memory: 1024, // Exceeds 512MB limit
      });

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]).toContain('Requested memory 1024MB exceeds maximum 512MB');
    });

    it('should include resource limit information in response', async () => {
      mockSend.mockResolvedValue({
        Payload: new TextEncoder().encode(
          JSON.stringify({
            success: true,
            output: 'test',
            executionTime: 100,
          })
        ),
      });

      const result = await executeLambda({
        code: 'console.log("test");',
        language: 'javascript',
      });

      expect(result.success).toBe(true);
      expect(result.resourceLimits).toBeDefined();
      expect(result.resourceLimits?.memory).toBe(512);
      expect(result.resourceLimits?.timeout).toBe(15000);
      expect(result.resourceLimits?.enforced).toBe(true);
    });

    it('should truncate large output', async () => {
      // Create output larger than 1 MB
      const largeOutput = 'x'.repeat(2 * 1024 * 1024);
      
      mockSend.mockResolvedValue({
        Payload: new TextEncoder().encode(
          JSON.stringify({
            success: true,
            output: largeOutput,
            executionTime: 100,
          })
        ),
      });

      const result = await executeLambda({
        code: 'console.log("test");',
        language: 'javascript',
      });

      expect(result.success).toBe(true);
      expect(result.output).toContain('[Output truncated: exceeded maximum size limit]');
      expect(Buffer.byteLength(result.output || '', 'utf8')).toBeLessThanOrEqual(1024 * 1024);
      expect(result.errors).toContain('Output was truncated due to size limits');
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
