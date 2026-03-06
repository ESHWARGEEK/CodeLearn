import { NextRequest, NextResponse } from 'next/server';
import { executeLambda, isLambdaAvailable } from '@/lib/sandbox/lambda-executor';
import { executeFargate, isFargateAvailable } from '@/lib/sandbox/fargate-executor';
import {
  formatExecutionResult,
  parseConsoleOutput,
  generateUserFriendlyError,
  validateExecutionResult,
  type ExecutionResult,
} from '@/lib/sandbox/result-handler';
import {
  storeExecutionResult,
  isResultStorageAvailable,
} from '@/lib/sandbox/result-storage';
import {
  validateResourceRequest,
  getResourceLimits,
} from '@/lib/sandbox/resource-limits';

interface ExecuteRequest {
  code: string;
  language: string;
  timeout?: number;
  memory?: number;
  environment?: 'lambda' | 'fargate';
  userId?: string;
  projectId?: string;
}

const SUPPORTED_LANGUAGES = ['javascript', 'typescript'] as const;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse and validate request body
    const body: ExecuteRequest = await request.json();
    const { code, language, timeout, memory, environment = 'lambda', userId, projectId } = body;

    // Validate required fields
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Code is required and must be a string',
          },
        },
        { status: 400 }
      );
    }

    if (!language || typeof language !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Language is required and must be a string',
          },
        },
        { status: 400 }
      );
    }

    // Validate language
    if (!SUPPORTED_LANGUAGES.includes(language as any)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_LANGUAGE',
            message: `Only ${SUPPORTED_LANGUAGES.join(', ')} are supported`,
          },
        },
        { status: 400 }
      );
    }

    // Validate environment
    if (environment !== 'lambda' && environment !== 'fargate') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ENVIRONMENT',
            message: 'Environment must be either "lambda" or "fargate"',
          },
        },
        { status: 400 }
      );
    }

    // Validate resource limits
    const resourceLimits = getResourceLimits(environment);
    const validation = validateResourceRequest(
      { timeout, memory },
      resourceLimits
    );

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RESOURCE_LIMIT_EXCEEDED',
            message: validation.errors.join('; '),
          },
        },
        { status: 400 }
      );
    }

    // Validate code length (prevent abuse)
    if (code.length > 100000) { // 100KB limit
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CODE_TOO_LARGE',
            message: 'Code exceeds maximum size of 100KB',
          },
        },
        { status: 400 }
      );
    }

    // Execute in Lambda for quick execution
    if (environment === 'lambda') {
      if (!isLambdaAvailable()) {
        console.warn('Lambda executor not available, falling back to mock execution');
        return await mockExecution(code, timeout || resourceLimits.timeout);
      }

      try {
        const result = await executeLambda({
          code,
          language: language as 'javascript' | 'typescript',
          timeout,
          memory,
        });

        // Validate result structure
        if (!validateExecutionResult(result)) {
          console.error('Invalid execution result structure:', result);
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'INVALID_RESULT',
                message: 'Execution returned invalid result structure',
              },
            },
            { status: 500 }
          );
        }

        // Parse console output for better display
        const consoleOutput = result.output ? parseConsoleOutput(result.output) : undefined;

        // Format the result with proper sanitization
        const formattedResult = formatExecutionResult(
          {
            ...result,
            consoleOutput,
          },
          startTime
        );

        // Store result if storage is available and userId provided
        if (isResultStorageAvailable() && userId) {
          try {
            const storedResult = await storeExecutionResult(
              userId,
              code,
              language as 'javascript' | 'typescript',
              {
                ...result,
                consoleOutput,
              },
              projectId
            );

            // Add preview URL to response if available
            if (storedResult.previewUrl && formattedResult.data) {
              formattedResult.data.previewUrl = storedResult.previewUrl;
            }
          } catch (storageError) {
            console.error('Failed to store execution result:', storageError);
            // Continue without storage - don't fail the request
          }
        }

        // Return formatted result
        return NextResponse.json(formattedResult);
      } catch (error) {
        console.error('Lambda execution error:', error);
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'LAMBDA_EXECUTION_FAILED',
              message: error instanceof Error ? error.message : 'Lambda execution failed',
            },
          },
          { status: 500 }
        );
      }
    }

    // Execute in Fargate for complex/long-running code
    if (environment === 'fargate') {
      if (!isFargateAvailable()) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FARGATE_UNAVAILABLE',
              message: 'Fargate execution is not configured. Please use lambda environment.',
            },
          },
          { status: 503 }
        );
      }

      try {
        const result = await executeFargate({
          code,
          language: language as 'javascript' | 'typescript',
          timeout,
          memory,
        });

        // Validate result structure
        if (!validateExecutionResult(result)) {
          console.error('Invalid Fargate result structure:', result);
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'INVALID_RESULT',
                message: 'Fargate execution returned invalid result structure',
              },
            },
            { status: 500 }
          );
        }

        if (!result.success) {
          const friendlyError = generateUserFriendlyError(result.errors || []);
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'FARGATE_EXECUTION_FAILED',
                message: friendlyError,
                details: result.errors?.[0],
              },
            },
            { status: 500 }
          );
        }

        // Parse console output
        const consoleOutput = result.output ? parseConsoleOutput(result.output) : undefined;

        // Format the result
        const formattedResult = formatExecutionResult(
          {
            ...result,
            consoleOutput,
          },
          startTime
        );

        // Store result if storage is available and userId provided
        if (isResultStorageAvailable() && userId) {
          try {
            const storedResult = await storeExecutionResult(
              userId,
              code,
              language as 'javascript' | 'typescript',
              {
                ...result,
                consoleOutput,
              },
              projectId
            );

            // Add preview URL to response if available
            if (storedResult.previewUrl && formattedResult.data) {
              formattedResult.data.previewUrl = storedResult.previewUrl;
            }
          } catch (storageError) {
            console.error('Failed to store Fargate result:', storageError);
            // Continue without storage
          }
        }

        return NextResponse.json(formattedResult);
      } catch (error) {
        console.error('Fargate execution error:', error);
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FARGATE_EXECUTION_FAILED',
              message: error instanceof Error ? error.message : 'Fargate execution failed',
            },
          },
          { status: 500 }
        );
      }
    }

    // Should never reach here due to validation above
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_ENVIRONMENT',
          message: 'Invalid execution environment',
        },
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Sandbox execution failed:', error);
    
    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'Invalid JSON in request body',
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'EXECUTION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to execute code',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Mock execution fallback when Lambda is unavailable
 */
async function mockExecution(code: string, timeout: number) {
  console.warn('Using mock execution - Lambda not available');
  
  // Simulate execution delay
  await new Promise((resolve) => setTimeout(resolve, Math.min(1000, timeout)));

  let output = '';
  let errors: string[] = [];

  try {
    // Very basic simulation - in production this would run in a sandbox
    if (code.includes('console.log')) {
      // Extract console.log content (very naive approach)
      const matches = code.match(/console\.log\((.*?)\)/g);
      if (matches) {
        output = matches.map(m => {
          const content = m.match(/console\.log\((.*?)\)/)?.[1] || '';
          return content.replace(/['"]/g, '');
        }).join('\n') + '\n';
      }
    } else {
      output = 'Code executed successfully (mock mode)\n';
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error');
  }

  return NextResponse.json({
    success: true,
    data: {
      output,
      errors,
      executionTime: 1000,
      previewUrl: null,
    },
  });
}
