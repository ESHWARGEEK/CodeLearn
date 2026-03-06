import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  executeFargate,
  getTaskStatus,
  stopTask,
  isFargateAvailable,
  setECSClient,
} from '@/lib/sandbox/fargate-executor';

// Mock ECS client
const mockSend = vi.fn();
const mockECSClient = {
  send: mockSend,
} as any;

describe('Fargate Executor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setECSClient(mockECSClient);

    // Set required environment variables
    process.env.FARGATE_CLUSTER_ARN = 'arn:aws:ecs:us-east-1:123456789012:cluster/test-cluster';
    process.env.FARGATE_TASK_DEFINITION_ARN = 'arn:aws:ecs:us-east-1:123456789012:task-definition/test-task:1';
    process.env.FARGATE_SECURITY_GROUP_ID = 'sg-12345';
    process.env.FARGATE_SUBNET_IDS = 'subnet-1,subnet-2';
  });

  describe('executeFargate', () => {
    it('should start a Fargate task successfully', async () => {
      mockSend.mockResolvedValueOnce({
        tasks: [
          {
            taskArn: 'arn:aws:ecs:us-east-1:123456789012:task/test-cluster/abc123',
            lastStatus: 'PENDING',
          },
        ],
      });

      const result = await executeFargate({
        code: 'console.log("test")',
        language: 'javascript',
        timeout: 60000,
      });

      expect(result.success).toBe(true);
      expect(result.taskArn).toBe('arn:aws:ecs:us-east-1:123456789012:task/test-cluster/abc123');
      expect(result.status).toBe('PENDING');
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should handle task start failure', async () => {
      mockSend.mockResolvedValueOnce({
        tasks: [],
      });

      const result = await executeFargate({
        code: 'console.log("test")',
        language: 'javascript',
      });

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Failed to start Fargate task');
    });

    it('should handle ECS client errors', async () => {
      mockSend.mockRejectedValueOnce(new Error('ECS error'));

      const result = await executeFargate({
        code: 'console.log("test")',
        language: 'javascript',
      });

      expect(result.success).toBe(false);
      expect(result.errors?.[0]).toContain('ECS error');
    });

    it('should encode code as base64 in environment', async () => {
      mockSend.mockResolvedValueOnce({
        tasks: [
          {
            taskArn: 'arn:aws:ecs:us-east-1:123456789012:task/test-cluster/abc123',
          },
        ],
      });

      const code = 'console.log("test")';
      await executeFargate({
        code,
        language: 'javascript',
      });

      const callArgs = mockSend.mock.calls[0][0];
      const environment = callArgs.input.overrides.containerOverrides[0].environment;
      
      const codeEnv = environment.find((e: any) => e.name === 'CODE');
      expect(codeEnv.value).toBe(Buffer.from(code).toString('base64'));
    });

    it('should use default timeout if not provided', async () => {
      mockSend.mockResolvedValueOnce({
        tasks: [
          {
            taskArn: 'arn:aws:ecs:us-east-1:123456789012:task/test-cluster/abc123',
          },
        ],
      });

      await executeFargate({
        code: 'console.log("test")',
        language: 'javascript',
      });

      const callArgs = mockSend.mock.calls[0][0];
      const environment = callArgs.input.overrides.containerOverrides[0].environment;
      
      const timeoutEnv = environment.find((e: any) => e.name === 'TIMEOUT');
      expect(timeoutEnv.value).toBe('1800000'); // 30 minutes
    });
  });

  describe('getTaskStatus', () => {
    it('should get status of a running task', async () => {
      mockSend.mockResolvedValueOnce({
        tasks: [
          {
            taskArn: 'arn:aws:ecs:us-east-1:123456789012:task/test-cluster/abc123',
            lastStatus: 'RUNNING',
          },
        ],
      });

      const result = await getTaskStatus(
        'arn:aws:ecs:us-east-1:123456789012:task/test-cluster/abc123'
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe('RUNNING');
    });

    it('should handle completed task with success', async () => {
      mockSend.mockResolvedValueOnce({
        tasks: [
          {
            taskArn: 'arn:aws:ecs:us-east-1:123456789012:task/test-cluster/abc123',
            lastStatus: 'STOPPED',
            containers: [
              {
                exitCode: 0,
              },
            ],
          },
        ],
      });

      const result = await getTaskStatus(
        'arn:aws:ecs:us-east-1:123456789012:task/test-cluster/abc123'
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe('STOPPED');
      expect(result.output).toContain('completed successfully');
    });

    it('should handle failed task', async () => {
      mockSend.mockResolvedValueOnce({
        tasks: [
          {
            taskArn: 'arn:aws:ecs:us-east-1:123456789012:task/test-cluster/abc123',
            lastStatus: 'STOPPED',
            containers: [
              {
                exitCode: 1,
              },
            ],
          },
        ],
      });

      const result = await getTaskStatus(
        'arn:aws:ecs:us-east-1:123456789012:task/test-cluster/abc123'
      );

      expect(result.success).toBe(false);
      expect(result.status).toBe('STOPPED');
      expect(result.errors?.[0]).toContain('exit code: 1');
    });

    it('should handle task not found', async () => {
      mockSend.mockResolvedValueOnce({
        tasks: [],
      });

      const result = await getTaskStatus(
        'arn:aws:ecs:us-east-1:123456789012:task/test-cluster/abc123'
      );

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Task not found');
    });
  });

  describe('stopTask', () => {
    it('should stop a running task', async () => {
      mockSend.mockResolvedValueOnce({});

      const result = await stopTask(
        'arn:aws:ecs:us-east-1:123456789012:task/test-cluster/abc123'
      );

      expect(result).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should handle stop failure', async () => {
      mockSend.mockRejectedValueOnce(new Error('Stop failed'));

      const result = await stopTask(
        'arn:aws:ecs:us-east-1:123456789012:task/test-cluster/abc123'
      );

      expect(result).toBe(false);
    });
  });

  describe('isFargateAvailable', () => {
    it('should return true when all config is present', () => {
      expect(isFargateAvailable()).toBe(true);
    });

    it('should return false when cluster ARN is missing', () => {
      delete process.env.FARGATE_CLUSTER_ARN;
      expect(isFargateAvailable()).toBe(false);
    });

    it('should return false when task definition ARN is missing', () => {
      delete process.env.FARGATE_TASK_DEFINITION_ARN;
      expect(isFargateAvailable()).toBe(false);
    });

    it('should return false when security group is missing', () => {
      delete process.env.FARGATE_SECURITY_GROUP_ID;
      expect(isFargateAvailable()).toBe(false);
    });

    it('should return false when subnet IDs are missing', () => {
      delete process.env.FARGATE_SUBNET_IDS;
      expect(isFargateAvailable()).toBe(false);
    });
  });
});
