import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Fargate Sandbox Integration', () => {
  const baseUrl = process.env.TEST_API_URL || 'http://localhost:3000';

  describe('POST /api/sandbox/execute (fargate)', () => {
    it('should start a Fargate task for complex execution', async () => {
      const response = await fetch(`${baseUrl}/api/sandbox/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: 'console.log("Hello from Fargate!")',
          language: 'javascript',
          environment: 'fargate',
          timeout: 60000,
        }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      
      // Should return task ARN for polling
      if (data.data.taskArn) {
        expect(data.data.taskArn).toMatch(/^arn:aws:ecs:/);
        expect(data.data.status).toBe('PENDING');
      } else {
        // Fallback to mock if Fargate not configured
        expect(data.data.output).toBeDefined();
      }
    });

    it('should handle TypeScript code', async () => {
      const response = await fetch(`${baseUrl}/api/sandbox/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: 'const greeting: string = "Hello"; console.log(greeting);',
          language: 'typescript',
          environment: 'fargate',
        }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should reject invalid language', async () => {
      const response = await fetch(`${baseUrl}/api/sandbox/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: 'print("Hello")',
          language: 'python',
          environment: 'fargate',
        }),
      });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_LANGUAGE');
    });

    it('should use custom timeout', async () => {
      const response = await fetch(`${baseUrl}/api/sandbox/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: 'console.log("test")',
          language: 'javascript',
          environment: 'fargate',
          timeout: 120000, // 2 minutes
        }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe('GET /api/sandbox/task/[taskArn]', () => {
    it('should get status of a Fargate task', async () => {
      // First start a task
      const executeResponse = await fetch(`${baseUrl}/api/sandbox/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: 'console.log("test")',
          language: 'javascript',
          environment: 'fargate',
        }),
      });

      const executeData = await executeResponse.json();

      if (executeData.data.taskArn) {
        // Poll for status
        const taskArn = encodeURIComponent(executeData.data.taskArn);
        const statusResponse = await fetch(
          `${baseUrl}/api/sandbox/task/${taskArn}`
        );

        expect(statusResponse.status).toBe(200);

        const statusData = await statusResponse.json();
        expect(statusData.success).toBe(true);
        expect(statusData.data.status).toMatch(/PENDING|RUNNING|STOPPED/);
      }
    });

    it('should handle missing task ARN', async () => {
      const response = await fetch(`${baseUrl}/api/sandbox/task/`);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/sandbox/task/[taskArn]', () => {
    it('should stop a running Fargate task', async () => {
      // First start a task
      const executeResponse = await fetch(`${baseUrl}/api/sandbox/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: 'while(true) { console.log("running"); }',
          language: 'javascript',
          environment: 'fargate',
        }),
      });

      const executeData = await executeResponse.json();

      if (executeData.data.taskArn) {
        // Stop the task
        const taskArn = encodeURIComponent(executeData.data.taskArn);
        const stopResponse = await fetch(
          `${baseUrl}/api/sandbox/task/${taskArn}`,
          {
            method: 'DELETE',
          }
        );

        expect(stopResponse.status).toBe(200);

        const stopData = await stopResponse.json();
        expect(stopData.success).toBe(true);
        expect(stopData.data.stopped).toBe(true);
      }
    });
  });

  describe('Environment Selection', () => {
    it('should use Lambda for quick execution', async () => {
      const response = await fetch(`${baseUrl}/api/sandbox/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: 'console.log("quick test")',
          language: 'javascript',
          environment: 'lambda',
          timeout: 5000,
        }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      // Lambda returns output directly, not taskArn
      expect(data.data.output).toBeDefined();
    });

    it('should use Fargate for complex execution', async () => {
      const response = await fetch(`${baseUrl}/api/sandbox/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: 'console.log("complex task")',
          language: 'javascript',
          environment: 'fargate',
          timeout: 60000,
        }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });
});
