/**
 * Integration Test for Task 7.4: Execution Result Handling
 * 
 * Tests the complete flow of:
 * 1. Executing code
 * 2. Storing results in S3 and DynamoDB
 * 3. Retrieving results via API
 * 4. Preview URL generation for HTML output
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as executePost } from '@/app/api/sandbox/execute/route';
import { GET as resultGet } from '@/app/api/sandbox/result/[resultId]/route';
import { NextRequest } from 'next/server';
import * as lambdaExecutor from '@/lib/sandbox/lambda-executor';
import * as resultStorage from '@/lib/sandbox/result-storage';

vi.mock('@/lib/sandbox/lambda-executor');
vi.mock('@/lib/sandbox/fargate-executor');
vi.mock('@/lib/sandbox/result-storage');

describe('Task 7.4: Execution Result Handling - Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Execute and Store Flow', () => {
    it('should execute code and store result when userId provided', async () => {
      vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
      vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
        success: true,
        output: 'Hello, World!',
        executionTime: 100,
      });

      vi.mocked(resultStorage.isResultStorageAvailable).mockReturnValue(true);
      vi.mocked(resultStorage.storeExecutionResult).mockResolvedValue({
        resultId: 'result-123',
        userId: 'user-123',
        projectId: undefined,
        code: 'console.log("Hello, World!");',
        language: 'javascript',
        result: {
          success: true,
          output: 'Hello, World!',
          executionTime: 100,
        },
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("Hello, World!");',
          language: 'javascript',
          userId: 'user-123',
        }),
      });

      const response = await executePost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(resultStorage.storeExecutionResult).toHaveBeenCalledWith(
        'user-123',
        'console.log("Hello, World!");',
        'javascript',
        expect.objectContaining({
          success: true,
          output: 'Hello, World!',
        }),
        undefined
      );
    });

    it('should execute and store with projectId', async () => {
      vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
      vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
        success: true,
        output: 'Test',
        executionTime: 100,
      });

      vi.mocked(resultStorage.isResultStorageAvailable).mockReturnValue(true);
      vi.mocked(resultStorage.storeExecutionResult).mockResolvedValue({
        resultId: 'result-456',
        userId: 'user-123',
        projectId: 'project-789',
        code: 'console.log("Test");',
        language: 'javascript',
        result: {
          success: true,
          output: 'Test',
          executionTime: 100,
        },
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("Test");',
          language: 'javascript',
          userId: 'user-123',
          projectId: 'project-789',
        }),
      });

      await executePost(request);

      expect(resultStorage.storeExecutionResult).toHaveBeenCalledWith(
        'user-123',
        'console.log("Test");',
        'javascript',
        expect.any(Object),
        'project-789'
      );
    });

    it('should not store result when userId not provided', async () => {
      vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
      vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
        success: true,
        output: 'Test',
        executionTime: 100,
      });

      vi.mocked(resultStorage.isResultStorageAvailable).mockReturnValue(true);

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("Test");',
          language: 'javascript',
        }),
      });

      await executePost(request);

      expect(resultStorage.storeExecutionResult).not.toHaveBeenCalled();
    });

    it('should not store result when storage unavailable', async () => {
      vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
      vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
        success: true,
        output: 'Test',
        executionTime: 100,
      });

      vi.mocked(resultStorage.isResultStorageAvailable).mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("Test");',
          language: 'javascript',
          userId: 'user-123',
        }),
      });

      await executePost(request);

      expect(resultStorage.storeExecutionResult).not.toHaveBeenCalled();
    });

    it('should continue execution even if storage fails', async () => {
      vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
      vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
        success: true,
        output: 'Test',
        executionTime: 100,
      });

      vi.mocked(resultStorage.isResultStorageAvailable).mockReturnValue(true);
      vi.mocked(resultStorage.storeExecutionResult).mockRejectedValue(
        new Error('Storage failed')
      );

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("Test");',
          language: 'javascript',
          userId: 'user-123',
        }),
      });

      const response = await executePost(request);
      const data = await response.json();

      // Should still succeed despite storage failure
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.output).toBe('Test');
    });
  });

  describe('HTML Preview URL Generation', () => {
    it('should generate preview URL for HTML output', async () => {
      const htmlOutput = '<!DOCTYPE html><html><body>Test</body></html>';

      vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
      vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
        success: true,
        output: htmlOutput,
        executionTime: 100,
      });

      vi.mocked(resultStorage.isResultStorageAvailable).mockReturnValue(true);
      vi.mocked(resultStorage.storeExecutionResult).mockResolvedValue({
        resultId: 'result-123',
        userId: 'user-123',
        projectId: undefined,
        code: 'code',
        language: 'javascript',
        result: {
          success: true,
          output: htmlOutput,
          executionTime: 100,
        },
        previewUrl: 'https://s3.amazonaws.com/bucket/preview?signature=xyz',
        s3Key: 'results/user-123/result-123/output.html',
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'const html = "..."; console.log(html);',
          language: 'javascript',
          userId: 'user-123',
        }),
      });

      const response = await executePost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.previewUrl).toBeDefined();
      expect(data.data.previewUrl).toContain('s3.amazonaws.com');
    });

    it('should not generate preview URL for plain text output', async () => {
      vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
      vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
        success: true,
        output: 'Plain text output',
        executionTime: 100,
      });

      vi.mocked(resultStorage.isResultStorageAvailable).mockReturnValue(true);
      vi.mocked(resultStorage.storeExecutionResult).mockResolvedValue({
        resultId: 'result-123',
        userId: 'user-123',
        projectId: undefined,
        code: 'console.log("Plain text output");',
        language: 'javascript',
        result: {
          success: true,
          output: 'Plain text output',
          executionTime: 100,
        },
        previewUrl: undefined,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("Plain text output");',
          language: 'javascript',
          userId: 'user-123',
        }),
      });

      const response = await executePost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.previewUrl).toBeNull();
    });
  });

  describe('Result Retrieval Flow', () => {
    it('should retrieve previously stored result', async () => {
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

      const response = await resultGet(request, {
        params: { resultId: 'result-123' },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.resultId).toBe('result-123');
      expect(data.data.result.output).toBe('Test');
    });

    it('should handle cache expiration', async () => {
      vi.mocked(resultStorage.getExecutionResult).mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/sandbox/result/result-old?userId=user-123'
      );

      const response = await resultGet(request, {
        params: { resultId: 'result-old' },
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('RESULT_NOT_FOUND');
    });
  });

  describe('Console Output Handling', () => {
    it('should parse and include console output', async () => {
      vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
      vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
        success: true,
        output: '[INFO] Starting\nHello, World!\n[ERROR] Something failed',
        executionTime: 100,
      });

      vi.mocked(resultStorage.isResultStorageAvailable).mockReturnValue(true);
      vi.mocked(resultStorage.storeExecutionResult).mockResolvedValue({
        resultId: 'result-123',
        userId: 'user-123',
        projectId: undefined,
        code: 'console.log("Hello, World!");',
        language: 'javascript',
        result: {
          success: true,
          output: '[INFO] Starting\nHello, World!\n[ERROR] Something failed',
          executionTime: 100,
        },
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("Hello, World!");',
          language: 'javascript',
          userId: 'user-123',
        }),
      });

      const response = await executePost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.consoleOutput).toBeDefined();
      expect(Array.isArray(data.data.consoleOutput)).toBe(true);
    });
  });

  describe('Error Result Handling', () => {
    it('should store and retrieve error results', async () => {
      vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
      vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
        success: false,
        errors: ['SyntaxError: Unexpected token'],
        executionTime: 50,
      });

      vi.mocked(resultStorage.isResultStorageAvailable).mockReturnValue(true);
      vi.mocked(resultStorage.storeExecutionResult).mockResolvedValue({
        resultId: 'result-error',
        userId: 'user-123',
        projectId: undefined,
        code: 'console.log("broken',
        language: 'javascript',
        result: {
          success: false,
          errors: ['SyntaxError: Unexpected token'],
          executionTime: 50,
        },
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });

      const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("broken',
          language: 'javascript',
          userId: 'user-123',
        }),
      });

      const response = await executePost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.data.errors).toContain('SyntaxError: Unexpected token');
      expect(resultStorage.storeExecutionResult).toHaveBeenCalled();
    });
  });
});
