import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/learning/curate/route';
import { NextRequest } from 'next/server';
import * as dynamodb from '@/lib/db/dynamodb';
import * as sqs from '@/lib/queue/sqs';

// Mock the dependencies
vi.mock('@/lib/db/dynamodb');
vi.mock('@/lib/queue/sqs');
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}));

describe('POST /api/learning/curate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, 'now').mockReturnValue(1709251200000);
  });

  it('should create a curation job successfully', async () => {
    // Mock successful DynamoDB and SQS operations
    vi.mocked(dynamodb.putItem).mockResolvedValue(undefined);
    vi.mocked(sqs.sendAIJobMessage).mockResolvedValue('message-id-123');

    const request = new NextRequest('http://localhost:3000/api/learning/curate', {
      method: 'POST',
      body: JSON.stringify({
        technology: 'react',
        userId: 'user-123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      data: {
        jobId: 'test-uuid-1234',
        status: 'queued',
      },
    });

    // Verify DynamoDB putItem was called correctly
    expect(dynamodb.putItem).toHaveBeenCalledWith(dynamodb.TABLES.JOBS, {
      PK: 'JOB#test-uuid-1234',
      SK: 'USER#user-123',
      type: 'curate',
      status: 'queued',
      progress: 0,
      input: {
        technology: 'react',
      },
      createdAt: 1709251200000,
      updatedAt: 1709251200000,
      expiresAt: 1709337600,
    });

    // Verify SQS sendAIJobMessage was called correctly
    expect(sqs.sendAIJobMessage).toHaveBeenCalledWith({
      jobId: 'test-uuid-1234',
      type: 'curate',
      userId: 'user-123',
      input: {
        technology: 'react',
      },
      createdAt: 1709251200000,
    });
  });

  it('should reject invalid technology', async () => {
    const request = new NextRequest('http://localhost:3000/api/learning/curate', {
      method: 'POST',
      body: JSON.stringify({
        technology: 'invalid-tech',
        userId: 'user-123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.message).toContain('Technology must be one of');
  });

  it('should reject missing userId', async () => {
    const request = new NextRequest('http://localhost:3000/api/learning/curate', {
      method: 'POST',
      body: JSON.stringify({
        technology: 'react',
        userId: '',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should handle DynamoDB errors', async () => {
    vi.mocked(dynamodb.putItem).mockRejectedValue(new Error('DynamoDB error'));

    const request = new NextRequest('http://localhost:3000/api/learning/curate', {
      method: 'POST',
      body: JSON.stringify({
        technology: 'react',
        userId: 'user-123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(data.error.message).toBe('DynamoDB error');
  });

  it('should handle SQS errors', async () => {
    vi.mocked(dynamodb.putItem).mockResolvedValue(undefined);
    vi.mocked(sqs.sendAIJobMessage).mockRejectedValue(new Error('SQS error'));

    const request = new NextRequest('http://localhost:3000/api/learning/curate', {
      method: 'POST',
      body: JSON.stringify({
        technology: 'react',
        userId: 'user-123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(data.error.message).toBe('SQS error');
  });

  it('should accept all valid technologies', async () => {
    const validTechnologies = ['react', 'vue', 'nextjs', 'nodejs', 'python', 'go'];

    vi.mocked(dynamodb.putItem).mockResolvedValue(undefined);
    vi.mocked(sqs.sendAIJobMessage).mockResolvedValue('message-id-123');

    for (const tech of validTechnologies) {
      const request = new NextRequest('http://localhost:3000/api/learning/curate', {
        method: 'POST',
        body: JSON.stringify({
          technology: tech,
          userId: 'user-123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    }
  });
});
