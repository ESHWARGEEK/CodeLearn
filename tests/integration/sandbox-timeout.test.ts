/**
 * Integration tests for Sandbox Timeout Enforcement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/sandbox/execute/route';
import { NextRequest } from 'next/server';
import * as lambdaExecutor from '@/lib/sandbox/lambda-executor';
import * as fargateExecutor from '@/lib/sandbox/fargate-executor';

// Mock executors
vi.mock('@/lib/sandbox/lambda-executor', () => ({
  executeLambda: vi.fn(),
  isLambdaAvailable: vi.fn(),
}));

vi.mock('@/lib/sandbox/fargate-executor', () => ({
  executeFargate: vi.fn(),
  isFargateAvailable: vi.fn(),
}));

describe('Sandbox Timeout Enforcement Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Lambda Timeout', () => {
    it('should enforce 15 second timeout for Lambda execution', async () => {
      vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
      vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
        success: true,
        output: 'Done',
        executionTime: 10000,
      });

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("test");',
          language: 'javascript',
          timeout: 30000, // Request 30 seconds
          environment: 'lambda',
        }),
      });

      await POST(request);

      // Should be called with capped timeout
      expect(lambdaExecutor.executeLambda).toHaveBeenCalledWith({
        code: 'console.log("test");',
        language: 'javascript',
        timeout: 15000, // Capped at 15 seconds
      });
    });

    it('should handle Lambda timeout errors gracefully', async () => {
      vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
      vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
        success: false,
        errors: ['Execution timeout: Code exceeded 15000ms limit'],
        executionTime: 15000,
      });

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'while(true) {}',
          language: 'javascript',
          environment: 'lambda',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.data.errors).toBeDefined();
      expect(data.data.errors[0]).toContain('timeout');
    });

    it('should use default 15 second timeout when not specified', async () => {
      vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
      vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
        success: true,
        output: 'Done',
        executionTime: 1000,
      });

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("test");',
          language: 'javascript',
          environment: 'lambda',
          // No timeout specified
        }),
      });

      await POST(request);

      expect(lambdaExecutor.executeLambda).toHaveBeenCalledWith({
        code: 'console.log("test");',
        language: 'javascript',
        timeout: 15000, // Default timeout
      });
    });
  });

  describe('Fargate Timeout', () => {
    it('should enforce 30 minute timeout for Fargate execution', async () => {
      vi.mocked(fargateExecutor.isFargateAvailable).mockReturnValue(true);
      vi.mocked(fargateExecutor.executeFargate).mockResolvedValue({
        success: true,
        taskArn: 'arn:aws:ecs:us-east-1:123456789012:task/test/abc123',
        status: 'PENDING',
      });

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("test");',
          language: 'javascript',
          timeout: 7200000, // Request 2 hours
          environment: 'fargate',
        }),
      });

      await POST(request);

      // Should be called with capped timeout
      expect(fargateExecutor.executeFargate).toHaveBeenCalledWith({
        code: 'console.log("test");',
        language: 'javascript',
        timeout: 1800000, // Capped at 30 minutes
      });
    });

    it('should use default 30 minute timeout for Fargate when not specified', async () => {
      vi.mocked(fargateExecutor.isFargateAvailable).mockReturnValue(true);
      vi.mocked(fargateExecutor.executeFargate).mockResolvedValue({
        success: true,
        taskArn: 'arn:aws:ecs:us-east-1:123456789012:task/test/abc123',
        status: 'PENDING',
      });

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("test");',
          language: 'javascript',
          environment: 'fargate',
          // No timeout specified
        }),
      });

      await POST(request);

      expect(fargateExecutor.executeFargate).toHaveBeenCalledWith({
        code: 'console.log("test");',
        language: 'javascript',
        timeout: 1800000, // Default 30 minutes
      });
    });

    it('should allow custom timeout less than maximum', async () => {
      vi.mocked(fargateExecutor.isFargateAvailable).mockReturnValue(true);
      vi.mocked(fargateExecutor.executeFargate).mockResolvedValue({
        success: true,
        taskArn: 'arn:aws:ecs:us-east-1:123456789012:task/test/abc123',
        status: 'PENDING',
      });

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("test");',
          language: 'javascript',
          timeout: 600000, // 10 minutes
          environment: 'fargate',
        }),
      });

      await POST(request);

      expect(fargateExecutor.executeFargate).toHaveBeenCalledWith({
        code: 'console.log("test");',
        language: 'javascript',
        timeout: 600000, // Should not be capped
      });
    });
  });

  describe('Timeout Error Messages', () => {
    it('should provide user-friendly timeout error for Lambda', async () => {
      vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
      vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
        success: false,
        errors: ['Execution timeout: Code exceeded 15000ms limit'],
        executionTime: 15000,
      });

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'while(true) {}',
          language: 'javascript',
          environment: 'lambda',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.data.errors[0]).toMatch(/timeout|exceeded.*limit/i);
    });

    it('should provide clear timeout information in response', async () => {
      vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
      vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
        success: false,
        errors: ['Execution timeout: Code exceeded 15000ms limit'],
        executionTime: 15000,
      });

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'while(true) {}',
          language: 'javascript',
          environment: 'lambda',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.data.executionTime).toBe(15000);
      expect(data.data.errors).toHaveLength(1);
      expect(data.data.errors[0]).toContain('15000ms');
    });
  });
});
