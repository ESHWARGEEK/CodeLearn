import { BaseAgent, ModelConfig } from './base-agent';
import { CurateLearningPathJob } from '../types/job';

interface LearningPath {
  name: string;
  description: string;
  estimatedHours: number;
  githubUrl: string;
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    order: number;
    estimatedMinutes: number;
    hints: string[];
    completed: boolean;
  }>;
}

export class CuratorAgent extends BaseAgent {
  private readonly modelConfig: ModelConfig = {
    modelId: 'meta.llama3-1-70b-instruct-v1:0',
    maxTokens: 4000,
    temperature: 0.7,
    topP: 0.9,
  };

  async processJob(job: CurateLearningPathJob): Promise<LearningPath> {
    this.logger.info('Processing learning path curation job', {
      jobId: job.jobId,
      technology: job.payload.technology,
      difficulty: job.payload.difficulty,
    });

    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(job.payload);

    const response = await this.retryWithBackoff(async () => {
      return await this.invokeModel(userPrompt, this.modelConfig, systemPrompt);
    });

    const learningPath = this.parseLearningPathResponse(response);
    
    // Validate the learning path
    this.validateLearningPath(learningPath);

    this.logger.info('Learning path curation completed', {
      jobId: job.jobId,
      pathName: learningPath.name,
      taskCount: learningPath.tasks.length,
      estimatedHours: learningPath.estimatedHours,
    });

    return learningPath;
  }

  private buildSystemPrompt(): string {
    return `You are an expert programming instructor and curriculum designer. Your role is to create comprehensive, practical learning paths for developers.

Key principles:
1. Focus on hands-on, project-based learning
2. Progress from basic concepts to advanced applications
3. Include real-world examples and best practices
4. Provide clear, actionable tasks with specific outcomes
5. Estimate realistic time commitments
6. Include helpful hints and resources

Always respond with valid JSON in the exact format specified. Do not include any markdown formatting or additional text outside the JSON structure.`;
  }

  private buildUserPrompt(payload: any): string {
    const { technology, difficulty, preferences } = payload;

    let prompt = `Create a comprehensive learning path for ${technology} at ${difficulty} level.`;

    if (preferences) {
      if (preferences.projectType) {
        prompt += ` Focus on ${preferences.projectType} projects.`;
      }
      if (preferences.timeCommitment) {
        prompt += ` Target ${preferences.timeCommitment} time commitment.`;
      }
      if (preferences.learningGoals && preferences.learningGoals.length > 0) {
        prompt += ` Learning goals: ${preferences.learningGoals.join(', ')}.`;
      }
    }

    prompt += `

Respond with a JSON object in this exact format:
{
  "name": "Learning Path Title",
  "description": "Detailed description of what the learner will build and learn",
  "estimatedHours": 15,
  "githubUrl": "https://github.com/example/project-template",
  "tasks": [
    {
      "id": "task-1",
      "title": "Task Title",
      "description": "What the learner will do in this task",
      "order": 1,
      "estimatedMinutes": 45,
      "hints": ["Helpful hint 1", "Helpful hint 2"],
      "completed": false
    }
  ]
}

Requirements:
- Include 8-12 tasks that build upon each other
- Each task should be 30-90 minutes
- Provide 2-3 helpful hints per task
- Use a realistic GitHub URL structure
- Total estimated hours should match the difficulty level (beginner: 10-20h, intermediate: 20-40h, advanced: 40-80h)`;

    return prompt;
  }

  private parseLearningPathResponse(response: string): LearningPath {
    try {
      // Clean up the response - remove any markdown formatting
      const cleanResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleanResponse);
      
      // Validate required fields
      if (!parsed.name || !parsed.description || !parsed.tasks || !Array.isArray(parsed.tasks)) {
        throw new Error('Invalid learning path structure');
      }

      return parsed as LearningPath;
    } catch (error) {
      this.logger.error('Failed to parse learning path response', {
        error: error instanceof Error ? error.message : String(error),
        responseLength: response.length,
        responsePreview: response.substring(0, 200),
      });
      
      throw new Error('Failed to parse AI response into valid learning path');
    }
  }

  private validateLearningPath(learningPath: LearningPath): void {
    // Validate basic structure
    if (!learningPath.name || learningPath.name.length < 5) {
      throw new Error('Learning path name is too short');
    }

    if (!learningPath.description || learningPath.description.length < 20) {
      throw new Error('Learning path description is too short');
    }

    if (!learningPath.estimatedHours || learningPath.estimatedHours < 1 || learningPath.estimatedHours > 200) {
      throw new Error('Invalid estimated hours');
    }

    if (!learningPath.tasks || learningPath.tasks.length < 3 || learningPath.tasks.length > 20) {
      throw new Error('Invalid number of tasks (must be 3-20)');
    }

    // Validate tasks
    for (const task of learningPath.tasks) {
      if (!task.id || !task.title || !task.description) {
        throw new Error('Task missing required fields');
      }

      if (!task.estimatedMinutes || task.estimatedMinutes < 10 || task.estimatedMinutes > 300) {
        throw new Error(`Invalid task duration: ${task.estimatedMinutes} minutes`);
      }

      if (!task.hints || task.hints.length < 1) {
        throw new Error('Task must have at least one hint');
      }
    }

    // Validate GitHub URL format
    if (!learningPath.githubUrl || !learningPath.githubUrl.startsWith('https://github.com/')) {
      throw new Error('Invalid GitHub URL format');
    }

    this.logger.debug('Learning path validation passed', {
      name: learningPath.name,
      taskCount: learningPath.tasks.length,
      estimatedHours: learningPath.estimatedHours,
    });
  }
}