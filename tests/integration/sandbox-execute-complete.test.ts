/**
 * Comprehensive Integration Test for Task 7.3: POST /api/sandbox/execute
 * 
 * This test verifies all requirements from the spec:
 * - Request validation
 * - Language support (JavaScript, TypeScript)
 * - Environment selection (lambda vs fargate)
 * - Timeout enforcement
 * - Error handling
 * - Code size limits
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/sandbox/execute/route';
import { NextRequest } from 'next/server';
import * as lambdaExecutor from '@/lib/sandbox/lambda-executor';
import * as fargateExecutor from '@/lib/sandbox/fargate-executor';

// Mock executors
vi.mock('@/lib/sandbox/lambda-executor');
vi.mock('@/lib/sandbox/fargate-executor');

describe('Task 7.3: POST /api/sandbox/execute - Complete Implementation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Request Validation', () => {
    it('should reject requests without code', async () => {
      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          language: 'javascript',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_REQUEST');
      expect(data.error.message).toContain('Code is required');
    });

    it('should reject requests without language', async () => {
      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("test");',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_REQUEST');
      expect(data.error.message).toContain('Language is required');
    });

    it('should reject code exceeding 100KB', async () => {
      const largeCode = 'a'.repeat(100001);
      
      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: largeCode,
          language: 'javascript',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('CODE_TOO_LARGE');
    });

    it('should reject invalid environment values', async () => {
      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("test");',
          language: 'javascript',
          environment: 'invalid',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_ENVIRONMENT');
    });
  });

  describe('Language Support', () => {
    it('should support JavaScript', async () => {
      vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
      vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
        success: true,
        output: 'JavaScript works!',
        executionTime: 100,
      });

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("JavaScript works!");',
          language: 'javascript',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.output).toBe('JavaScript works!');
    });

    it('should support TypeScript', async () => {
      vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
      vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
        success: true,
        output: 'TypeScript works!',
        executionTime: 150,
      });

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'const msg: string = "TypeScript works!"; console.log(msg);',
          language: 'typescript',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.output).toBe('TypeScript works!');
    });

    it('should reject Python (not supported in MVP)', async () => {
      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'print("Hello")',
          language: 'python',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_LANGUAGE');
    });

    it('should reject Go (not supported in MVP)', async () => {
      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'fmt.Println("Hello")',
          language: 'go',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_LANGUAGE');
    });
  });

  describe('Environment Selection', () => {
    it('should default to lambda environment', async () => {
      vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
      vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
        success: true,
        output: 'Test',
        executionTime: 100,
      });

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("Test");',
          language: 'javascript',
        }),
      });

      await POST(request);

      expect(lambdaExecutor.executeLambda).toHaveBeenCalled();
      expect(fargateExecutor.executeFargate).not.toHaveBeenCalled();
    });

    it('should use lambda when explicitly specified', async () => {
      vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
      vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
        success: true,
        output: 'Lambda',
        executionTime: 100,
      });

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("Lambda");',
          language: 'javascript',
          environment: 'lambda',
        }),
      });

      await POST(request);

      expect(lambdaExecutor.executeLambda).toHaveBeenCalled();
    });

    it('should use fargate when specified', async () => {
      vi.mocked(fargateExecutor.isFargateAvailable).mockReturnValue(true);
      vi.mocked(fargateExecutor.executeFargate).mockResolvedValue({
        success: true,
        taskArn: 'arn:aws:ecs:us-east-1:123456789012:task/cluster/abc123',
        status: 'PENDING',
      });

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("Fargate");',
          language: 'javascript',
          environment: 'fargate',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.taskArn).toBeDefined();
      expect(fargateExecutor.executeFargate).toHaveBeenCalled();
    });

    it('should return 503 when fargate is unavailable', async () => {
      vi.mocked(fargateExecutor.isFargateAvailable).mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("Test");',
          language: 'javascript',
          environment: 'fargate',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FARGATE_UNAVAILABLE');
    });
  });

  describe('Timeout Enforcement', () => {
    it('should enforce 15 second max timeout for lambda', async () => {
      vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
      vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
        success: true,
        output: 'Done',
        executionTime: 15000,
      });

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("Done");',
          language: 'javascript',
          timeout: 30000, // Request 30s but should be capped at 15s
          environment: 'lambda',
        }),
      });

      await POST(request);

      expect(lambdaExecutor.executeLambda).toHaveBeenCalledWith({
        code: 'console.log("Done");',
        language: 'javascript',
        timeout: 15000, // Capped at 15s
      });
    });

    it('should use default 15s timeout for lambda when not specified', async () => {
      vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
      vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
        success: true,
        output: 'Done',
        executionTime: 100,
      });

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("Done");',
          language: 'javascript',
          environment: 'lambda',
        }),
      });

      await POST(request);

      expect(lambdaExecutor.executeLambda).toHaveBeenCalledWith({
        code: 'console.log("Done");',
        language: 'javascript',
        timeout: 15000,
      });
    });

    it('should allow custom timeout within limits', async () => {
      vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
      vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
        success: true,
        output: 'Done',
        executionTime: 5000,
      });

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("Done");',
          language: 'javascript',
          timeout: 5000,
          environment: 'lambda',
        }),
      });

      await POST(request);

      expect(lambdaExecutor.executeLambda).toHaveBeenCalledWith({
        code: 'console.log("Done");',
        language: 'javascript',
        timeout: 5000,
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle execution errors gracefully', async () => {
      vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
      vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
        success: false,
        errors: ['SyntaxError: Unexpected token'],
        executionTime: 50,
      });

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("Hello',
          language: 'javascript',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.data.errors).toContain('SyntaxError: Unexpected token');
    });

    it('should handle lambda invocation failures', async () => {
      vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
      vi.mocked(lambdaExecutor.executeLambda).mockRejectedValue(
        new Error('Lambda invocation failed')
      );

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("Test");',
          language: 'javascript',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('LAMBDA_EXECUTION_FAILED');
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_JSON');
    });

    it('should fallback to mock execution when lambda unavailable', async () => {
      vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("Hello, World!");',
          language: 'javascript',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.output).toBeDefined();
      expect(lambdaExecutor.executeLambda).not.toHaveBeenCalled();
    });
  });

  describe('Response Format', () => {
    it('should return correct response format for successful execution', async () => {
      vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
      vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
        success: true,
        output: 'Hello, World!',
        executionTime: 100,
      });

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("Hello, World!");',
          language: 'javascript',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('output');
      expect(data.data).toHaveProperty('errors');
      expect(data.data).toHaveProperty('executionTime');
      expect(data.data).toHaveProperty('previewUrl');
    });

    it('should return correct error format', async () => {
      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          language: 'javascript',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error');
      expect(data.error).toHaveProperty('code');
      expect(data.error).toHaveProperty('message');
    });
  });
});
