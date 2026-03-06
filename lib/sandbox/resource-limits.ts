/**
 * Resource Limits Configuration
 * 
 * Defines and enforces resource limits for sandbox execution environments
 * Based on requirements: NFR-16.2 (Sandbox Security and Isolation)
 */

export interface ResourceLimits {
  memory: number;      // Memory in MB
  cpu?: number;        // CPU units (1 vCPU = 1024 units)
  timeout: number;     // Timeout in milliseconds
  maxOutputSize: number; // Maximum output size in bytes
}

/**
 * Lambda resource limits
 * - Memory: 512 MB
 * - Timeout: 15 seconds
 * - No CPU limit (managed by Lambda)
 */
export const LAMBDA_LIMITS: ResourceLimits = {
  memory: 512,
  timeout: 15000, // 15 seconds
  maxOutputSize: 1024 * 1024, // 1 MB
};

/**
 * Fargate resource limits
 * - Memory: 2048 MB (2 GB)
 * - CPU: 1024 units (1 vCPU)
 * - Timeout: 1800000 ms (30 minutes)
 */
export const FARGATE_LIMITS: ResourceLimits = {
  memory: 2048,
  cpu: 1024,
  timeout: 1800000, // 30 minutes
  maxOutputSize: 10 * 1024 * 1024, // 10 MB
};

/**
 * Validate and enforce timeout limits
 */
export function enforceTimeout(
  requestedTimeout: number | undefined,
  limits: ResourceLimits
): number {
  if (!requestedTimeout || requestedTimeout <= 0) {
    return limits.timeout;
  }
  
  // Enforce maximum timeout
  return Math.min(requestedTimeout, limits.timeout);
}

/**
 * Validate and enforce memory limits
 */
export function enforceMemory(
  requestedMemory: number | undefined,
  limits: ResourceLimits
): number {
  if (!requestedMemory || requestedMemory <= 0) {
    return limits.memory;
  }
  
  // Enforce maximum memory
  return Math.min(requestedMemory, limits.memory);
}

/**
 * Truncate output if it exceeds maximum size
 */
export function enforceOutputSize(
  output: string,
  limits: ResourceLimits
): { output: string; truncated: boolean } {
  const outputBytes = Buffer.byteLength(output, 'utf8');
  
  if (outputBytes <= limits.maxOutputSize) {
    return { output, truncated: false };
  }
  
  // Truncate output to fit within limit
  const truncationMessage = '\n\n[Output truncated: exceeded maximum size limit]';
  const availableBytes = limits.maxOutputSize - Buffer.byteLength(truncationMessage, 'utf8');
  
  let truncatedOutput = output;
  while (Buffer.byteLength(truncatedOutput, 'utf8') > availableBytes) {
    truncatedOutput = truncatedOutput.slice(0, Math.floor(truncatedOutput.length * 0.9));
  }
  
  return {
    output: truncatedOutput + truncationMessage,
    truncated: true,
  };
}

/**
 * Check if resource request is within limits
 */
export function validateResourceRequest(
  request: {
    timeout?: number;
    memory?: number;
  },
  limits: ResourceLimits
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (request.timeout && request.timeout > limits.timeout) {
    errors.push(
      `Requested timeout ${request.timeout}ms exceeds maximum ${limits.timeout}ms`
    );
  }
  
  if (request.memory && request.memory > limits.memory) {
    errors.push(
      `Requested memory ${request.memory}MB exceeds maximum ${limits.memory}MB`
    );
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get resource limits for execution environment
 */
export function getResourceLimits(
  environment: 'lambda' | 'fargate'
): ResourceLimits {
  return environment === 'lambda' ? LAMBDA_LIMITS : FARGATE_LIMITS;
}
