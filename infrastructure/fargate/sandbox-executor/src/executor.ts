import { VM } from 'vm2';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';

export interface ExecuteRequest {
  code: string;
  language: 'javascript' | 'typescript';
  timeout?: number;
}

export interface ExecuteResponse {
  success: boolean;
  output?: string;
  errors?: string[];
  executionTime?: number;
  previewUrl?: string;
}

/**
 * Execute code in isolated VM
 */
export async function executeCode(
  request: ExecuteRequest
): Promise<ExecuteResponse> {
  const startTime = Date.now();
  const { code, language, timeout = 30000 } = request;

  try {
    // Create temporary directory for this execution
    const executionId = randomUUID();
    const tempDir = path.join('/tmp/sandbox', executionId);
    await fs.mkdir(tempDir, { recursive: true });

    let output = '';
    const errors: string[] = [];

    try {
      // Transpile TypeScript to JavaScript if needed
      let executableCode = code;
      if (language === 'typescript') {
        // For MVP, we'll use a simple approach
        // In production, use proper TypeScript compiler
        executableCode = code
          .replace(/: (string|number|boolean|any)\b/g, '')
          .replace(/interface \w+ \{[^}]+\}/g, '')
          .replace(/type \w+ = [^;]+;/g, '');
      }

      // Create VM with limited capabilities
      const vm = new VM({
        timeout,
        sandbox: {
          console: {
            log: (...args: any[]) => {
              output += args.map(String).join(' ') + '\n';
            },
            error: (...args: any[]) => {
              errors.push(args.map(String).join(' '));
            },
            warn: (...args: any[]) => {
              output += '[WARN] ' + args.map(String).join(' ') + '\n';
            },
            info: (...args: any[]) => {
              output += '[INFO] ' + args.map(String).join(' ') + '\n';
            },
          },
        },
        eval: false,
        wasm: false,
        fixAsync: true,
      });

      // Execute the code
      const result = vm.run(executableCode);

      // If the result is a promise, wait for it
      if (result && typeof result.then === 'function') {
        await Promise.race([
          result,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Async timeout')), timeout)
          ),
        ]);
      }

      // If code produces a value, add it to output
      if (result !== undefined && result !== null) {
        output += String(result) + '\n';
      }
    } catch (error) {
      if (error instanceof Error) {
        errors.push(error.message);
        
        // Add stack trace for debugging
        if (error.stack) {
          errors.push(error.stack);
        }
      } else {
        errors.push(String(error));
      }
    } finally {
      // Cleanup temporary directory
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }

    const executionTime = Date.now() - startTime;

    return {
      success: errors.length === 0,
      output: output || undefined,
      errors: errors.length > 0 ? errors : undefined,
      executionTime,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    return {
      success: false,
      errors: [
        error instanceof Error ? error.message : 'Unknown execution error',
      ],
      executionTime,
    };
  }
}

/**
 * Check if execution environment is ready
 */
export async function checkEnvironment(): Promise<boolean> {
  try {
    // Verify temp directory is writable
    const testDir = path.join('/tmp/sandbox', 'test');
    await fs.mkdir(testDir, { recursive: true });
    await fs.rm(testDir, { recursive: true });
    return true;
  } catch (error) {
    console.error('Environment check failed:', error);
    return false;
  }
}
