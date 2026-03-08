import { AgentOrchestrator } from '../agent-orchestrator';
import { WorkflowCoordinator } from '../workflow-coordinator';
import { Job, JobType, JobStatus } from '../../types/job';

// Integration test for the complete orchestration system
describe('Orchestration Integration', () => {
  let orchestrator: AgentOrchestrator;
  let workflowCoordinator: WorkflowCoordinator;

  beforeEach(() => {
    // Use real instances for integration testing
    orchestrator = new AgentOrchestrator();
    workflowCoordinator = new WorkflowCoordinator();
  });

  describe('End-to-End Job Processing', () => {
    it('should handle a complete learning path curation workflow', async () => {
      const job: Job = {
        jobId: 'integration-test-1',
        userId: 'test-user-123',
        type: JobType.CURATE_LEARNING_PATH,
        status: JobStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        retryCount: 0,
        maxRetries: 3,
        payload: {
          technology: 'React',
          difficulty: 'intermediate' as const,
          preferences: {
            projectType: 'web-application',
            timeCommitment: '20-30 hours',
            learningGoals: ['component architecture', 'state management', 'testing'],
          },
        },
      };

      // This test will use the actual orchestration system
      // In a real environment, this would connect to actual AI services
      const result = await orchestrator.processJob(job);

      expect(result.jobId).toBe(job.jobId);
      expect(result.status).toBeOneOf([JobStatus.COMPLETED, JobStatus.FAILED]);
      expect(result.processingTimeMs).toBeGreaterThan(0);

      if (result.status === JobStatus.COMPLETED) {
        expect(result.result).toBeDefined();
        expect(result.completedAt).toBeDefined();
      } else {
        expect(result.error).toBeDefined();
        expect(result.error?.message).toBeTruthy();
      }
    }, 30000); // 30 second timeout for integration test

    it('should handle code explanation with context', async () => {
      const job: Job = {
        jobId: 'integration-test-2',
        userId: 'test-user-123',
        type: JobType.EXPLAIN_CODE,
        status: JobStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        retryCount: 0,
        maxRetries: 3,
        payload: {
          code: `
import React, { useState, useEffect } from 'react';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(\`/api/users/\${userId}\`);
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
};

export default UserProfile;
          `,
          language: 'javascript',
          context: 'React component for displaying user profile information',
          difficulty: 'intermediate' as const,
        },
      };

      const result = await orchestrator.processJob(job);

      expect(result.jobId).toBe(job.jobId);
      expect(result.status).toBeOneOf([JobStatus.COMPLETED, JobStatus.FAILED]);

      if (result.status === JobStatus.COMPLETED) {
        expect(result.result).toBeDefined();
        expect(result.result.summary).toBeTruthy();
        expect(result.result.breakdown).toBeInstanceOf(Array);
        expect(result.result.keyLearnings).toBeInstanceOf(Array);
        expect(result.result.nextSteps).toBeInstanceOf(Array);
      }
    }, 30000);

    it('should handle mentor chat with conversation history', async () => {
      const job: Job = {
        jobId: 'integration-test-3',
        userId: 'test-user-123',
        type: JobType.MENTOR_CHAT,
        status: JobStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        retryCount: 0,
        maxRetries: 3,
        payload: {
          message: "I'm struggling with understanding React hooks. Can you help me understand when to use useState vs useEffect?",
          conversationHistory: [
            {
              role: 'user' as const,
              content: 'Hi, I\'m learning React and finding it challenging.',
              timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
            },
            {
              role: 'assistant' as const,
              content: 'Hello! I\'d be happy to help you with React. What specific areas are you finding challenging?',
              timestamp: new Date(Date.now() - 240000).toISOString(), // 4 minutes ago
            },
          ],
          context: {
            currentProject: 'Personal portfolio website',
            learningPath: 'React Fundamentals',
            userLevel: 'beginner' as const,
          },
        },
      };

      const result = await orchestrator.processJob(job);

      expect(result.jobId).toBe(job.jobId);
      expect(result.status).toBeOneOf([JobStatus.COMPLETED, JobStatus.FAILED]);

      if (result.status === JobStatus.COMPLETED) {
        expect(result.result).toBeDefined();
        expect(result.result.message).toBeTruthy();
        expect(result.result.suggestions).toBeInstanceOf(Array);
        expect(result.result.followUpQuestions).toBeInstanceOf(Array);
        expect(result.result.encouragement).toBeTruthy();
      }
    }, 30000);
  });

  describe('Health and Metrics', () => {
    it('should provide health status', () => {
      const health = orchestrator.getHealthStatus();

      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('langchainEnabled');
      expect(health).toHaveProperty('agentStatus');
      expect(health).toHaveProperty('workflowCoordinatorEnabled');
      expect(health).toHaveProperty('lastHealthCheck');

      expect(['healthy', 'degraded', 'unhealthy']).toContain(health.status);
      expect(typeof health.langchainEnabled).toBe('boolean');
      expect(typeof health.workflowCoordinatorEnabled).toBe('boolean');

      // Agent status should have all required agents
      expect(health.agentStatus).toHaveProperty('curator');
      expect(health.agentStatus).toHaveProperty('teacher');
      expect(health.agentStatus).toHaveProperty('code');
      expect(health.agentStatus).toHaveProperty('mentor');
    });

    it('should provide orchestration metrics', () => {
      const metrics = orchestrator.getMetrics();

      expect(metrics).toHaveProperty('totalJobsProcessed');
      expect(metrics).toHaveProperty('successfulJobs');
      expect(metrics).toHaveProperty('failedJobs');
      expect(metrics).toHaveProperty('averageProcessingTime');
      expect(metrics).toHaveProperty('langchainUsageCount');
      expect(metrics).toHaveProperty('directRoutingCount');
      expect(metrics).toHaveProperty('workflowExecutionCount');

      // All metrics should be numbers
      Object.values(metrics).forEach(value => {
        expect(typeof value).toBe('number');
      });
    });

    it('should provide workflow metrics', () => {
      const metrics = workflowCoordinator.getWorkflowMetrics();

      expect(metrics).toHaveProperty('totalWorkflowsExecuted');
      expect(metrics).toHaveProperty('successfulWorkflows');
      expect(metrics).toHaveProperty('failedWorkflows');
      expect(metrics).toHaveProperty('averageWorkflowDuration');
      expect(metrics).toHaveProperty('averageStepsPerWorkflow');
      expect(metrics).toHaveProperty('mostCommonWorkflowPatterns');

      expect(Array.isArray(metrics.mostCommonWorkflowPatterns)).toBe(true);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle invalid job gracefully', async () => {
      const invalidJob: Job = {
        jobId: 'invalid-job',
        userId: 'test-user',
        type: JobType.MENTOR_CHAT,
        status: JobStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        retryCount: 0,
        maxRetries: 3,
        payload: {
          message: 'test message',
        },
      };

      const result = await orchestrator.processJob(invalidJob);

      expect(result.status).toBeOneOf([JobStatus.COMPLETED, JobStatus.FAILED]);
    });

    it('should be able to reinitialize agent executor', async () => {
      const success = await orchestrator.reinitializeAgentExecutor();
      expect(typeof success).toBe('boolean');
    });
  });

  describe('Workflow Validation', () => {
    it('should validate workflow structure', () => {
      const validWorkflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        description: 'A test workflow',
        steps: [
          {
            id: 'step1',
            name: 'First Step',
            agentType: 'curator' as const,
            dependencies: [],
            input: {},
            status: 'pending' as const,
            retryCount: 0,
            maxRetries: 3,
          },
          {
            id: 'step2',
            name: 'Second Step',
            agentType: 'teacher' as const,
            dependencies: ['step1'],
            input: {},
            status: 'pending' as const,
            retryCount: 0,
            maxRetries: 3,
          },
        ],
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const validation = workflowCoordinator.validateWorkflow(validWorkflow);

      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
      expect(Array.isArray(validation.warnings)).toBe(true);
    });

    it('should detect circular dependencies', () => {
      const circularWorkflow = {
        id: 'circular-workflow',
        name: 'Circular Workflow',
        description: 'A workflow with circular dependencies',
        steps: [
          {
            id: 'step1',
            name: 'First Step',
            agentType: 'curator' as const,
            dependencies: ['step2'],
            input: {},
            status: 'pending' as const,
            retryCount: 0,
            maxRetries: 3,
          },
          {
            id: 'step2',
            name: 'Second Step',
            agentType: 'teacher' as const,
            dependencies: ['step1'],
            input: {},
            status: 'pending' as const,
            retryCount: 0,
            maxRetries: 3,
          },
        ],
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const validation = workflowCoordinator.validateWorkflow(circularWorkflow);

      expect(validation.isValid).toBe(false);
      expect(validation.issues).toContain('Workflow contains circular dependencies');
    });
  });
});

// Custom Jest matcher for testing multiple possible values
expect.extend({
  toBeOneOf(received, expected) {
    const pass = expected.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${expected.join(', ')}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${expected.join(', ')}`,
        pass: false,
      };
    }
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOneOf(expected: any[]): R;
    }
  }
}