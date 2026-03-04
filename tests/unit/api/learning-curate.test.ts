import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/learning/curate/route';
import { NextRequest } from 'next/server';
import * as dynamodb from '@/lib/db/dynamodb';
import * as sqs from '@/lib/queue/sqs';
import * as learningPaths from '@/lib/db/learning-paths';

// Mock the dependencies
vi.mock('@/lib/db/dynamodb');
vi.mock('@/lib/queue/sqs');
vi.mock('@/lib/db/learning-paths');
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}));

describe('POST /api/learning/curate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, 'now').mockReturnValue(1709251200000);
    // Default: no cached paths
    vi.mocked(learningPaths.getLearningPathsByTechnology).mockResolvedValue([]);
  });

  describe('Caching behavior', () => {
    it('should return cached results when all 3 difficulty levels are cached', async () => {
      const cachedPaths = [
        {
          PK: 'TECH#react',
          SK: 'DIFF#beginner',
          projectId: 'proj-1',
          name: 'Beginner React Project',
          description: 'Learn React basics',
          githubUrl: 'https://github.com/example/beginner',
          estimatedHours: 5,
          tasks: [
            {
              taskId: 'task-1',
              title: 'Setup',
              description: 'Setup project',
              order: 1,
              estimatedMinutes: 30,
              hints: ['Use create-react-app'],
            },
          ],
          generatedAt: 1709251200,
          expiresAt: 1709337600,
        },
        {
          PK: 'TECH#react',
          SK: 'DIFF#intermediate',
          projectId: 'proj-2',
          name: 'Intermediate React Project',
          description: 'Build a dashboard',
          githubUrl: 'https://github.com/example/intermediate',
          estimatedHours: 10,
          tasks: [],
          generatedAt: 1709251200,
          expiresAt: 1709337600,
        },
        {
          PK: 'TECH#react',
          SK: 'DIFF#advanced',
          projectId: 'proj-3',
          name: 'Advanced React Project',
          description: 'Complex app',
          githubUrl: 'https://github.com/example/advanced',
          estimatedHours: 20,
          tasks: [],
          generatedAt: 1709251200,
          expiresAt: 1709337600,
        },
      ];

      vi.mocked(learningPaths.getLearningPathsByTechnology).mockResolvedValue(cachedPaths);

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
      expect(data.success).toBe(true);
      expect(data.data.cached).toBe(true);
      expect(data.data.projects).toHaveLength(3);
      expect(data.data.projects[0].name).toBe('Beginner React Project');
      expect(data.data.projects[0].difficulty).toBe('beginner');

      // Should NOT create a job or send SQS message
      expect(dynamodb.putItem).not.toHaveBeenCalled();
      expect(sqs.sendAIJobMessage).not.toHaveBeenCalled();
    });

    it('should queue AI job when no cached paths exist', async () => {
      vi.mocked(learningPaths.getLearningPathsByTechnology).mockResolvedValue([]);
      vi.mocked(dynamodb.putItem).mockResolvedValue(undefined);
      vi.mocked(sqs.sendAIJobMessage).mockResolvedValue('message-id-123');

      const request = new NextRequest('http://localhost:3000/api/learning/curate', {
        method: 'POST',
        body: JSON.stringify({
          technology: 'vue',
          userId: 'user-123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.jobId).toBe('test-uuid-1234');
      expect(data.data.status).toBe('queued');
      expect(data.data.cached).toBeUndefined();

      // Should create a job and send SQS message
      expect(dynamodb.putItem).toHaveBeenCalled();
      expect(sqs.sendAIJobMessage).toHaveBeenCalled();
    });

    it('should queue AI job when only partial cache exists (1/3 levels)', async () => {
      const partialCache = [
        {
          PK: 'TECH#nextjs',
          SK: 'DIFF#beginner',
          projectId: 'proj-1',
          name: 'Beginner Next.js',
          description: 'Learn Next.js',
          githubUrl: 'https://github.com/example/nextjs',
          estimatedHours: 8,
          tasks: [],
          generatedAt: 1709251200,
          expiresAt: 1709337600,
        },
      ];

      vi.mocked(learningPaths.getLearningPathsByTechnology).mockResolvedValue(partialCache);
      vi.mocked(dynamodb.putItem).mockResolvedValue(undefined);
      vi.mocked(sqs.sendAIJobMessage).mockResolvedValue('message-id-123');

      const request = new NextRequest('http://localhost:3000/api/learning/curate', {
        method: 'POST',
        body: JSON.stringify({
          technology: 'nextjs',
          userId: 'user-123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.jobId).toBe('test-uuid-1234');
      expect(data.data.status).toBe('queued');

      // Should create a job because cache is incomplete
      expect(dynamodb.putItem).toHaveBeenCalled();
      expect(sqs.sendAIJobMessage).toHaveBeenCalled();
    });

    it('should queue AI job when only partial cache exists (2/3 levels)', async () => {
      const partialCache = [
        {
          PK: 'TECH#nodejs',
          SK: 'DIFF#beginner',
          projectId: 'proj-1',
          name: 'Beginner Node.js',
          description: 'Learn Node.js',
          githubUrl: 'https://github.com/example/nodejs-1',
          estimatedHours: 6,
          tasks: [],
          generatedAt: 1709251200,
          expiresAt: 1709337600,
        },
        {
          PK: 'TECH#nodejs',
          SK: 'DIFF#intermediate',
          projectId: 'proj-2',
          name: 'Intermediate Node.js',
          description: 'Build APIs',
          githubUrl: 'https://github.com/example/nodejs-2',
          estimatedHours: 12,
          tasks: [],
          generatedAt: 1709251200,
          expiresAt: 1709337600,
        },
      ];

      vi.mocked(learningPaths.getLearningPathsByTechnology).mockResolvedValue(partialCache);
      vi.mocked(dynamodb.putItem).mockResolvedValue(undefined);
      vi.mocked(sqs.sendAIJobMessage).mockResolvedValue('message-id-123');

      const request = new NextRequest('http://localhost:3000/api/learning/curate', {
        method: 'POST',
        body: JSON.stringify({
          technology: 'nodejs',
          userId: 'user-123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.jobId).toBe('test-uuid-1234');

      // Should create a job because cache is incomplete (missing advanced)
      expect(dynamodb.putItem).toHaveBeenCalled();
      expect(sqs.sendAIJobMessage).toHaveBeenCalled();
    });
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
