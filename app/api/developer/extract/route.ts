import { NextRequest, NextResponse } from 'next/server';
import { ExtractionResponse } from '@/types/templates';
import { validateGitHubUrl } from '@/lib/utils/github-url-validator';
import { CodeAgent } from '@/lib/agents/code-agent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { githubUrl, componentPath } = body;

    // Validate GitHub URL
    if (!githubUrl || typeof githubUrl !== 'string') {
      const errorResponse: ExtractionResponse = {
        success: false,
        error: {
          code: 'INVALID_URL',
          message: 'GitHub URL is required',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Use comprehensive GitHub URL validator
    const validation = validateGitHubUrl(githubUrl);
    if (!validation.isValid) {
      const errorResponse: ExtractionResponse = {
        success: false,
        error: {
          code: 'INVALID_URL_FORMAT',
          message: validation.error || 'Please provide a valid GitHub repository URL',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // TODO: Check rate limiting for user
    // TODO: Validate user authentication

    // Generate a job ID for async processing
    const jobId = `extract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Queue the extraction job (simulate async processing)
    console.log('Creating extraction job:', {
      jobId,
      githubUrl: validation.normalizedUrl,
      componentPath,
      timestamp: new Date().toISOString(),
    });

    // Start async processing (in a real implementation, this would be queued in SQS)
    processExtractionJob(jobId, validation.normalizedUrl!, componentPath);

    const response: ExtractionResponse = {
      success: true,
      data: {
        jobId,
        status: 'queued',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating extraction job:', error);

    const errorResponse: ExtractionResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create extraction job',
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * Process extraction job asynchronously
 * In production, this would be handled by SQS + Lambda/Fargate
 */
async function processExtractionJob(
  jobId: string,
  githubUrl: string,
  componentPath?: string
) {
  try {
    console.log(`[${jobId}] Starting code analysis for ${githubUrl}`);
    
    const codeAgent = new CodeAgent();
    const result = await codeAgent.extractComponents({
      githubUrl,
      componentPath,
    });

    console.log(`[${jobId}] Analysis complete. Found ${result.components.length} components`);
    
    // TODO: Store result in database/cache for job status polling
    // For now, we'll simulate this by storing in memory (not production-ready)
    (global as any).extractionResults = (global as any).extractionResults || {};
    (global as any).extractionResults[jobId] = {
      status: 'completed',
      result,
      completedAt: Date.now(),
    };

  } catch (error) {
    console.error(`[${jobId}] Extraction failed:`, error);
    
    // Store error result
    (global as any).extractionResults = (global as any).extractionResults || {};
    (global as any).extractionResults[jobId] = {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      completedAt: Date.now(),
    };
  }
}