/**
 * Unit tests for Teacher Agent
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeacherAgent } from '@/lib/agents/teacher-agent';
import { TeacherInput, TeacherOutput } from '@/lib/agents/types';

// Mock AWS Bedrock
vi.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: vi.fn(() => ({
    send: vi.fn(),
  })),
  InvokeModelCommand: vi.fn(),
}));

// Mock Octokit
vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn(() => ({
    repos: {
      get: vi.fn(),
      getContent: vi.fn(),
    },
    git: {
      getTree: vi.fn(),
    },
  })),
}));

describe('TeacherAgent', () => {
  let agent: TeacherAgent;

  beforeEach(() => {
    agent = new TeacherAgent();
  });

  describe('generateTasks', () => {
    it('should generate tasks for a GitHub repository', async () => {
      // Mock GitHub API responses
      const mockRepoData = {
        data: {
          default_branch: 'main',
        },
      };

      const mockTreeData = {
        data: {
          tree: [
            { type: 'blob', path: 'package.json' },
            { type: 'blob', path: 'README.md' },
            { type: 'blob', path: 'src/index.ts' },
            { type: 'blob', path: 'src/components/Button.tsx' },
          ],
        },
      };

      const mockPackageJson = {
        data: {
          content: Buffer.from(
            JSON.stringify({
              dependencies: {
                react: '^18.0.0',
                'next': '^14.0.0',
              },
            })
          ).toString('base64'),
        },
      };

      // Mock Claude response
      const mockClaudeResponse = JSON.stringify([
        {
          title: 'Set up project structure',
          description: 'Initialize Next.js project',
          order: 1,
          estimatedMinutes: 20,
          hints: ['Use create-next-app'],
          learningObjectives: ['Understand project setup'],
        },
        {
          title: 'Create first component',
          description: 'Build a Button component',
          order: 2,
          estimatedMinutes: 30,
          hints: ['Use TypeScript', 'Add props interface'],
          learningObjectives: ['Learn component creation'],
        },
      ]);

      // Setup mocks
      vi.spyOn(agent['octokit'].repos, 'get').mockResolvedValue(mockRepoData as any);
      vi.spyOn(agent['octokit'].git, 'getTree').mockResolvedValue(mockTreeData as any);
      vi.spyOn(agent['octokit'].repos, 'getContent').mockResolvedValue(mockPackageJson as any);
      vi.spyOn(agent as any, 'invokeClaude').mockResolvedValue(mockClaudeResponse);

      const input: TeacherInput = {
        githubUrl: 'https://github.com/test/repo',
        difficulty: 'intermediate',
      };

      const result = await agent.generateTasks(input);

      expect(result).toBeDefined();
      expect(result.tasks).toHaveLength(2);
      expect(result.tasks[0].title).toBe('Set up project structure');
      expect(result.tasks[0].taskId).toBe('task-1');
      expect(result.tasks[0].completed).toBe(false);
      expect(result.estimatedHours).toBeGreaterThan(0);
    });

    it('should handle invalid GitHub URL', async () => {
      const input: TeacherInput = {
        githubUrl: 'invalid-url',
        difficulty: 'beginner',
      };

      await expect(agent.generateTasks(input)).rejects.toThrow();
    });

    it('should generate tasks for different difficulty levels', async () => {
      const difficulties: Array<'beginner' | 'intermediate' | 'advanced'> = [
        'beginner',
        'intermediate',
        'advanced',
      ];

      for (const difficulty of difficulties) {
        // Mock responses
        vi.spyOn(agent['octokit'].repos, 'get').mockResolvedValue({
          data: { default_branch: 'main' },
        } as any);

        vi.spyOn(agent['octokit'].git, 'getTree').mockResolvedValue({
          data: {
            tree: [{ type: 'blob', path: 'index.js' }],
          },
        } as any);

        vi.spyOn(agent as any, 'invokeClaude').mockResolvedValue(
          JSON.stringify([
            {
              title: `Task for ${difficulty}`,
              description: 'Test task',
              order: 1,
              estimatedMinutes: 30,
              hints: ['Hint 1'],
              learningObjectives: ['Objective 1'],
            },
          ])
        );

        const input: TeacherInput = {
          githubUrl: 'https://github.com/test/repo',
          difficulty,
        };

        const result = await agent.generateTasks(input);
        expect(result.difficulty).toBe(difficulty);
      }
    });
  });

  describe('parseGitHubUrl', () => {
    it('should parse valid GitHub URLs', () => {
      const testCases = [
        {
          url: 'https://github.com/owner/repo',
          expected: { owner: 'owner', repo: 'repo' },
        },
        {
          url: 'https://github.com/owner/repo.git',
          expected: { owner: 'owner', repo: 'repo' },
        },
        {
          url: 'https://github.com/owner-name/repo-name',
          expected: { owner: 'owner-name', repo: 'repo-name' },
        },
      ];

      testCases.forEach(({ url, expected }) => {
        const result = agent['parseGitHubUrl'](url);
        expect(result).toEqual(expected);
      });
    });

    it('should throw error for invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'https://gitlab.com/owner/repo',
        'https://github.com/owner',
      ];

      invalidUrls.forEach((url) => {
        expect(() => agent['parseGitHubUrl'](url)).toThrow('Invalid GitHub URL format');
      });
    });
  });

  describe('detectFramework', () => {
    it('should detect Next.js', () => {
      const structure = ['next.config.js', 'pages/index.tsx'];
      const framework = agent['detectFramework'](structure);
      expect(framework).toBe('Next.js');
    });

    it('should detect Vue.js', () => {
      const structure = ['vue.config.js', 'src/App.vue'];
      const framework = agent['detectFramework'](structure);
      expect(framework).toBe('Vue.js');
    });

    it('should detect React', () => {
      const structure = ['package.json', 'src/App.jsx'];
      const framework = agent['detectFramework'](structure);
      expect(framework).toBe('React');
    });

    it('should default to JavaScript', () => {
      const structure = ['index.js', 'utils.js'];
      const framework = agent['detectFramework'](structure);
      expect(framework).toBe('JavaScript');
    });
  });

  describe('validateAndEnrichTasks', () => {
    it('should ensure tasks have required fields', () => {
      const incompleteTasks = [
        {
          title: 'Task 1',
          description: 'Description 1',
          order: 1,
          estimatedMinutes: 5, // Too short
          hints: [],
          learningObjectives: [],
          completed: false,
          taskId: '',
        },
        {
          title: 'Task 2',
          description: 'Description 2',
          order: 2,
          estimatedMinutes: 90, // Too long
          hints: ['Hint 1'],
          learningObjectives: ['Objective 1'],
          completed: false,
          taskId: 'task-2',
        },
      ];

      const result = agent['validateAndEnrichTasks'](incompleteTasks, 'intermediate');

      expect(result).toHaveLength(2);
      expect(result[0].taskId).toBe('task-1');
      expect(result[0].estimatedMinutes).toBeGreaterThanOrEqual(15);
      expect(result[0].hints.length).toBeGreaterThan(0);
      expect(result[1].estimatedMinutes).toBeLessThanOrEqual(45);
    });

    it('should ensure sequential ordering', () => {
      const unorderedTasks = [
        {
          taskId: 'task-3',
          title: 'Task 3',
          description: 'Description',
          order: 3,
          estimatedMinutes: 30,
          hints: ['Hint'],
          learningObjectives: ['Objective'],
          completed: false,
        },
        {
          taskId: 'task-1',
          title: 'Task 1',
          description: 'Description',
          order: 1,
          estimatedMinutes: 30,
          hints: ['Hint'],
          learningObjectives: ['Objective'],
          completed: false,
        },
      ];

      const result = agent['validateAndEnrichTasks'](unorderedTasks, 'beginner');

      expect(result[0].order).toBe(1);
      expect(result[1].order).toBe(2);
    });
  });

  describe('calculateTotalHours', () => {
    it('should calculate total hours from tasks', () => {
      const tasks = [
        {
          taskId: 'task-1',
          title: 'Task 1',
          description: 'Description',
          order: 1,
          estimatedMinutes: 30,
          hints: [],
          learningObjectives: [],
          completed: false,
        },
        {
          taskId: 'task-2',
          title: 'Task 2',
          description: 'Description',
          order: 2,
          estimatedMinutes: 45,
          hints: [],
          learningObjectives: [],
          completed: false,
        },
        {
          taskId: 'task-3',
          title: 'Task 3',
          description: 'Description',
          order: 3,
          estimatedMinutes: 60,
          hints: [],
          learningObjectives: [],
          completed: false,
        },
      ];

      const totalHours = agent['calculateTotalHours'](tasks);
      expect(totalHours).toBe(2); // 135 minutes = 2.25 hours, rounded to 2
    });
  });

  describe('extractProjectName', () => {
    it('should convert kebab-case to Title Case', () => {
      const testCases = [
        { url: 'https://github.com/owner/my-awesome-project', expected: 'My Awesome Project' },
        { url: 'https://github.com/owner/simple', expected: 'Simple' },
        { url: 'https://github.com/owner/react-todo-app', expected: 'React Todo App' },
      ];

      testCases.forEach(({ url, expected }) => {
        const result = agent['extractProjectName'](url);
        expect(result).toBe(expected);
      });
    });
  });
});
