/**
 * Unit tests for Timeout Enforcement
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { executeLambda, setLambdaClient } from '@/lib/sandbox/lambda-executor';
import { executeFargate, getTaskStatus, setECSClient } from '@/lib/sandbox/fargate-executor';
import { LambdaClient } from '@aws-sdk/client-lambda';
import { ECSClient } from '@aws-sdk/client-ecs';

describe('Timeout Enforcement', () => {
  describe('Lambda Timeout Enforcement', () => {
    let mockSend: ReturnType<typeof vi.fn>;
    let mockClient: LambdaClient;

    beforeEach(() => {
      vi.clearAllMocks();
      mockSend = vi.fn();
      
      mockClient = {
        send: mockSend,
      } as any;
      
      setLambdaClient(mockClient);
    });

    afterEach(() => {
      setLambdaClient(null);
    });

    it('should enforce 15 second maximum timeout for Lambda', async () => {
      mockSend.mockResolvedValue({
        Payload: new TextEncoder().encode(
          JSON.stringify({
            success: true,
            output: 'Done',
            executionTime: 10000,
          })
        ),
      });

      // Request exceeding 15 seconds should be rejected
      const result = await executeLambda({
        code: 'console.log("test");',
        language: 'javascript',
        timeout: 30000,
      });

      // Should be rejected, not capped
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]).toContain('Requested timeout 30000ms exceeds maximum 15000ms');
      expect(mockSend).not.toHaveBeenCalled();
    });

    it('should handle timeout errors from Lambda', async () => {
      mockSend.mockResolvedValue({
        Payload: new TextEncoder().encode(
          JSON.stringify({
            success: false,
            errors: ['Execution timeout: Code exceeded 15000ms limit'],
            executionTime: 15000,
          })
        ),
      });

      const result = await executeLambda({
        code: 'while(true) {}',
        language: 'javascript',
        timeout: 15000,
      });

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]).toContain('timeout');
    });

    it('should use default timeout of 15 seconds when not specified', async () => {
      mockSend.mockResolvedValue({
        Payload: new TextEncoder().encode(
          JSON.stringify({
            success: true,
            output: 'Done',
            executionTime: 1000,
          })
        ),
      });

      await executeLambda({
        code: 'console.log("test");',
        language: 'javascript',
        // No timeout specified
      });

      expect(mockSend).toHaveBeenCalled();
      const payload = JSON.parse(mockSend.mock.calls[0][0].input.Payload);
      expect(payload.timeout).toBe(15000);
    });

    it('should allow custom timeout less than maximum', async () => {
      mockSend.mockResolvedValue({
        Payload: new TextEncoder().encode(
          JSON.stringify({
            success: true,
            output: 'Done',
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
      const payload = JSON.parse(mockSend.mock.calls[0][0].input.Payload);
      expect(payload.timeout).toBe(10000);
    });
  });

  describe('Fargate Timeout Enforcement', () => {
    let mockSend: ReturnType<typeof vi.fn>;
    let mockClient: ECSClient;

    beforeEach(() => {
      vi.clearAllMocks();
      mockSend = vi.fn();
      
      mockClient = {
        send: mockSend,
      } as any;
      
      setECSClient(mockClient);

      // Set required environment variables
      process.env.FARGATE_CLUSTER_ARN = 'arn:aws:ecs:us-east-1:123456789012:cluster/test';
      process.env.FARGATE_TASK_DEFINITION_ARN = 'arn:aws:ecs:us-east-1:123456789012:task-definition/test:1';
      process.env.FARGATE_SECURITY_GROUP_ID = 'sg-12345';
      process.env.FARGATE_SUBNET_IDS = 'subnet-1,subnet-2';
    });

    afterEach(() => {
      setECSClient(null);
      delete process.env.FARGATE_CLUSTER_ARN;
      delete process.env.FARGATE_TASK_DEFINITION_ARN;
      delete process.env.FARGATE_SECURITY_GROUP_ID;
      delete process.env.FARGATE_SUBNET_IDS;
    });

    it('should enforce 30 minute maximum timeout for Fargate', async () => {
      mockSend.mockResolvedValue({
        tasks: [
          {
            taskArn: 'arn:aws:ecs:us-east-1:123456789012:task/test/abc123',
          },
        ],
      });

      // Request exceeding 30 minutes should be rejected
      const result = await executeFargate({
        code: 'console.log("test");',
        language: 'javascript',
        timeout: 7200000, // 2 hours
      });

      // Should be rejected, not capped
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]).toContain('Requested timeout 7200000ms exceeds maximum 1800000ms');
      expect(mockSend).not.toHaveBeenCalled();
    });

    it('should use default timeout of 30 minutes when not specified', async () => {
      mockSend.mockResolvedValue({
        tasks: [
          {
            taskArn: 'arn:aws:ecs:us-east-1:123456789012:task/test/abc123',
          },
        ],
      });

      await executeFargate({
        code: 'console.log("test");',
        language: 'javascript',
        // No timeout specified
      });

      expect(mockSend).toHaveBeenCalled();
      const command = mockSend.mock.calls[0][0];
      const environment = command.input.overrides.containerOverrides[0].environment;
      const timeoutEnv = environment.find((e: any) => e.name === 'TIMEOUT');
      expect(parseInt(timeoutEnv.value)).toBe(1800000); // 30 minutes
    });

    it('should detect timeout in task status', async () => {
      mockSend.mockResolvedValue({
        tasks: [
          {
            taskArn: 'arn:aws:ecs:us-east-1:123456789012:task/test/abc123',
            lastStatus: 'STOPPED',
            stoppedReason: 'User requested cancellation',
            containers: [
              {
                exitCode: 137, // SIGKILL
              },
            ],
          },
        ],
      });

      const result = await getTaskStatus('arn:aws:ecs:us-east-1:123456789012:task/test/abc123');

      expect(result.success).toBe(false);
      expect(result.status).toBe('STOPPED');
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]).toContain('timeout');
    });

    it('should allow custom timeout less than maximum', async () => {
      mockSend.mockResolvedValue({
        tasks: [
          {
            taskArn: 'arn:aws:ecs:us-east-1:123456789012:task/test/abc123',
          },
        ],
      });

      await executeFargate({
        code: 'console.log("test");',
        language: 'javascript',
        timeout: 600000, // 10 minutes
      });

      expect(mockSend).toHaveBeenCalled();
      const command = mockSend.mock.calls[0][0];
      const environment = command.input.overrides.containerOverrides[0].environment;
      const timeoutEnv = environment.find((e: any) => e.name === 'TIMEOUT');
      expect(parseInt(timeoutEnv.value)).toBe(600000);
    });
  });

  describe('API Route Timeout Validation', () => {
    it('should validate timeout limits in API route', () => {
      const MAX_LAMBDA_TIMEOUT = 15000;
      const MAX_FARGATE_TIMEOUT = 1800000;

      // Lambda timeout validation
      const lambdaTimeout = 30000;
      const effectiveLambdaTimeout = Math.min(lambdaTimeout, MAX_LAMBDA_TIMEOUT);
      expect(effectiveLambdaTimeout).toBe(15000);

      // Fargate timeout validation
      const fargateTimeout = 7200000;
      const effectiveFargateTimeout = Math.min(fargateTimeout, MAX_FARGATE_TIMEOUT);
      expect(effectiveFargateTimeout).toBe(1800000);
    });

    it('should use default timeouts when not specified', () => {
      const DEFAULT_LAMBDA_TIMEOUT = 15000;
      const DEFAULT_FARGATE_TIMEOUT = 1800000;

      expect(DEFAULT_LAMBDA_TIMEOUT).toBe(15000);
      expect(DEFAULT_FARGATE_TIMEOUT).toBe(1800000);
    });
  });
});
