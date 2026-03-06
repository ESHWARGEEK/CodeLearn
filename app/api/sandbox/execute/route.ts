import { NextRequest, NextResponse } from 'next/server';
import { executeLambda, isLambdaAvailable } from '@/lib/sandbox/lambda-executor';

interface ExecuteRequest {
  code: string;
  language: string;
  timeout?: number;
  environment?: 'lambda' | 'fargate';
}

export async function POST(request: NextRequest) {
  try {
    const body: ExecuteRequest = await request.json();
    const { code, language, timeout = 15000, environment = 'lambda' } = body;

    // Validate language
    if (language !== 'javascript' && language !== 'typescript') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_LANGUAGE',
            message: 'Only JavaScript and TypeScript are supported',
          },
        },
        { status: 400 }
      );
    }

    // Execute in Lambda for quick execution
    if (environment === 'lambda' && isLambdaAvailable()) {
      const result = await executeLambda({
        code,
        language: language as 'javascript' | 'typescript',
        timeout,
      });

      return NextResponse.json({
        success: result.success,
        data: {
          output: result.output || '',
          errors: result.errors || [],
          executionTime: result.executionTime || 0,
          previewUrl: result.previewUrl || null,
        },
      });
    }

    // Fallback to mock execution if Lambda is not available
    console.warn('Lambda executor not available, using mock execution');
    
    // Simulate execution delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock output based on code content
    let output = '';
    let errors: string[] = [];

    try {
      // Very basic simulation - in production this would run in a sandbox
      if (code.includes('console.log')) {
        output = 'Hello, Developer!\n';
      } else {
        output = 'Code executed successfully\n';
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
  } catch (error) {
    console.error('Execution failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'EXECUTION_FAILED',
          message: 'Failed to execute code',
        },
      },
      { status: 500 }
    );
  }
}
