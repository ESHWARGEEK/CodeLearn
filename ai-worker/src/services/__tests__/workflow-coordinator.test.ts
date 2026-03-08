import { WorkflowCoordinator, Workflow } from '../workflow-coordinator';
import { Job, JobType, JobStatus } from '../../types/job';

// Mock LangChain dependencies
jest.mock('@langchain/anthropic');
jest.mock('@langchain/core/prompts');
jest.mock('@langchain/core/runnables');
jest.mock('@langchain/core/output_parsers');

describe('WorkflowCoordinator', () => {
  let coordinator: WorkflowCoordinator;

  beforeEach(() => {
    jest.clearAllMocks();
    coordinator = new WorkflowCoordinator();
  });

  describe('planWorkflow', () => {
    it('should plan single agent workflow for simple jobs', async () => {
      const job: Job = {
        jobId: 'test-job-123',
        userId: 'user-456',
        type: JobType.CURATE_LEARNING_PATH,
        status: JobStatus.PENDING,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        retryCount: 0,
        maxRetries: 3,
        payload: {
          technology: 'React',
          difficulty: 'beginner' as const,
        },
      };

      // Mock the LangChain workflow planner to return single agent plan
      const mockInvoke = jest.fn().mockResolvedValue(
        JSON.stringify({
          type: 'single',
          agent: 'curator',
        })
      );

      (coordinator as any).workflowPlanner = { invoke: mockInvoke };

      const result = await coordinator.planWorkflow(job);

      expect(result.type).toBe('single');
      expect(result.singleAgent).toEqual({
        agent: 'curator',
      });
    });

    it('should plan multi-step workflow for complex jobs', async () => {
      const job: Job = {
        jobId: 'test-job-123',
        userId: 'user-456',
        type: JobType.CURATE_LEARNING_PATH,
        status: JobStatus.PENDING,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        retryCount: 0,
        maxRetries: 3,
        payload: {
          technology: 'React',
          difficulty: 'advanced' as const,
          preferences: {
            projectType: 'full-stack',
            learningGoals: ['advanced patterns', 'performance optimization'],
          },
        },
      };

      const mockWorkflowPlan = {
        type: 'workflow',
        name: 'Advanced React Learning Path',
        description: 'Multi-step learning path with code examples',
        steps: [
          {
            id: 'step1',
            name: 'Create Learning Path',
            agentType: 'curator',
            dependencies: [],
            input: { technology: 'React', difficulty: 'advanced' },
          },
          {
            id: 'step2',
            name: 'Explain Advanced Concepts',
            agentType: 'teacher',
            dependencies: ['step1'],
            input: { concepts: 'advanced React patterns' },
          },
        ],
      };

      const mockInvoke = jest.fn().mockResolvedValue(JSON.stringify(mockWorkflowPlan));
      (coordinator as any).workflowPlanner = { invoke: mockInvoke };

      const result = await coordinator.planWorkflow(job);

      expect(result.type).toBe('workflow');
      expect(result.workflow).toBeDefined();
      expect(result.workflow!.name).toBe('Advanced React Learning Path');
      expect(result.workflow!.steps).toHaveLength(2);
      expect(result.workflow!.steps[0].status).toBe('pending');
    });

    it('should fallback to single agent on planning error', async () => {
      const job: Job = {
        jobId: 'test-job-123',
        userId: 'user-456',
        type: JobType.EXPLAIN_CODE,
        status: JobStatus.PENDING,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        retryCount: 0,
        maxRetries: 3,
        payload: {
          code: 'const x = 5;',
          language: 'javascript',
        },
      };

      const mockInvoke = jest.fn().mockRejectedValue(new Error('Planning failed'));
      (coordinator as any).workflowPlanner = { invoke: mockInvoke };

      const result = await coordinator.planWorkflow(job);

      expect(result.type).toBe('single');
      expect(result.singleAgent).toEqual({
        agent: 'teacher',
      });
    });
  });

  describe('executeWorkflow', () => {
    it('should execute simple workflow successfully', async () => {
      const workflow: Workflow = {
        id: 'workflow-123',
        name: 'Test Workflow',
        description: 'Simple test workflow',
        steps: [
          {
            id: 'step1',
            name: 'First Step',
            agentType: 'curator',
            dependencies: [],
            input: { technology: 'React' },
            status: 'pending',
            retryCount: 0,
            maxRetries: 3,
          },
        ],
        status: 'pending',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const mockExecutors = new Map();
      const mockCuratorExecutor = jest.fn().mockResolvedValue({
        name: 'React Learning Path',
        tasks: [],
      });
      mockExecutors.set('curator', mockCuratorExecutor);

      const result = await coordinator.executeWorkflow(workflow, mockExecutors);

      expect(result).toEqual({
        name: 'React Learning Path',
        tasks: [],
      });
      expect(workflow.status).toBe('completed');
      expect(workflow.steps[0].status).toBe('completed');
      expect(mockCuratorExecutor).toHaveBeenCalledWith({ technology: 'React' }, undefined);
    });

    it('should execute workflow with dependencies', async () => {
      const workflow: Workflow = {
        id: 'workflow-123',
        name: 'Test Workflow',
        description: 'Workflow with dependencies',
        steps: [
          {
            id: 'step1',
            name: 'First Step',
            agentType: 'curator',
            dependencies: [],
            input: { technology: 'React' },
            status: 'pending',
            retryCount: 0,
            maxRetries: 3,
          },
          {
            id: 'step2',
            name: 'Second Step',
            agentType: 'teacher',
            dependencies: ['step1'],
            input: { code: 'example code' },
            status: 'pending',
            retryCount: 0,
            maxRetries: 3,
          },
        ],
        status: 'pending',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const mockExecutors = new Map();
      const step1Result = { learningPath: 'React Basics' };
      const step2Result = { explanation: 'Code explained' };

      mockExecutors.set('curator', jest.fn().mockResolvedValue(step1Result));
      mockExecutors.set('teacher', jest.fn().mockResolvedValue(step2Result));

      const result = await coordinator.executeWorkflow(workflow, mockExecutors);

      expect(result).toEqual(step2Result);
      expect(workflow.status).toBe('completed');
      expect(workflow.steps[0].status).toBe('completed');
      expect(workflow.steps[1].status).toBe('completed');

      // Verify step2 received step1 output
      expect(mockExecutors.get('teacher')).toHaveBeenCalledWith(
        {
          code: 'example code',
          step1_output: step1Result,
        },
        undefined
      );
    });

    it('should handle step failures with retry', async () => {
      const workflow: Workflow = {
        id: 'workflow-123',
        name: 'Test Workflow',
        description: 'Workflow with failing step',
        steps: [
          {
            id: 'step1',
            name: 'Failing Step',
            agentType: 'curator',
            dependencies: [],
            input: { technology: 'React' },
            status: 'pending',
            retryCount: 0,
            maxRetries: 2,
          },
        ],
        status: 'pending',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const mockExecutors = new Map();
      const mockExecutor = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValueOnce({ success: true });

      mockExecutors.set('curator', mockExecutor);

      const result = await coordinator.executeWorkflow(workflow, mockExecutors);

      expect(result).toEqual({ success: true });
      expect(workflow.status).toBe('completed');
      expect(workflow.steps[0].status).toBe('completed');
      expect(workflow.steps[0].retryCount).toBe(1);
      expect(mockExecutor).toHaveBeenCalledTimes(2);
    });

    it('should fail workflow after max retries', async () => {
      const workflow: Workflow = {
        id: 'workflow-123',
        name: 'Test Workflow',
        description: 'Workflow with persistent failure',
        steps: [
          {
            id: 'step1',
            name: 'Failing Step',
            agentType: 'curator',
            dependencies: [],
            input: { technology: 'React' },
            status: 'pending',
            retryCount: 0,
            maxRetries: 1,
          },
        ],
        status: 'pending',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const mockExecutors = new Map();
      const mockExecutor = jest.fn().mockRejectedValue(new Error('Persistent failure'));
      mockExecutors.set('curator', mockExecutor);

      await expect(coordinator.executeWorkflow(workflow, mockExecutors))
        .rejects.toThrow('Workflow step Failing Step failed after 1 retries');

      expect(workflow.status).toBe('failed');
      expect(workflow.steps[0].status).toBe('failed');
      expect(workflow.steps[0].retryCount).toBe(1);
    });

    it('should handle workflow deadlock', async () => {
      const workflow: Workflow = {
        id: 'workflow-123',
        name: 'Deadlocked Workflow',
        description: 'Workflow with circular dependencies',
        steps: [
          {
            id: 'step1',
            name: 'Step 1',
            agentType: 'curator',
            dependencies: ['step2'], // Circular dependency
            input: {},
            status: 'pending',
            retryCount: 0,
            maxRetries: 3,
          },
          {
            id: 'step2',
            name: 'Step 2',
            agentType: 'teacher',
            dependencies: ['step1'], // Circular dependency
            input: {},
            status: 'pending',
            retryCount: 0,
            maxRetries: 3,
          },
        ],
        status: 'pending',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const mockExecutors = new Map();
      mockExecutors.set('curator', jest.fn());
      mockExecutors.set('teacher', jest.fn());

      await expect(coordinator.executeWorkflow(workflow, mockExecutors))
        .rejects.toThrow('Workflow deadlock: no steps can be executed');

      expect(workflow.status).toBe('failed');
    });

    it('should execute parallel steps', async () => {
      const workflow: Workflow = {
        id: 'workflow-123',
        name: 'Parallel Workflow',
        description: 'Workflow with parallel steps',
        steps: [
          {
            id: 'step1',
            name: 'Parallel Step 1',
            agentType: 'curator',
            dependencies: [],
            input: { technology: 'React' },
            status: 'pending',
            retryCount: 0,
            maxRetries: 3,
          },
          {
            id: 'step2',
            name: 'Parallel Step 2',
            agentType: 'teacher',
            dependencies: [],
            input: { code: 'example' },
            status: 'pending',
            retryCount: 0,
            maxRetries: 3,
          },
        ],
        status: 'pending',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const mockExecutors = new Map();
      const mockCuratorExecutor = jest.fn().mockResolvedValue({ curator: 'result' });
      const mockTeacherExecutor = jest.fn().mockResolvedValue({ teacher: 'result' });

      mockExecutors.set('curator', mockCuratorExecutor);
      mockExecutors.set('teacher', mockTeacherExecutor);

      const result = await coordinator.executeWorkflow(workflow, mockExecutors);

      expect(result).toEqual({ teacher: 'result' }); // Last successful result
      expect(workflow.status).toBe('completed');
      expect(workflow.steps[0].status).toBe('completed');
      expect(workflow.steps[1].status).toBe('completed');

      // Both executors should be called in parallel
      expect(mockCuratorExecutor).toHaveBeenCalledWith({ technology: 'React' }, undefined);
      expect(mockTeacherExecutor).toHaveBeenCalledWith({ code: 'example' }, undefined);
    });
  });

  describe('fallbackToSingleAgent', () => {
    it('should map job types to correct agents', () => {
      const testCases = [
        { type: JobType.CURATE_LEARNING_PATH, expectedAgent: 'curator' },
        { type: JobType.EXPLAIN_CODE, expectedAgent: 'teacher' },
        { type: JobType.EXTRACT_TEMPLATE, expectedAgent: 'code', expectedOperation: 'extract' },
        { type: JobType.INTEGRATE_CODE, expectedAgent: 'code', expectedOperation: 'integrate' },
        { type: JobType.MENTOR_CHAT, expectedAgent: 'mentor' },
      ];

      testCases.forEach(({ type, expectedAgent, expectedOperation }) => {
        const job = { type } as Job;
        const result = (coordinator as any).fallbackToSingleAgent(job);

        expect(result.type).toBe('single');
        expect(result.singleAgent.agent).toBe(expectedAgent);
        if (expectedOperation) {
          expect(result.singleAgent.operation).toBe(expectedOperation);
        }
      });
    });
  });
});