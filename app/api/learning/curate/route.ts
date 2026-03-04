import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { putItem, TABLES } from '@/lib/db/dynamodb';
import { sendAIJobMessage } from '@/lib/queue/sqs';
import { getLearningPathsByTechnology } from '@/lib/db/learning-paths';

// Validation schema
const CurateRequestSchema = z.object({
  technology: z.enum(['react', 'vue', 'nextjs', 'nodejs', 'python', 'go'], {
    errorMap: () => ({
      message: 'Technology must be one of: react, vue, nextjs, nodejs, python, go',
    }),
  }),
  userId: z.string().min(1, 'User ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = CurateRequestSchema.safeParse(body);

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: firstError?.message || 'Validation failed',
            details: validationResult.error.errors,
            timestamp: new Date().toISOString(),
            requestId: uuidv4(),
          },
        },
        { status: 400 }
      );
    }

    const { technology, userId } = validationResult.data;

    // Check cache first - if we have all 3 difficulty levels cached, return immediately
    const cachedPaths = await getLearningPathsByTechnology(technology);
    
    if (cachedPaths.length === 3) {
      // All difficulty levels are cached (beginner, intermediate, advanced)
      console.log(`[CurateAPI] Cache hit for ${technology} - returning cached results`);
      
      // Return cached results immediately without creating a job
      return NextResponse.json({
        success: true,
        data: {
          cached: true,
          projects: cachedPaths.map((path) => ({
            id: path.projectId,
            name: path.name,
            description: path.description,
            difficulty: path.SK.replace('DIFF#', ''),
            githubUrl: path.githubUrl,
            estimatedHours: path.estimatedHours,
            techStack: path.tasks.length > 0 ? ['react', 'typescript'] : [], // TODO: Extract from tasks
            tasks: path.tasks,
          })),
        },
      });
    }

    console.log(`[CurateAPI] Cache miss for ${technology} (${cachedPaths.length}/3 cached) - queuing AI job`);

    // Generate job ID
    const jobId = uuidv4();
    const now = Date.now();
    const expiresAt = Math.floor(now / 1000) + 24 * 60 * 60; // 24 hours from now

    // Create job record in DynamoDB
    const jobRecord = {
      PK: `JOB#${jobId}`,
      SK: `USER#${userId}`,
      type: 'curate',
      status: 'queued',
      progress: 0,
      input: {
        technology,
      },
      createdAt: now,
      updatedAt: now,
      expiresAt,
    };

    await putItem(TABLES.JOBS, jobRecord);

    // Send message to SQS queue
    const jobMessage = {
      jobId,
      type: 'curate',
      userId,
      input: {
        technology,
      },
      createdAt: now,
    };

    await sendAIJobMessage(jobMessage);

    // Return success response with jobId
    return NextResponse.json({
      success: true,
      data: {
        jobId,
        status: 'queued' as const,
      },
    });
  } catch (error) {
    console.error('Error creating curation job:', error);

    // Check if it's an SQS or DynamoDB error
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create curation job';

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: errorMessage,
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        },
      },
      { status: 500 }
    );
  }
}
