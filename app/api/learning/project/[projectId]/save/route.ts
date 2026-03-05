import { NextRequest, NextResponse } from 'next/server';
import { updateProjectCode, updateProjectProgress, getProjectByUser } from '@/lib/db/projects';
import { z } from 'zod';

// Request validation schema
const SaveRequestSchema = z.object({
  taskId: z.string(),
  code: z.string(),
  completed: z.boolean(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;

    // TODO: Get userId from authenticated session
    // For now, using a placeholder
    const userId = 'user-123';

    // Parse and validate request body
    const body = await request.json();
    const validation = SaveRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Invalid request body',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { taskId, code, completed } = validation.data;

    // Verify project exists and belongs to user
    const project = await getProjectByUser(projectId, userId);
    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found or access denied',
          },
        },
        { status: 404 }
      );
    }

    // TODO: Save code to S3
    // For MVP, we'll simulate S3 save with a versioned key
    const timestamp = Date.now();
    const codeS3Key = `${userId}/${projectId}/code-${timestamp}.zip`;

    // Update project code reference
    await updateProjectCode(projectId, userId, codeS3Key);

    // If task is marked as completed, update project progress
    if (completed) {
      // TODO: Calculate actual progress based on completed tasks
      // For now, increment by a fixed amount
      const newProgress = Math.min(project.progress + 10, 100);
      await updateProjectProgress(projectId, userId, newProgress);
    }

    const now = new Date().toISOString();

    return NextResponse.json({
      success: true,
      data: {
        autoSaved: true,
        timestamp: now,
        codeS3Key,
        progress: completed ? Math.min(project.progress + 10, 100) : project.progress,
      },
    });
  } catch (error) {
    console.error('Failed to save project:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SAVE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to save project',
        },
      },
      { status: 500 }
    );
  }
}
