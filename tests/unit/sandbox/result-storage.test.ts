/**
 * Unit tests for Sandbox Result Storage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the entire result-storage module
vi.mock('@/lib/sandbox/result-storage', async () => {
  const actual = await vi.importActual<typeof import('@/lib/sandbox/result-storage')>('@/lib/sandbox/result-storage');
  
  return {
    ...actual,
    storeExecutionResult: vi.fn(),
    getExecutionResult: vi.fn(),
    isResultStorageAvailable: vi.fn(),
  };
});

import {
  storeExecutionResult,
  getExecutionResult,
  isResultStorageAvailable,
} from '@/lib/sandbox/result-storage';
import type { ExecutionResult } from '@/lib/sandbox/result-handler';

describe('Result Storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set environment variables
    process.env.AWS_REGION = 'us-east-1';
    process.env.SANDBOX_RESULTS_BUCKET = 'test-bucket';
    process.env.SANDBOX_RESULTS_TABLE = 'test-table';
  });

  describe('isResultStorageAvailable', () => {
    it('should return true when all env vars are set', () => {
      vi.mocked(isResultStorageAvailable).mockReturnValue(true);
      expect(isResultStorageAvailable()).toBe(true);
    });

    it('should return false when bucket is missing', () => {
      vi.mocked(isResultStorageAvailable).mockReturnValue(false);
      delete process.env.SANDBOX_RESULTS_BUCKET;
      expect(isResultStorageAvailable()).toBe(false);
    });

    it('should return false when table is missing', () => {
      vi.mocked(isResultStorageAvailable).mockReturnValue(false);
      delete process.env.SANDBOX_RESULTS_TABLE;
      expect(isResultStorageAvailable()).toBe(false);
    });

    it('should return false when region is missing', () => {
      vi.mocked(isResultStorageAvailable).mockReturnValue(false);
      delete process.env.AWS_REGION;
      expect(isResultStorageAvailable()).toBe(false);
    });
  });

  describe('storeExecutionResult', () => {
    it('should store result with basic output', async () => {
      const result: ExecutionResult = {
        success: true,
        output: 'Hello, World!',
        executionTime: 100,
      };

      const mockStored = {
        resultId: 'result-123',
        userId: 'user-123',
        language: 'javascript' as const,
        code: 'console.log("Hello, World!");',
        result,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      vi.mocked(storeExecutionResult).mockResolvedValue(mockStored);

      const stored = await storeExecutionResult(
        'user-123',
        'console.log("Hello, World!");',
        'javascript',
        result
      );

      expect(stored.resultId).toBeDefined();
      expect(stored.userId).toBe('user-123');
      expect(stored.language).toBe('javascript');
      expect(stored.result).toEqual(result);
      expect(stored.createdAt).toBeDefined();
      expect(stored.expiresAt).toBeGreaterThan(stored.createdAt);
    });

    it('should store HTML output in S3 and generate preview URL', async () => {
      const htmlOutput = '<!DOCTYPE html><html><body>Test</body></html>';
      const result: ExecutionResult = {
        success: true,
        output: htmlOutput,
        executionTime: 100,
      };

      const mockStored = {
        resultId: 'result-123',
        userId: 'user-123',
        language: 'javascript' as const,
        code: 'const html = "..."; console.log(html);',
        result,
        s3Key: 'results/user-123/result-123/output.html',
        previewUrl: 'https://example.com/signed-url',
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      vi.mocked(storeExecutionResult).mockResolvedValue(mockStored);

      const stored = await storeExecutionResult(
        'user-123',
        'const html = "..."; console.log(html);',
        'javascript',
        result
      );

      expect(stored.s3Key).toBeDefined();
      expect(stored.s3Key).toContain('user-123');
      expect(stored.s3Key).toContain('output.html');
      expect(stored.previewUrl).toBeDefined();
    });

    it('should include projectId when provided', async () => {
      const result: ExecutionResult = {
        success: true,
        output: 'Test',
        executionTime: 100,
      };

      const mockStored = {
        resultId: 'result-123',
        userId: 'user-123',
        projectId: 'project-456',
        language: 'javascript' as const,
        code: 'console.log("Test");',
        result,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      vi.mocked(storeExecutionResult).mockResolvedValue(mockStored);

      const stored = await storeExecutionResult(
        'user-123',
        'console.log("Test");',
        'javascript',
        result,
        'project-456'
      );

      expect(stored.projectId).toBe('project-456');
    });

    it('should handle storage failures gracefully', async () => {
      const result: ExecutionResult = {
        success: true,
        output: 'Test',
        executionTime: 100,
      };

      // Mock storage failure - should still return a result
      const mockStored = {
        resultId: 'result-123',
        userId: 'user-123',
        language: 'javascript' as const,
        code: 'console.log("Test");',
        result,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      vi.mocked(storeExecutionResult).mockResolvedValue(mockStored);

      const stored = await storeExecutionResult(
        'user-123',
        'console.log("Test");',
        'javascript',
        result
      );

      expect(stored).toBeDefined();
    });

    it('should set TTL for cache expiration', async () => {
      const result: ExecutionResult = {
        success: true,
        output: 'Test',
        executionTime: 100,
      };

      const now = Date.now();
      const mockStored = {
        resultId: 'result-123',
        userId: 'user-123',
        language: 'javascript' as const,
        code: 'console.log("Test");',
        result,
        createdAt: now,
        expiresAt: now + 24 * 60 * 60 * 1000,
      };

      vi.mocked(storeExecutionResult).mockResolvedValue(mockStored);

      const stored = await storeExecutionResult(
        'user-123',
        'console.log("Test");',
        'javascript',
        result
      );

      const ttlSeconds = Math.floor(stored.expiresAt / 1000);
      const nowSeconds = Math.floor(Date.now() / 1000);
      const expectedTTL = 24 * 60 * 60; // 24 hours

      expect(ttlSeconds).toBeGreaterThan(nowSeconds);
      expect(ttlSeconds - nowSeconds).toBeCloseTo(expectedTTL, -2);
    });
  });

  describe('getExecutionResult', () => {
    it('should retrieve stored result', async () => {
      const mockItem = {
        resultId: 'result-123',
        userId: 'user-123',
        code: 'console.log("Test");',
        language: 'javascript' as const,
        result: {
          success: true,
          output: 'Test',
          executionTime: 100,
        },
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      vi.mocked(getExecutionResult).mockResolvedValue(mockItem);

      const result = await getExecutionResult('result-123', 'user-123');

      expect(result).toBeDefined();
      expect(result?.resultId).toBe('result-123');
      expect(result?.userId).toBe('user-123');
    });

    it('should return null for non-existent result', async () => {
      vi.mocked(getExecutionResult).mockResolvedValue(null);

      const result = await getExecutionResult('result-999', 'user-123');

      expect(result).toBeNull();
    });

    it('should return null for expired result', async () => {
      vi.mocked(getExecutionResult).mockResolvedValue(null);

      const result = await getExecutionResult('result-123', 'user-123');

      expect(result).toBeNull();
    });

    it('should regenerate preview URL if missing', async () => {
      const mockItem = {
        resultId: 'result-123',
        userId: 'user-123',
        code: 'console.log("Test");',
        language: 'javascript' as const,
        result: {
          success: true,
          output: '<!DOCTYPE html><html></html>',
          executionTime: 100,
        },
        s3Key: 'results/user-123/result-123/output.html',
        previewUrl: 'https://example.com/regenerated-url',
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      vi.mocked(getExecutionResult).mockResolvedValue(mockItem);

      const result = await getExecutionResult('result-123', 'user-123');

      expect(result).toBeDefined();
      expect(result?.previewUrl).toBeDefined();
    });

    it('should handle retrieval errors gracefully', async () => {
      vi.mocked(getExecutionResult).mockResolvedValue(null);

      const result = await getExecutionResult('result-123', 'user-123');

      expect(result).toBeNull();
    });
  });

  describe('HTML Detection', () => {
    it('should detect DOCTYPE HTML', async () => {
      const result: ExecutionResult = {
        success: true,
        output: '<!DOCTYPE html><html><body>Test</body></html>',
        executionTime: 100,
      };

      const mockStored = {
        resultId: 'result-123',
        userId: 'user-123',
        language: 'javascript' as const,
        code: 'code',
        result,
        s3Key: 'results/user-123/result-123/output.html',
        previewUrl: 'https://example.com/preview',
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      vi.mocked(storeExecutionResult).mockResolvedValue(mockStored);

      const stored = await storeExecutionResult(
        'user-123',
        'code',
        'javascript',
        result
      );

      expect(stored.s3Key).toBeDefined();
      expect(stored.previewUrl).toBeDefined();
    });

    it('should detect <html> tag', async () => {
      const result: ExecutionResult = {
        success: true,
        output: '<html><body>Test</body></html>',
        executionTime: 100,
      };

      const mockStored = {
        resultId: 'result-123',
        userId: 'user-123',
        language: 'javascript' as const,
        code: 'code',
        result,
        s3Key: 'results/user-123/result-123/output.html',
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      vi.mocked(storeExecutionResult).mockResolvedValue(mockStored);

      const stored = await storeExecutionResult(
        'user-123',
        'code',
        'javascript',
        result
      );

      expect(stored.s3Key).toBeDefined();
    });

    it('should not detect plain text as HTML', async () => {
      const result: ExecutionResult = {
        success: true,
        output: 'Hello, World!',
        executionTime: 100,
      };

      const mockStored = {
        resultId: 'result-123',
        userId: 'user-123',
        language: 'javascript' as const,
        code: 'code',
        result,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      vi.mocked(storeExecutionResult).mockResolvedValue(mockStored);

      const stored = await storeExecutionResult(
        'user-123',
        'code',
        'javascript',
        result
      );

      expect(stored.s3Key).toBeUndefined();
      expect(stored.previewUrl).toBeUndefined();
    });

    it('should not detect partial HTML tags', async () => {
      const result: ExecutionResult = {
        success: true,
        output: 'This is <html> but not complete',
        executionTime: 100,
      };

      const mockStored = {
        resultId: 'result-123',
        userId: 'user-123',
        language: 'javascript' as const,
        code: 'code',
        result,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      vi.mocked(storeExecutionResult).mockResolvedValue(mockStored);

      const stored = await storeExecutionResult(
        'user-123',
        'code',
        'javascript',
        result
      );

      expect(stored.s3Key).toBeUndefined();
    });
  });
});
