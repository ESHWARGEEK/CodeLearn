import { NextRequest, NextResponse } from 'next/server';
import { getProject } from '@/lib/db/projects';
import { getLearningPath } from '@/lib/db/learning-paths';

interface Task {
  id: string;
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
  hints: string[];
  completed: boolean;
}

/**
 * GET /api/learning/project/{projectId}/tasks
 * 
 * Fetches tasks for a learning project from DynamoDB.
 * Tasks are stored in the learning_paths table and linked via the project's learningPathKey.
 * 
 * Response format:
 * {
 *   success: true,
 *   data: {
 *     tasks: Task[]
 *   }
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;

    // Fetch the project to get the learning path key
    const project = await getProject(projectId);

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found',
          },
        },
        { status: 404 }
      );
    }

    // If this is not a learning project, return empty tasks
    if (project.type !== 'learning') {
      return NextResponse.json({
        success: true,
        data: {
          tasks: [],
        },
      });
    }

    // Parse the learning path key to get technology and difficulty
    // Format: "TECH#{technology}#DIFF#{difficulty}"
    if (!project.learningPathKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'LEARNING_PATH_NOT_FOUND',
            message: 'Learning path key not found for this project',
          },
        },
        { status: 404 }
      );
    }

    const learningPathKeyParts = project.learningPathKey.split('#');
    if (learningPathKeyParts.length !== 4) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_LEARNING_PATH_KEY',
            message: 'Invalid learning path key format',
          },
        },
        { status: 400 }
      );
    }

    const technology = learningPathKeyParts[1];
    const difficulty = learningPathKeyParts[3] as 'beginner' | 'intermediate' | 'advanced';

    // Fetch the learning path
    const learningPath = await getLearningPath(technology, difficulty);

    if (!learningPath) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'LEARNING_PATH_NOT_FOUND',
            message: 'Learning path not found or expired',
          },
        },
        { status: 404 }
      );
    }

    // Transform tasks to match the API response format
    const tasks: Task[] = learningPath.tasks.map((task) => ({
      id: task.taskId,
      title: task.title,
      description: task.description,
      order: task.order,
      estimatedMinutes: task.estimatedMinutes,
      hints: task.hints,
      completed: false, // TODO: Track task completion in a separate table
    }));

    return NextResponse.json({
      success: true,
      data: {
        tasks,
      },
    });
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_TASKS_FAILED',
          message: 'Failed to fetch project tasks',
        },
      },
      { status: 500 }
    );
  }
}
