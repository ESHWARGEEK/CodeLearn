/**
 * Unit Tests: Resource Limits
 * 
 * Tests resource limit enforcement for sandbox execution
 */

import { describe, it, expect } from 'vitest';
import {
  LAMBDA_LIMITS,
  FARGATE_LIMITS,
  enforceTimeout,
  enforceMemory,
  enforceOutputSize,
  validateResourceRequest,
  getResourceLimits,
} from '@/lib/sandbox/resource-limits';

describe('Resource Limits', () => {
  describe('Constants', () => {
    it('should define Lambda limits correctly', () => {
      expect(LAMBDA_LIMITS).toEqual({
        memory: 512,
        timeout: 15000,
        maxOutputSize: 1024 * 1024,
      });
    });

    it('should define Fargate limits correctly', () => {
      expect(FARGATE_LIMITS).toEqual({
        memory: 2048,
        cpu: 1024,
        timeout: 1800000,
        maxOutputSize: 10 * 1024 * 1024,
      });
    });
  });

  describe('enforceTimeout', () => {
    it('should return default timeout when no timeout requested', () => {
      const result = enforceTimeout(undefined, LAMBDA_LIMITS);
      expect(result).toBe(15000);
    });

    it('should return default timeout when zero timeout requested', () => {
      const result = enforceTimeout(0, LAMBDA_LIMITS);
      expect(result).toBe(15000);
    });

    it('should return default timeout when negative timeout requested', () => {
      const result = enforceTimeout(-1000, LAMBDA_LIMITS);
      expect(result).toBe(15000);
    });

    it('should return requested timeout when within limits', () => {
      const result = enforceTimeout(5000, LAMBDA_LIMITS);
      expect(result).toBe(5000);
    });

    it('should enforce maximum timeout for Lambda', () => {
      const result = enforceTimeout(20000, LAMBDA_LIMITS);
      expect(result).toBe(15000);
    });

    it('should enforce maximum timeout for Fargate', () => {
      const result = enforceTimeout(2000000, FARGATE_LIMITS);
      expect(result).toBe(1800000);
    });
  });

  describe('enforceMemory', () => {
    it('should return default memory when no memory requested', () => {
      const result = enforceMemory(undefined, LAMBDA_LIMITS);
      expect(result).toBe(512);
    });

    it('should return default memory when zero memory requested', () => {
      const result = enforceMemory(0, LAMBDA_LIMITS);
      expect(result).toBe(512);
    });

    it('should return default memory when negative memory requested', () => {
      const result = enforceMemory(-256, LAMBDA_LIMITS);
      expect(result).toBe(512);
    });

    it('should return requested memory when within limits', () => {
      const result = enforceMemory(256, LAMBDA_LIMITS);
      expect(result).toBe(256);
    });

    it('should enforce maximum memory for Lambda', () => {
      const result = enforceMemory(1024, LAMBDA_LIMITS);
      expect(result).toBe(512);
    });

    it('should enforce maximum memory for Fargate', () => {
      const result = enforceMemory(4096, FARGATE_LIMITS);
      expect(result).toBe(2048);
    });
  });

  describe('enforceOutputSize', () => {
    it('should not truncate output within limits', () => {
      const output = 'Hello, World!';
      const result = enforceOutputSize(output, LAMBDA_LIMITS);
      
      expect(result.output).toBe(output);
      expect(result.truncated).toBe(false);
    });

    it('should truncate output exceeding Lambda limits', () => {
      // Create output larger than 1 MB
      const largeOutput = 'x'.repeat(2 * 1024 * 1024);
      const result = enforceOutputSize(largeOutput, LAMBDA_LIMITS);
      
      expect(result.truncated).toBe(true);
      expect(result.output).toContain('[Output truncated: exceeded maximum size limit]');
      expect(Buffer.byteLength(result.output, 'utf8')).toBeLessThanOrEqual(LAMBDA_LIMITS.maxOutputSize);
    });

    it('should truncate output exceeding Fargate limits', () => {
      // Create output larger than 10 MB
      const largeOutput = 'x'.repeat(15 * 1024 * 1024);
      const result = enforceOutputSize(largeOutput, FARGATE_LIMITS);
      
      expect(result.truncated).toBe(true);
      expect(result.output).toContain('[Output truncated: exceeded maximum size limit]');
      expect(Buffer.byteLength(result.output, 'utf8')).toBeLessThanOrEqual(FARGATE_LIMITS.maxOutputSize);
    });

    it('should handle empty output', () => {
      const result = enforceOutputSize('', LAMBDA_LIMITS);
      
      expect(result.output).toBe('');
      expect(result.truncated).toBe(false);
    });

    it('should handle multi-byte characters correctly', () => {
      // Create output with multi-byte characters (emoji)
      const output = '🚀'.repeat(500000); // Each emoji is 4 bytes
      const result = enforceOutputSize(output, LAMBDA_LIMITS);
      
      if (Buffer.byteLength(output, 'utf8') > LAMBDA_LIMITS.maxOutputSize) {
        expect(result.truncated).toBe(true);
        expect(Buffer.byteLength(result.output, 'utf8')).toBeLessThanOrEqual(LAMBDA_LIMITS.maxOutputSize);
      } else {
        expect(result.truncated).toBe(false);
      }
    });
  });

  describe('validateResourceRequest', () => {
    it('should validate request within Lambda limits', () => {
      const result = validateResourceRequest(
        { timeout: 10000, memory: 256 },
        LAMBDA_LIMITS
      );
      
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate request within Fargate limits', () => {
      const result = validateResourceRequest(
        { timeout: 1000000, memory: 1024 },
        FARGATE_LIMITS
      );
      
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject timeout exceeding Lambda limits', () => {
      const result = validateResourceRequest(
        { timeout: 20000 },
        LAMBDA_LIMITS
      );
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Requested timeout 20000ms exceeds maximum 15000ms');
    });

    it('should reject memory exceeding Lambda limits', () => {
      const result = validateResourceRequest(
        { memory: 1024 },
        LAMBDA_LIMITS
      );
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Requested memory 1024MB exceeds maximum 512MB');
    });

    it('should reject timeout exceeding Fargate limits', () => {
      const result = validateResourceRequest(
        { timeout: 2000000 },
        FARGATE_LIMITS
      );
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Requested timeout 2000000ms exceeds maximum 1800000ms');
    });

    it('should reject memory exceeding Fargate limits', () => {
      const result = validateResourceRequest(
        { memory: 4096 },
        FARGATE_LIMITS
      );
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Requested memory 4096MB exceeds maximum 2048MB');
    });

    it('should reject multiple violations', () => {
      const result = validateResourceRequest(
        { timeout: 20000, memory: 1024 },
        LAMBDA_LIMITS
      );
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContain('Requested timeout 20000ms exceeds maximum 15000ms');
      expect(result.errors).toContain('Requested memory 1024MB exceeds maximum 512MB');
    });

    it('should validate empty request', () => {
      const result = validateResourceRequest({}, LAMBDA_LIMITS);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('getResourceLimits', () => {
    it('should return Lambda limits for lambda environment', () => {
      const result = getResourceLimits('lambda');
      expect(result).toEqual(LAMBDA_LIMITS);
    });

    it('should return Fargate limits for fargate environment', () => {
      const result = getResourceLimits('fargate');
      expect(result).toEqual(FARGATE_LIMITS);
    });
  });

  describe('Resource Limit Boundaries', () => {
    it('should handle exact limit values for Lambda', () => {
      const timeoutResult = enforceTimeout(15000, LAMBDA_LIMITS);
      const memoryResult = enforceMemory(512, LAMBDA_LIMITS);
      
      expect(timeoutResult).toBe(15000);
      expect(memoryResult).toBe(512);
    });

    it('should handle exact limit values for Fargate', () => {
      const timeoutResult = enforceTimeout(1800000, FARGATE_LIMITS);
      const memoryResult = enforceMemory(2048, FARGATE_LIMITS);
      
      expect(timeoutResult).toBe(1800000);
      expect(memoryResult).toBe(2048);
    });

    it('should handle values just below limits', () => {
      const timeoutResult = enforceTimeout(14999, LAMBDA_LIMITS);
      const memoryResult = enforceMemory(511, LAMBDA_LIMITS);
      
      expect(timeoutResult).toBe(14999);
      expect(memoryResult).toBe(511);
    });

    it('should handle values just above limits', () => {
      const timeoutResult = enforceTimeout(15001, LAMBDA_LIMITS);
      const memoryResult = enforceMemory(513, LAMBDA_LIMITS);
      
      expect(timeoutResult).toBe(15000);
      expect(memoryResult).toBe(512);
    });
  });
});
