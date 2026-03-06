/**
 * Sandbox Execution Result Handler
 * 
 * Handles processing, formatting, and sanitizing execution results
 * from Lambda and Fargate sandbox environments.
 */

export interface ExecutionResult {
  success: boolean;
  output?: string;
  errors?: string[];
  executionTime?: number;
  previewUrl?: string;
  taskArn?: string;
  status?: string;
  consoleOutput?: ConsoleOutput[];
  metrics?: ExecutionMetrics;
}

export interface ConsoleOutput {
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: number;
}

export interface ExecutionMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  memoryUsed?: number;
  cpuUsed?: number;
}

export interface FormattedResult {
  success: boolean;
  data?: {
    output: string;
    errors: string[];
    executionTime: number;
    previewUrl: string | null;
    consoleOutput?: ConsoleOutput[];
    metrics?: ExecutionMetrics;
  };
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

/**
 * Format execution result for API response
 */
export function formatExecutionResult(
  result: ExecutionResult,
  startTime: number
): FormattedResult {
  const endTime = Date.now();
  const duration = endTime - startTime;

  // Handle successful execution
  if (result.success) {
    return {
      success: true,
      data: {
        output: sanitizeOutput(result.output || ''),
        errors: sanitizeErrors(result.errors || []),
        executionTime: result.executionTime || duration,
        previewUrl: result.previewUrl || null,
        consoleOutput: result.consoleOutput,
        metrics: result.metrics || {
          startTime,
          endTime,
          duration,
        },
      },
    };
  }

  // Handle execution failure
  return {
    success: false,
    data: {
      output: sanitizeOutput(result.output || ''),
      errors: sanitizeErrors(result.errors || ['Unknown execution error']),
      executionTime: result.executionTime || duration,
      previewUrl: null,
      consoleOutput: result.consoleOutput,
      metrics: result.metrics || {
        startTime,
        endTime,
        duration,
      },
    },
  };
}

/**
 * Sanitize output to prevent XSS and limit size
 */
export function sanitizeOutput(output: string): string {
  if (!output) return '';

  // Limit output size to 10KB
  const MAX_OUTPUT_SIZE = 10 * 1024;
  let sanitized = output;

  if (sanitized.length > MAX_OUTPUT_SIZE) {
    sanitized = sanitized.substring(0, MAX_OUTPUT_SIZE);
    sanitized += '\n\n[Output truncated - exceeded 10KB limit]';
  }

  // Remove ANSI escape codes
  sanitized = sanitized.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ''
  );

  // Basic HTML escaping (additional layer of security)
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  return sanitized;
}

/**
 * Sanitize error messages
 */
export function sanitizeErrors(errors: string[]): string[] {
  return errors.map((error) => {
    // Limit each error message to 1KB
    const MAX_ERROR_SIZE = 1024;
    let sanitized = error;

    if (sanitized.length > MAX_ERROR_SIZE) {
      sanitized = sanitized.substring(0, MAX_ERROR_SIZE);
      sanitized += '... [truncated]';
    }

    // Remove ANSI codes
    sanitized = sanitized.replace(
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
      ''
    );

    // Basic HTML escaping (additional layer of security)
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // Remove sensitive file paths (replace with generic paths)
    sanitized = sanitized.replace(/\/home\/[^/]+/g, '/home/user');
    sanitized = sanitized.replace(/\/Users\/[^/]+/g, '/Users/user');
    sanitized = sanitized.replace(/C:\\Users\\[^\\]+/g, 'C:\\Users\\user');

    return sanitized;
  });
}

/**
 * Categorize error type for better handling
 */
export function categorizeError(error: string): {
  category: 'syntax' | 'runtime' | 'timeout' | 'memory' | 'network' | 'unknown';
  severity: 'low' | 'medium' | 'high';
} {
  const lowerError = error.toLowerCase();

  // Syntax errors
  if (
    lowerError.includes('syntaxerror') ||
    lowerError.includes('unexpected token') ||
    lowerError.includes('unexpected identifier')
  ) {
    return { category: 'syntax', severity: 'medium' };
  }

  // Runtime errors
  if (
    lowerError.includes('referenceerror') ||
    lowerError.includes('typeerror') ||
    lowerError.includes('rangeerror')
  ) {
    return { category: 'runtime', severity: 'medium' };
  }

  // Timeout errors
  if (
    lowerError.includes('timeout') ||
    lowerError.includes('timed out') ||
    lowerError.includes('execution exceeded')
  ) {
    return { category: 'timeout', severity: 'high' };
  }

  // Memory errors
  if (
    lowerError.includes('out of memory') ||
    lowerError.includes('heap') ||
    lowerError.includes('stack overflow')
  ) {
    return { category: 'memory', severity: 'high' };
  }

  // Network errors
  if (
    lowerError.includes('network') ||
    lowerError.includes('econnrefused') ||
    lowerError.includes('enotfound')
  ) {
    return { category: 'network', severity: 'low' };
  }

  return { category: 'unknown', severity: 'medium' };
}

/**
 * Parse console output from execution result
 */
export function parseConsoleOutput(output: string): ConsoleOutput[] {
  if (!output) return [];

  const lines = output.split('\n').filter((line) => line.trim());
  const consoleOutput: ConsoleOutput[] = [];

  for (const line of lines) {
    let type: ConsoleOutput['type'] = 'log';

    // Detect console type from prefixes
    if (line.startsWith('[ERROR]') || line.includes('Error:')) {
      type = 'error';
    } else if (line.startsWith('[WARN]')) {
      type = 'warn';
    } else if (line.startsWith('[INFO]')) {
      type = 'info';
    }

    // Remove prefix for cleaner display
    const message = line
      .replace(/^\[(ERROR|WARN|INFO)\]\s*/, '')
      .trim();

    if (message) {
      consoleOutput.push({
        type,
        message,
        timestamp: Date.now(),
      });
    }
  }

  return consoleOutput;
}

/**
 * Generate user-friendly error message
 */
export function generateUserFriendlyError(errors: string[]): string {
  if (!errors || errors.length === 0) {
    return 'An unknown error occurred during execution';
  }

  const firstError = errors[0];
  const { category } = categorizeError(firstError);

  switch (category) {
    case 'syntax':
      return 'Syntax error in your code. Please check for missing brackets, quotes, or semicolons.';
    case 'runtime':
      return 'Runtime error occurred. Check if all variables are defined and used correctly.';
    case 'timeout':
      return 'Execution timed out. Your code may have an infinite loop or is taking too long.';
    case 'memory':
      return 'Out of memory. Try reducing the amount of data your code processes.';
    case 'network':
      return 'Network access is restricted in the sandbox environment.';
    default:
      return firstError;
  }
}

/**
 * Validate execution result structure
 */
export function validateExecutionResult(result: unknown): result is ExecutionResult {
  if (!result || typeof result !== 'object') {
    return false;
  }

  const r = result as Partial<ExecutionResult>;

  // Must have success field
  if (typeof r.success !== 'boolean') {
    return false;
  }

  // Optional fields must have correct types if present
  if (r.output !== undefined && typeof r.output !== 'string') {
    return false;
  }

  if (r.errors !== undefined && !Array.isArray(r.errors)) {
    return false;
  }

  if (r.executionTime !== undefined && typeof r.executionTime !== 'number') {
    return false;
  }

  return true;
}

/**
 * Merge multiple execution results (for multi-step executions)
 */
export function mergeExecutionResults(results: ExecutionResult[]): ExecutionResult {
  if (results.length === 0) {
    return {
      success: false,
      errors: ['No execution results to merge'],
    };
  }

  if (results.length === 1) {
    return results[0];
  }

  const allSuccessful = results.every((r) => r.success);
  const allOutputs = results.map((r) => r.output || '').filter(Boolean);
  const allErrors = results.flatMap((r) => r.errors || []);
  const totalExecutionTime = results.reduce((sum, r) => sum + (r.executionTime || 0), 0);

  return {
    success: allSuccessful,
    output: allOutputs.join('\n\n'),
    errors: allErrors.length > 0 ? allErrors : undefined,
    executionTime: totalExecutionTime,
  };
}
