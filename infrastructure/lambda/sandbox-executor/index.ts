/**
 * Lambda Function: Sandbox Code Executor
 * 
 * Purpose: Execute user code in an isolated environment for quick previews
 * Runtime: Node.js 20
 * Memory: 512 MB
 * Timeout: 15 seconds
 * 
 * Security:
 * - No network access
 * - Read-only file system
 * - Resource limits enforced
 */

import { Context } from 'aws-lambda';
import { VM } from 'vm2';

interface ExecuteRequest {
  code: string;
  language: 'javascript' | 'typescript';
  timeout?: number;
}

interface ExecuteResponse {
  success: boolean;
  output?: string;
  errors?: string[];
  executionTime?: number;
  previewUrl?: string;
}

/**
 * Lambda handler for code execution
 */
export async function handler(
  event: ExecuteRequest,
  context: Context
): Promise<ExecuteResponse> {
  const startTime = Date.now();
  const { code, language, timeout = 15000 } = event;

  // Validate input
  if (!code || typeof code !== 'string') {
    return {
      success: false,
      errors: ['Invalid code input'],
    };
  }

  if (language !== 'javascript' && language !== 'typescript') {
    return {
      success: false,
      errors: ['Only JavaScript and TypeScript are supported'],
    };
  }

  try {
    // Capture console output
    const logs: string[] = [];
    const errorLogs: string[] = [];

    // Create isolated VM with security restrictions
    const vm = new VM({
      timeout: Math.min(timeout, 15000), // Max 15 seconds
      sandbox: {
        console: {
          log: (...args: unknown[]) => {
            logs.push(args.map(arg => String(arg)).join(' '));
          },
          error: (...args: unknown[]) => {
            errorLogs.push(args.map(arg => String(arg)).join(' '));
          },
          warn: (...args: unknown[]) => {
            logs.push('[WARN] ' + args.map(arg => String(arg)).join(' '));
          },
          info: (...args: unknown[]) => {
            logs.push('[INFO] ' + args.map(arg => String(arg)).join(' '));
          },
        },
      },
      eval: false, // Disable eval
      wasm: false, // Disable WebAssembly
      fixAsync: true, // Fix async/await
    });

    // Execute code in VM
    let result;
    try {
      result = vm.run(code);
    } catch (error) {
      errorLogs.push(error instanceof Error ? error.message : String(error));
    }

    const executionTime = Date.now() - startTime;

    // Return execution result
    return {
      success: errorLogs.length === 0,
      output: logs.join('\n'),
      errors: errorLogs.length > 0 ? errorLogs : undefined,
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
