/**
 * Unit Tests for Sandbox Cleanup API
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST, GET } from '@/app/api/sandbox/cleanup/route';
import { NextRequest } from 'next/server';
import * as cleanup from '@/lib/sandbox/cleanup';

// Mock the cleanup module
vi.mock('@/lib/sandbox/cleanup', () => ({
  cleanupSandboxResources: vi.fn(),
}));

describe('POST /api/sandbox/cleanup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = 'test-secret-123';
  });

  afterEach(() => {
    delete process.env.CRON_SECRET;
  });

  it('should require authorization header', async () => {
    const request = new NextRequest('http://localhost:3000/api/sandbox/cleanup', {
      method: 'POST',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('should reject invalid authorization token', async () => {
    const request = new NextRequest('http://localhost:3000/api/sandbox/cleanup', {
      method: 'POST',
      headers: {
        authorization: 'Bearer invalid-token',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('FORBIDDEN');
  });

  it('should perform cleanup with valid authorization', async () => {
    const mockStats = {
      tasksStoppedCount: 2,
      s3ObjectsDeletedCount: 5,
      dynamoRecordsDeletedCount: 0,
      errors: [],
      duration: 1234,
    };

    vi.mocked(cleanup.cleanupSandboxResources).mockResolvedValue(mockStats);

    const request = new NextRequest('http://localhost:3000/api/sandbox/cleanup', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-secret-123',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.stats).toEqual({
      tasksStoppedCount: 2,
      s3ObjectsDeletedCount: 5,
      dynamoRecordsDeletedCount: 0,
      duration: 1234,
    });
    expect(data.data.errors).toEqual([]);
    expect(data.data.timestamp).toBeDefined();
  });

  it('should return errors from cleanup', async () => {
    const mockStats = {
      tasksStoppedCount: 1,
      s3ObjectsDeletedCount: 0,
      dynamoRecordsDeletedCount: 0,
      errors: ['Failed to stop task: timeout', 'S3 service unavailable'],
      duration: 5678,
    };

    vi.mocked(cleanup.cleanupSandboxResources).mockResolvedValue(mockStats);

    const request = new NextRequest('http://localhost:3000/api/sandbox/cleanup', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-secret-123',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.errors).toHaveLength(2);
    expect(data.data.errors).toContain('Failed to stop task: timeout');
    expect(data.data.errors).toContain('S3 service unavailable');
  });

  it('should handle cleanup failure', async () => {
    vi.mocked(cleanup.cleanupSandboxResources).mockRejectedValue(
      new Error('Cleanup service unavailable')
    );

    const request = new NextRequest('http://localhost:3000/api/sandbox/cleanup', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-secret-123',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('CLEANUP_FAILED');
    expect(data.error.message).toBe('Cleanup service unavailable');
  });

  it('should handle missing CRON_SECRET', async () => {
    delete process.env.CRON_SECRET;

    const request = new NextRequest('http://localhost:3000/api/sandbox/cleanup', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-secret-123',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });
});

describe('GET /api/sandbox/cleanup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = 'test-secret-123';
    process.env.FARGATE_CLUSTER_ARN = 'arn:aws:ecs:us-east-1:123456789012:cluster/test';
    process.env.SANDBOX_RESULTS_BUCKET = 'test-bucket';
    process.env.SANDBOX_RESULTS_TABLE = 'test-table';
  });

  afterEach(() => {
    delete process.env.CRON_SECRET;
    delete process.env.FARGATE_CLUSTER_ARN;
    delete process.env.SANDBOX_RESULTS_BUCKET;
    delete process.env.SANDBOX_RESULTS_TABLE;
  });

  it('should require authorization header', async () => {
    const request = new NextRequest('http://localhost:3000/api/sandbox/cleanup', {
      method: 'GET',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('should reject invalid authorization token', async () => {
    const request = new NextRequest('http://localhost:3000/api/sandbox/cleanup', {
      method: 'GET',
      headers: {
        authorization: 'Bearer invalid-token',
      },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('FORBIDDEN');
  });

  it('should return cleanup configuration', async () => {
    const request = new NextRequest('http://localhost:3000/api/sandbox/cleanup', {
      method: 'GET',
      headers: {
        authorization: 'Bearer test-secret-123',
      },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.configuration).toEqual({
      enabled: true,
      taskCleanupAgeMinutes: 30,
      resultCleanupAgeHours: 24,
      scheduledInterval: '1 hour',
    });
    expect(data.data.services).toEqual({
      fargate: true,
      s3: true,
      dynamodb: true,
    });
  });

  it('should show disabled services when not configured', async () => {
    delete process.env.FARGATE_CLUSTER_ARN;
    delete process.env.SANDBOX_RESULTS_BUCKET;

    const request = new NextRequest('http://localhost:3000/api/sandbox/cleanup', {
      method: 'GET',
      headers: {
        authorization: 'Bearer test-secret-123',
      },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.services).toEqual({
      fargate: false,
      s3: false,
      dynamodb: true,
    });
  });
});
