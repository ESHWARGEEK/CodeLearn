/**
 * Unit tests for GET /api/sandbox/result/[resultId]
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/sandbox/result/[resultId]/route';
import { NextRequest } from 'next/server';
import * as resultStorage from '@/lib/sandbox/result-storage';

vi.mock('@/lib/sandbox/result-storage');

describe('GET /api/sandbox/result/[resultId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Request Validation', () => {
    it('should reject requests without userId', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/sandbox/result/result-123'
      );

      const response = await GET(request, {
        params: { resultId: 'result-123' },
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_REQUEST');
      expect(data.error.message).toContain('User ID is required');
    });

    it('should reject requests without resultId', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/sandbox/result/?userId=user-123'
      );

      const response = await GET(request, {
        params: { resultId: '' },
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_REQUEST');
    });
  });

  describe('Result Retrieval', () => {
    it('should retrieve stored result successfully', async () => {
      const mockResult = {
        resultId: 'result-123',
        userId: 'user-123',
        projectId: 'project-456',
        code: 'console.log("Test");',
        language: 'javascript',
        result: {
          success: true,
          output: 'Test',
          executionTime: 100,
        },
        previewUrl: 'https://example.com/preview',
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      vi.mocked(resultStorage.getExecutionResult).mockResolvedValue(mockResult);

      const request = new NextRequest(
        'http://localhost:3000/api/sandbox/result/result-123?userId=user-123'
      );

      const response = await GET(request, {
        params: { resultId: 'result-123' },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.resultId).toBe('result-123');
      expect(data.data.result).toEqual(mockResult.result);
      expect(data.data.previewUrl).toBe('https://example.com/preview');
    });

    it('should return 404 for non-existent result', async () => {
      vi.mocked(resultStorage.getExecutionResult).mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/sandbox/result/result-999?userId=user-123'
      );

      const response = await GET(request, {
        params: { resultId: 'result-999' },
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('RESULT_NOT_FOUND');
    });

    it('should return 404 for expired result', async () => {
      vi.mocked(resultStorage.getExecutionResult).mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/sandbox/result/result-123?userId=user-123'
      );

      const response = await GET(request, {
        params: { resultId: 'result-123' },
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });

    it('should handle retrieval errors', async () => {
      vi.mocked(resultStorage.getExecutionResult).mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/sandbox/result/result-123?userId=user-123'
      );

      const response = await GET(request, {
        params: { resultId: 'result-123' },
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('RETRIEVAL_FAILED');
    });
  });

  describe('Response Format', () => {
    it('should return correct response format', async () => {
      const mockResult = {
        resultId: 'result-123',
        userId: 'user-123',
        projectId: undefined,
        code: 'console.log("Test");',
        language: 'javascript',
        result: {
          success: true,
          output: 'Test',
          executionTime: 100,
        },
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      vi.mocked(resultStorage.getExecutionResult).mockResolvedValue(mockResult);

      const request = new NextRequest(
        'http://localhost:3000/api/sandbox/result/result-123?userId=user-123'
      );

      const response = await GET(request, {
        params: { resultId: 'result-123' },
      });
      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('resultId');
      expect(data.data).toHaveProperty('result');
      expect(data.data).toHaveProperty('createdAt');
      expect(data.data).toHaveProperty('expiresAt');
    });

    it('should include preview URL when available', async () => {
      const mockResult = {
        resultId: 'result-123',
        userId: 'user-123',
        projectId: undefined,
        code: 'console.log("Test");',
        language: 'javascript',
        result: {
          success: true,
          output: '<!DOCTYPE html><html></html>',
          executionTime: 100,
        },
        previewUrl: 'https://example.com/preview',
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      vi.mocked(resultStorage.getExecutionResult).mockResolvedValue(mockResult);

      const request = new NextRequest(
        'http://localhost:3000/api/sandbox/result/result-123?userId=user-123'
      );

      const response = await GET(request, {
        params: { resultId: 'result-123' },
      });
      const data = await response.json();

      expect(data.data.previewUrl).toBe('https://example.com/preview');
    });
  });
});
