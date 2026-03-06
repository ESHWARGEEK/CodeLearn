/**
 * Integration tests for Sandbox Execute API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/sandbox/execute/route';
import { NextRequest } from 'next/server';
import * as lambdaExecutor from '@/lib/sandbox/lambda-executor';

// Mock Lambda executor
vi.mock('@/lib/sandbox/lambda-executor', () => ({
  executeLambda: vi.fn(),
  isLambdaAvailable: vi.fn(),
}));

describe('POST /api/sandbox/execute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute JavaScript code successfully', async () => {
    vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
    vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
      success: true,
      output: 'Hello, World!',
      executionTime: 100,
    });

    const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
      method: 'POST',
      body: JSON.stringify({
        code: 'console.log("Hello, World!");',
        language: 'javascript',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.output).toBe('Hello, World!');
    expect(data.data.executionTime).toBe(100);
  });

  it('should handle TypeScript code', async () => {
    vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
    vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
      success: true,
      output: 'TypeScript works!',
      executionTime: 150,
    });

    const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
      method: 'POST',
      body: JSON.stringify({
        code: 'const message: string = "TypeScript works!"; console.log(message);',
        language: 'typescript',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.output).toBe('TypeScript works!');
  });

  it('should reject unsupported languages', async () => {
    const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
      method: 'POST',
      body: JSON.stringify({
        code: 'print("Hello")',
        language: 'python',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_LANGUAGE');
  });

  it('should handle execution errors', async () => {
    vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
    vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
      success: false,
      errors: ['SyntaxError: Unexpected token'],
      executionTime: 50,
    });

    const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
      method: 'POST',
      body: JSON.stringify({
        code: 'console.log("Hello',
        language: 'javascript',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(false);
    expect(data.data.errors).toContain('SyntaxError: Unexpected token');
  });

  it('should use mock execution when Lambda is unavailable', async () => {
    vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(false);

    const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
      method: 'POST',
      body: JSON.stringify({
        code: 'console.log("Hello, World!");',
        language: 'javascript',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.output).toBeDefined();
    expect(lambdaExecutor.executeLambda).not.toHaveBeenCalled();
  });

  it('should respect custom timeout', async () => {
    vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
    vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
      success: true,
      output: 'Done',
      executionTime: 5000,
    });

    const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
      method: 'POST',
      body: JSON.stringify({
        code: 'console.log("Done");',
        language: 'javascript',
        timeout: 10000,
      }),
    });

    await POST(request);

    expect(lambdaExecutor.executeLambda).toHaveBeenCalledWith({
      code: 'console.log("Done");',
      language: 'javascript',
      timeout: 10000,
    });
  });

  it('should handle malformed JSON', async () => {
    const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
      method: 'POST',
      body: 'invalid json',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_JSON');
  });

  it('should default to lambda environment', async () => {
    vi.mocked(lambdaExecutor.isLambdaAvailable).mockReturnValue(true);
    vi.mocked(lambdaExecutor.executeLambda).mockResolvedValue({
      success: true,
      output: 'Test',
      executionTime: 100,
    });

    const request = new NextRequest('http://localhost:3000/api/sandbox/execute', {
      method: 'POST',
      body: JSON.stringify({
        code: 'console.log("Test");',
        language: 'javascript',
        // No environment specified
      }),
    });

    await POST(request);

    expect(lambdaExecutor.executeLambda).toHaveBeenCalled();
  });
});
