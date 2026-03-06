/**
 * Integration Tests: Sandbox Resource Limit Enforcement
 * 
 * Tests end-to-end resource limit enforcement across sandbox execution
 */

import { describe, it, expect, beforeAll } from 'vitest';

describe('Sandbox Resource Limit Enforcement (Integration)', () => {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  describe('Lambda Resource Limits', () => {
    it('should enforce 15-second timeout limit', async () => {
      const response = await fetch(`${API_BASE}/api/sandbox/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'console.log("test");',
          language: 'javascript',
          timeout: 20000, // Request 20 seconds (exceeds limit)
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('timeout');
      expect(data.error.message).toContain('15000ms');
    });

    it('should enforce 512MB memory limit', async () => {
      const response = await fetch(`${API_BASE}/api/sandbox/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'console.log("test");',
          language: 'javascript',
          memory: 1024, // Request 1GB (exceeds limit)
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('memory');
      expect(data.error.message).toContain('512MB');
    });

    it('should accept timeout within limits', async () => {
      const response = await fetch(`${API_BASE}/api/sandbox/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'console.log("Hello, World!");',
          language: 'javascript',
          timeout: 10000, // 10 seconds (within limit)
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.resourceLimits).toBeDefined();
      expect(data.data.resourceLimits.timeout).toBe(10000);
      expect(data.data.resourceLimits.memory).toBe(512);
      expect(data.data.resourceLimits.enforced).toBe(true);
    });

    it('should truncate large output exceeding 1MB', async () => {
      // Generate code that produces large output
      const code = `
        const largeString = 'x'.repeat(2 * 1024 * 1024); // 2 MB
        console.log(largeString);
      `;

      const response = await fetch(`${API_BASE}/api/sandbox/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: 'javascript',
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.output).toContain('[Output truncated: exceeded maximum size limit]');
      
      // Verify output size is within limit
      const outputSize = Buffer.byteLength(data.data.output, 'utf8');
      expect(outputSize).toBeLessThanOrEqual(1024 * 1024); // 1 MB
    });
  });

  describe('Fargate Resource Limits', () => {
    it('should enforce 30-minute timeout limit', async () => {
      const response = await fetch(`${API_BASE}/api/sandbox/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'console.log("test");',
          language: 'javascript',
          timeout: 2000000, // Request 33+ minutes (exceeds limit)
          environment: 'fargate',
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('timeout');
      expect(data.error.message).toContain('1800000ms');
    });

    it('should enforce 2GB memory limit', async () => {
      const response = await fetch(`${API_BASE}/api/sandbox/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'console.log("test");',
          language: 'javascript',
          memory: 4096, // Request 4GB (exceeds limit)
          environment: 'fargate',
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('memory');
      expect(data.error.message).toContain('2048MB');
    });

    it('should accept timeout within limits', async () => {
      const response = await fetch(`${API_BASE}/api/sandbox/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'console.log("Hello, World!");',
          language: 'javascript',
          timeout: 1000000, // ~16 minutes (within limit)
          environment: 'fargate',
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.resourceLimits).toBeDefined();
      expect(data.data.resourceLimits.timeout).toBe(1000000);
      expect(data.data.resourceLimits.memory).toBe(2048);
      expect(data.data.resourceLimits.cpu).toBe(1024);
      expect(data.data.resourceLimits.enforced).toBe(true);
    });

    it('should truncate large output exceeding 10MB', async () => {
      // Generate code that produces large output
      const code = `
        const largeString = 'x'.repeat(15 * 1024 * 1024); // 15 MB
        console.log(largeString);
      `;

      const response = await fetch(`${API_BASE}/api/sandbox/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: 'javascript',
          environment: 'fargate',
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      if (data.data.output) {
        expect(data.data.output).toContain('[Output truncated: exceeded maximum size limit]');
        
        // Verify output size is within limit
        const outputSize = Buffer.byteLength(data.data.output, 'utf8');
        expect(outputSize).toBeLessThanOrEqual(10 * 1024 * 1024); // 10 MB
      }
    });
  });

  describe('Resource Limit Boundary Conditions', () => {
    it('should accept exact Lambda timeout limit', async () => {
      const response = await fetch(`${API_BASE}/api/sandbox/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'console.log("test");',
          language: 'javascript',
          timeout: 15000, // Exactly 15 seconds
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.resourceLimits.timeout).toBe(15000);
    });

    it('should reject timeout just above Lambda limit', async () => {
      const response = await fetch(`${API_BASE}/api/sandbox/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'console.log("test");',
          language: 'javascript',
          timeout: 15001, // Just over 15 seconds
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should accept exact Fargate timeout limit', async () => {
      const response = await fetch(`${API_BASE}/api/sandbox/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'console.log("test");',
          language: 'javascript',
          timeout: 1800000, // Exactly 30 minutes
          environment: 'fargate',
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.resourceLimits.timeout).toBe(1800000);
    });

    it('should reject timeout just above Fargate limit', async () => {
      const response = await fetch(`${API_BASE}/api/sandbox/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'console.log("test");',
          language: 'javascript',
          timeout: 1800001, // Just over 30 minutes
          environment: 'fargate',
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('Multiple Resource Violations', () => {
    it('should report all resource limit violations', async () => {
      const response = await fetch(`${API_BASE}/api/sandbox/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'console.log("test");',
          language: 'javascript',
          timeout: 20000, // Exceeds limit
          memory: 1024,   // Exceeds limit
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('timeout');
      expect(data.error.message).toContain('memory');
    });
  });

  describe('Default Resource Limits', () => {
    it('should use default limits when not specified', async () => {
      const response = await fetch(`${API_BASE}/api/sandbox/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'console.log("Hello, World!");',
          language: 'javascript',
          // No timeout or memory specified
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.resourceLimits).toBeDefined();
      expect(data.data.resourceLimits.timeout).toBe(15000); // Default Lambda timeout
      expect(data.data.resourceLimits.memory).toBe(512);    // Default Lambda memory
    });
  });
});
