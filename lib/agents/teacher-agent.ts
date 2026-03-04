/**
 * Teacher Agent - Generates learning content and task breakdowns from code
 * Model: Claude 3.5 Sonnet (complex reasoning required)
 * 
 * Process:
 * 1. Analyze repository structure and dependencies
 * 2. Identify key features and components
 * 3. Generate logical learning sequence (simple → complex)
 * 4. Create task descriptions with clear objectives
 * 5. Generate hints without revealing solutions
 */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { Octokit } from '@octokit/rest';
import {
  TeacherInput,
  TeacherOutput,
  Task,
  DifficultyLevel,
  GitHubRepository,
} from './types';

export class TeacherAgent {
  private bedrockClient: BedrockRuntimeClient;
  private octokit: Octokit;
  private readonly MODEL_ID = 'anthropic.claude-3-5-sonnet-20241022-v2:0';

  constructor() {
    // Initialize AWS Bedrock client
    this.bedrockClient = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });

    // Initialize GitHub API client
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
  }

  /**
   * Main method to generate learning tasks from a GitHub repository
   */
  async generateTasks(input: TeacherInput): Promise<TeacherOutput> {
    console.log(`[TeacherAgent] Starting task generation for ${input.githubUrl}`);

    // Step 1: Fetch repository structure
    const repoStructure = await this.fetchRepositoryStructure(input.githubUrl);
    console.log(`[TeacherAgent] Fetched repository structure`);

    // Step 2: Analyze key files and dependencies
    const analysis = await this.analyzeRepository(input.githubUrl, repoStructure);
    console.log(`[TeacherAgent] Analyzed repository`);

    // Step 3: Generate tasks using Claude 3.5
    const tasks = await this.generateTasksWithClaude(input, repoStructure, analysis);
    console.log(`[TeacherAgent] Generated ${tasks.length} tasks`);

    return {
      projectId: this.extractProjectId(input.githubUrl),
      projectName: this.extractProjectName(input.githubUrl),
      githubUrl: input.githubUrl,
      difficulty: input.difficulty,
      tasks,
      estimatedHours: this.calculateTotalHours(tasks),
      generatedAt: Date.now(),
    };
  }

  /**
   * Fetch repository structure from GitHub
   */
  private async fetchRepositoryStructure(githubUrl: string): Promise<string[]> {
    try {
      const { owner, repo } = this.parseGitHubUrl(githubUrl);

      // Get repository tree
      const { data: repoData } = await this.octokit.repos.get({
        owner,
        repo,
      });

      const { data: tree } = await this.octokit.git.getTree({
        owner,
        repo,
        tree_sha: repoData.default_branch,
        recursive: 'true',
      });

      // Extract file paths
      const files = tree.tree
        .filter((item) => item.type === 'blob')
        .map((item) => item.path || '')
        .filter((path) => path.length > 0);

      return files;
    } catch (error) {
      console.error('[TeacherAgent] Error fetching repository structure:', error);
      throw new Error('Failed to fetch repository structure');
    }
  }

  /**
   * Analyze repository to identify key features and components
   */
  private async analyzeRepository(
    githubUrl: string,
    structure: string[]
  ): Promise<RepositoryAnalysis> {
    const { owner, repo } = this.parseGitHubUrl(githubUrl);

    // Identify key files
    const packageJson = structure.find((f) => f === 'package.json');
    const readme = structure.find((f) => f.toLowerCase() === 'readme.md');
    const hasTests = structure.some((f) => f.includes('test') || f.includes('spec'));
    
    // Identify framework
    const framework = this.detectFramework(structure);
    
    // Identify key directories
    const hasComponents = structure.some((f) => f.includes('components/'));
    const hasPages = structure.some((f) => f.includes('pages/') || f.includes('app/'));
    const hasApi = structure.some((f) => f.includes('api/'));
    const hasStyles = structure.some((f) => f.includes('styles/') || f.includes('css/'));
    
    // Get package.json content if available
    let dependencies: string[] = [];
    if (packageJson) {
      try {
        const { data } = await this.octokit.repos.getContent({
          owner,
          repo,
          path: 'package.json',
        });

        if ('content' in data) {
          const content = Buffer.from(data.content, 'base64').toString('utf-8');
          const pkg = JSON.parse(content);
          dependencies = [
            ...Object.keys(pkg.dependencies || {}),
            ...Object.keys(pkg.devDependencies || {}),
          ];
        }
      } catch (error) {
        console.error('[TeacherAgent] Error fetching package.json:', error);
      }
    }

    return {
      framework,
      hasComponents,
      hasPages,
      hasApi,
      hasStyles,
      hasTests,
      dependencies,
      fileCount: structure.length,
    };
  }

  /**
   * Detect framework from file structure
   */
  private detectFramework(structure: string[]): string {
    if (structure.some((f) => f.includes('next.config'))) return 'Next.js';
    if (structure.some((f) => f.includes('nuxt.config'))) return 'Nuxt.js';
    if (structure.some((f) => f.includes('vue.config'))) return 'Vue.js';
    if (structure.some((f) => f.includes('angular.json'))) return 'Angular';
    if (structure.some((f) => f.includes('svelte.config'))) return 'Svelte';
    if (structure.some((f) => f.includes('package.json'))) {
      // Check for React in dependencies (will be checked in analysis)
      return 'React';
    }
    return 'JavaScript';
  }

  /**
   * Generate tasks using Claude 3.5 Sonnet
   */
  private async generateTasksWithClaude(
    input: TeacherInput,
    structure: string[],
    analysis: RepositoryAnalysis
  ): Promise<Task[]> {
    try {
      const prompt = this.buildTaskGenerationPrompt(input, structure, analysis);
      const response = await this.invokeClaude(prompt);
      const tasks = this.parseTasksResponse(response);

      // Validate and enrich tasks
      return this.validateAndEnrichTasks(tasks, input.difficulty);
    } catch (error) {
      console.error('[TeacherAgent] Error generating tasks:', error);
      throw new Error('Failed to generate tasks');
    }
  }

  /**
   * Build prompt for Claude to generate tasks
   */
  private buildTaskGenerationPrompt(
    input: TeacherInput,
    structure: string[],
    analysis: RepositoryAnalysis
  ): string {
    const difficultyGuidance = this.getDifficultyGuidance(input.difficulty);
    
    return `You are an expert programming educator creating a hands-on learning curriculum for developers.

Your task is to analyze this GitHub repository and create a step-by-step learning path that teaches someone how to build this project from scratch.

**Repository:** ${input.githubUrl}
**Framework:** ${analysis.framework}
**Difficulty Level:** ${input.difficulty}
**Target Learner:** ${difficultyGuidance}

**Repository Analysis:**
- Total Files: ${analysis.fileCount}
- Has Components: ${analysis.hasComponents}
- Has Pages/Routes: ${analysis.hasPages}
- Has API: ${analysis.hasApi}
- Has Styling: ${analysis.hasStyles}
- Has Tests: ${analysis.hasTests}
- Key Dependencies: ${analysis.dependencies.slice(0, 10).join(', ')}

**File Structure (sample):**
${structure.slice(0, 30).join('\n')}

**Your Goal:**
Create 10-15 sequential tasks that guide a learner to build this project from scratch. Each task should:
1. Be small and achievable (15-45 minutes)
2. Build on previous tasks (simple → complex)
3. Have a clear, specific objective
4. Include helpful hints without revealing the full solution
5. Be appropriate for ${input.difficulty} level learners

**Task Progression Guidelines:**
- Start with project setup and basic structure
- Move to core features and components
- Add styling and polish
- End with testing and deployment (if applicable)

**Important:**
- Tasks should be BUILDABLE (not just reading/understanding)
- Each task should produce working code
- Hints should guide without giving away the answer
- Estimated time should be realistic for ${input.difficulty} learners

Respond with ONLY a JSON array in this exact format:
[
  {
    "title": "Set up project structure",
    "description": "Initialize a new ${analysis.framework} project with TypeScript and configure the basic folder structure",
    "order": 1,
    "estimatedMinutes": 20,
    "hints": [
      "Use create-next-app or similar CLI tool",
      "Set up src/ directory with components/, pages/, and lib/ folders"
    ],
    "learningObjectives": [
      "Understand project initialization",
      "Learn folder structure best practices"
    ]
  }
]

Generate the complete task list now:`;
  }

  /**
   * Get difficulty-specific guidance
   */
  private getDifficultyGuidance(difficulty: DifficultyLevel): string {
    const guidance = {
      beginner: 'Someone new to this framework with basic JavaScript knowledge. Needs detailed explanations and simple steps.',
      intermediate: 'Someone with 6-12 months experience. Comfortable with the framework basics and ready for real-world patterns.',
      advanced: 'Experienced developer looking to learn advanced patterns, optimization, and production-ready practices.',
    };

    return guidance[difficulty];
  }

  /**
   * Invoke Claude 3.5 Sonnet via AWS Bedrock
   */
  private async invokeClaude(prompt: string): Promise<string> {
    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 4096,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    };

    const command = new InvokeModelCommand({
      modelId: this.MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    const response = await this.bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    return responseBody.content[0].text;
  }

  /**
   * Parse Claude's response to extract tasks
   */
  private parseTasksResponse(response: string): Task[] {
    try {
      // Extract JSON from response (Claude might add extra text)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const tasks = JSON.parse(jsonMatch[0]);
      
      return tasks.map((task: any, index: number) => ({
        taskId: `task-${index + 1}`,
        title: task.title,
        description: task.description,
        order: task.order || index + 1,
        estimatedMinutes: task.estimatedMinutes || 30,
        hints: task.hints || [],
        learningObjectives: task.learningObjectives || [],
        completed: false,
      }));
    } catch (error) {
      console.error('[TeacherAgent] Error parsing tasks response:', error);
      throw new Error('Failed to parse tasks from AI response');
    }
  }

  /**
   * Validate and enrich tasks
   */
  private validateAndEnrichTasks(tasks: Task[], difficulty: DifficultyLevel): Task[] {
    // Ensure we have 10-15 tasks
    if (tasks.length < 10) {
      console.warn(`[TeacherAgent] Only ${tasks.length} tasks generated, expected 10-15`);
    }

    // Ensure tasks are ordered
    tasks.sort((a, b) => a.order - b.order);

    // Validate each task
    return tasks.map((task, index) => {
      // Ensure taskId is set
      if (!task.taskId) {
        task.taskId = `task-${index + 1}`;
      }

      // Ensure order is sequential
      task.order = index + 1;

      // Ensure estimatedMinutes is reasonable
      if (task.estimatedMinutes < 10) task.estimatedMinutes = 15;
      if (task.estimatedMinutes > 60) task.estimatedMinutes = 45;

      // Ensure hints array exists
      if (!task.hints || task.hints.length === 0) {
        task.hints = ['Break this down into smaller steps', 'Refer to the documentation'];
      }

      // Ensure learningObjectives array exists
      if (!task.learningObjectives || task.learningObjectives.length === 0) {
        task.learningObjectives = ['Complete the task objective'];
      }

      // Set completed to false
      task.completed = false;

      return task;
    });
  }

  /**
   * Calculate total estimated hours
   */
  private calculateTotalHours(tasks: Task[]): number {
    const totalMinutes = tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0);
    return Math.round(totalMinutes / 60);
  }

  /**
   * Parse GitHub URL to extract owner and repo
   */
  private parseGitHubUrl(url: string): { owner: string; repo: string } {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub URL format');
    }

    return {
      owner: match[1],
      repo: match[2].replace('.git', ''),
    };
  }

  /**
   * Extract project ID from GitHub URL
   */
  private extractProjectId(url: string): string {
    const { owner, repo } = this.parseGitHubUrl(url);
    return `${owner}-${repo}`.toLowerCase();
  }

  /**
   * Extract project name from GitHub URL
   */
  private extractProjectName(url: string): string {
    const { repo } = this.parseGitHubUrl(url);
    // Convert kebab-case to Title Case
    return repo
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

/**
 * Internal type for repository analysis
 */
interface RepositoryAnalysis {
  framework: string;
  hasComponents: boolean;
  hasPages: boolean;
  hasApi: boolean;
  hasStyles: boolean;
  hasTests: boolean;
  dependencies: string[];
  fileCount: number;
}
