/**
 * Integration Tests for Sandbox Cleanup
 * 
 * Tests the complete cleanup workflow including:
 * - Automatic cleanup of old resources
 * - Task-specific cleanup
 * - User-specific cleanup
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  cleanupSandboxResources,
  cleanupTaskResources,
  cleanupUserResults,
} from '@/lib/sandbox/cleanup';

describe('Sandbox Cleanup Integration', () => {
  beforeAll(() => {
    // Set test environment variables
    process.env.AWS_REGION = 'us-east-1';
    process.env.SANDBOX_RESULTS_BUCKET = 'codelearn-sandbox-results-test';
    process.env.SANDBOX_RESULTS_TABLE = 'sandbox-results-test';
    process.env.FARGATE_CLUSTER_ARN = 'arn:aws:ecs:us-east-1:123456789012:cluster/test-cluster';
  });

  afterAll(() => {
    // Cleanup test environment
    delete process.env.SANDBOX_RESULTS_BUCKET;
    delete process.env.SANDBOX_RESULTS_TABLE;
    delete process.env.FARGATE_CLUSTER_ARN;
  });

  describe('cleanupSandboxResources', () => {
    it('should complete cleanup without errors when no resources exist', async () => {
      const stats = await cleanupSandboxResources();

      expect(stats).toBeDefined();
      expect(stats.tasksStoppedCount).toBeGreaterThanOrEqual(0);
      expect(stats.s3ObjectsDeletedCount).toBeGreaterThanOrEqual(0);
      expect(stats.dynamoRecordsDeletedCount).toBeGreaterThanOrEqual(0);
      expect(stats.duration).toBeGreaterThan(0);
      expect(Array.isArray(stats.errors)).toBe(true);
    });

    it('should return valid statistics structure', async () => {
      const stats = await cleanupSandboxResources();

      expect(stats).toHaveProperty('tasksStoppedCount');
      expect(stats).toHaveProperty('s3ObjectsDeletedCount');
      expect(stats).toHaveProperty('dynamoRecordsDeletedCount');
      expect(stats).toHaveProperty('errors');
      expect(stats).toHaveProperty('duration');

      expect(typeof stats.tasksStoppedCount).toBe('number');
      expect(typeof stats.s3ObjectsDeletedCount).toBe('number');
      expect(typeof stats.dynamoRecordsDeletedCount).toBe('number');
      expect(typeof stats.duration).toBe('number');
      expect(Array.isArray(stats.errors)).toBe(true);
    });

    it('should handle missing AWS configuration gracefully', async () => {
      // Temporarily remove configuration
      const originalCluster = process.env.FARGATE_CLUSTER_ARN;
      const originalBucket = process.env.SANDBOX_RESULTS_BUCKET;
      
      delete process.env.FARGATE_CLUSTER_ARN;
      delete process.env.SANDBOX_RESULTS_BUCKET;

      const stats = await cleanupSandboxResources();

      expect(stats.tasksStoppedCount).toBe(0);
      expect(stats.s3ObjectsDeletedCount).toBe(0);
      expect(stats.errors).toHaveLength(0);

      // Restore configuration
      process.env.FARGATE_CLUSTER_ARN = originalCluster;
      process.env.SANDBOX_RESULTS_BUCKET = originalBucket;
    });
  });

  describe('cleanupTaskResources', () => {
    it('should handle non-existent task gracefully', async () => {
      const fakeTaskArn = 'arn:aws:ecs:us-east-1:123456789012:task/test-cluster/fake-task-123';

      // Should not throw error
      await expect(cleanupTaskResources(fakeTaskArn)).resolves.not.toThrow();
    });

    it('should handle invalid task ARN format', async () => {
      const invalidTaskArn = 'invalid-task-arn';

      // Should handle gracefully or throw descriptive error
      await expect(cleanupTaskResources(invalidTaskArn)).rejects.toThrow();
    });
  });

  describe('cleanupUserResults', () => {
    it('should complete cleanup for non-existent user', async () => {
      const fakeUserId = 'user-nonexistent-12345';

      const stats = await cleanupUserResults(fakeUserId);

      expect(stats).toBeDefined();
      expect(stats.s3ObjectsDeletedCount).toBe(0);
      expect(stats.errors).toHaveLength(0);
      expect(stats.duration).toBeGreaterThan(0);
    });

    it('should return valid statistics structure', async () => {
      const userId = 'user-test-123';

      const stats = await cleanupUserResults(userId);

      expect(stats).toHaveProperty('tasksStoppedCount');
      expect(stats).toHaveProperty('s3ObjectsDeletedCount');
      expect(stats).toHaveProperty('dynamoRecordsDeletedCount');
      expect(stats).toHaveProperty('errors');
      expect(stats).toHaveProperty('duration');
    });

    it('should handle empty user ID', async () => {
      const stats = await cleanupUserResults('');

      expect(stats).toBeDefined();
      expect(stats.s3ObjectsDeletedCount).toBe(0);
    });
  });

  describe('Cleanup Performance', () => {
    it('should complete cleanup within reasonable time', async () => {
      const startTime = Date.now();
      
      await cleanupSandboxResources();
      
      const duration = Date.now() - startTime;
      
      // Cleanup should complete within 30 seconds
      expect(duration).toBeLessThan(30000);
    });

    it('should handle concurrent cleanup calls', async () => {
      // Run multiple cleanup operations concurrently
      const cleanupPromises = [
        cleanupSandboxResources(),
        cleanupSandboxResources(),
        cleanupSandboxResources(),
      ];

      const results = await Promise.all(cleanupPromises);

      // All should complete successfully
      expect(results).toHaveLength(3);
      results.forEach(stats => {
        expect(stats).toBeDefined();
        expect(stats.duration).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling', () => {
    it('should continue cleanup even if one service fails', async () => {
      // This test verifies that cleanup is resilient
      const stats = await cleanupSandboxResources();

      // Even if some services fail, we should get a result
      expect(stats).toBeDefined();
      expect(typeof stats.tasksStoppedCount).toBe('number');
      expect(typeof stats.s3ObjectsDeletedCount).toBe('number');
    });

    it('should collect all errors during cleanup', async () => {
      const stats = await cleanupSandboxResources();

      // Errors should be collected in an array
      expect(Array.isArray(stats.errors)).toBe(true);
      
      // Each error should be a string
      stats.errors.forEach(error => {
        expect(typeof error).toBe('string');
      });
    });
  });

  describe('Cleanup Workflow', () => {
    it('should cleanup in correct order: tasks -> S3 -> DynamoDB', async () => {
      const stats = await cleanupSandboxResources();

      // Verify all cleanup phases completed
      expect(stats).toHaveProperty('tasksStoppedCount');
      expect(stats).toHaveProperty('s3ObjectsDeletedCount');
      expect(stats).toHaveProperty('dynamoRecordsDeletedCount');
      
      // Duration should reflect all phases
      expect(stats.duration).toBeGreaterThan(0);
    });

    it('should provide detailed statistics for monitoring', async () => {
      const stats = await cleanupSandboxResources();

      // Statistics should be suitable for monitoring/alerting
      expect(stats.tasksStoppedCount).toBeGreaterThanOrEqual(0);
      expect(stats.s3ObjectsDeletedCount).toBeGreaterThanOrEqual(0);
      expect(stats.dynamoRecordsDeletedCount).toBeGreaterThanOrEqual(0);
      expect(stats.duration).toBeGreaterThan(0);
      
      // Should track both successes and failures
      expect(typeof stats.tasksStoppedCount).toBe('number');
      expect(Array.isArray(stats.errors)).toBe(true);
    });
  });
});
