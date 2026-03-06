import { NextRequest, NextResponse } from 'next/server';
import { getExecutionResult } from '@/lib/sandbox/result-storage';

interface RouteParams {
  params: {
    resultId: string;
  };
}

/**
 * GET /api/sandbox/result/[resultId]
 * 
 * Retrieve a stored execution result by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { resultId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Validate required parameters
    if (!resultId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Result ID is required',
          },
        },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'User ID is required',
          },
        },
        { status: 400 }
      );
    }

    // Retrieve result from storage
    const storedResult = await getExecutionResult(resultId, userId);

    if (!storedResult) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RESULT_NOT_FOUND',
            message: 'Execution result not found or has expired',
          },
        },
        { status: 404 }
      );
    }

    // Return stored result
    return NextResponse.json({
      success: true,
      data: {
        resultId: storedResult.resultId,
        result: storedResult.result,
        previewUrl: storedResult.previewUrl,
        createdAt: storedResult.createdAt,
        expiresAt: storedResult.expiresAt,
      },
    });
  } catch (error) {
    console.error('Failed to retrieve execution result:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RETRIEVAL_FAILED',
          message: error instanceof Error ? error.message : 'Failed to retrieve result',
        },
      },
      { status: 500 }
    );
  }
}
