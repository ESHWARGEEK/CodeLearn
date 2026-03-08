import { Job, JobResult, JobStatus, JobType } from '../types/job';
import { CuratorAgent } from '../agents/curator-agent';
import { TeacherAgent } from '../agents/teacher-agent';
import { CodeAgent } from '../agents/code-agent';
import { MentorAgent } from '../agents/mentor-agent';
import { JobStatusUpdater } from './job-status-updater';
import { WorkflowCoordinator } from './workflow-coordinator';
import { Logger } from '../utils/logger';
import { AgentExecutor, createReactAgent } from 'langchain/agents';
import { ChatAnthropic } from '@langchain/anthropic';
import { DynamicTool } from '@langchain/core/tools';
import { PromptTemplate } from '@langchain/core/prompts';
import { loadOrchestrationConfig, OrchestrationConfig, getConfigSummary } from '../config/orchestration';


export class AgentOrchestrator {
  private curatorAgent: CuratorAgent;
  private teacherAgent: TeacherAgent;
  private codeAgent: CodeAgent;
  private mentorAgent: MentorAgent;
  private jobStatusUpdater: JobStatusUpdater;
  private workflowCoordinator: WorkflowCoordinator;
  private logger = Logger.getInstance();
  private llm: ChatAnthropic;
  private agentExecutor: AgentExecutor | null = null;
  private agentExecutors: Map<string, (input: any, operation?: string) => Promise<any>>;
  private config: OrchestrationConfig;

  constructor(config?: Partial<OrchestrationConfig>) {
    this.config = { ...loadOrchestrationConfig(), ...config };
    
    this.logger.info('Initializing Agent Orchestrator', getConfigSummary(this.config));

    this.curatorAgent = new CuratorAgent();
    this.teacherAgent = new TeacherAgent();
    this.codeAgent = new CodeAgent();
    this.mentorAgent = new MentorAgent();
    this.jobStatusUpdater = new JobStatusUpdater();
    this.workflowCoordinator = new WorkflowCoordinator();
    
    // Initialize LangChain LLM for orchestration
    this.llm = new ChatAnthropic({
      modelName: this.config.langchain.modelName,
      temperature: this.config.langchain.temperature,
      maxTokens: this.config.langchain.maxTokens,
      anthropicApiKey: this.config.langchain.anthropicApiKey,
    });

    // Create agent executor map for workflow coordination
    this.agentExecutors = new Map();
    this.agentExecutors.set('curator', async (input: any) => {
      return await this.curatorAgent.processJob(input);
    });
    this.agentExecutors.set('teacher', async (input: any) => {
      return await this.teacherAgent.processJob(input);
    });
    this.agentExecutors.set('code', async (input: any, operation?: string) => {
      if (operation === 'extract') {
        return await this.codeAgent.processExtractTemplateJob(input);
      } else if (operation === 'integrate') {
        return await this.codeAgent.processIntegrateCodeJob(input);
      } else {
        throw new Error(`Unknown code agent operation: ${operation}`);
      }
    });
    this.agentExecutors.set('mentor', async (input: any) => {
      return await this.mentorAgent.processJob(input);
    });

    if (this.config.langchain.enabled) {
      this.initializeAgentExecutor();
    } else {
      this.logger.info('LangChain orchestration disabled, using direct routing only');
    }
  }

  private async initializeAgentExecutor(): Promise<void> {
    try {
      // Only initialize if API key is available
      if (!this.config.langchain.anthropicApiKey) {
        this.logger.warn('ANTHROPIC_API_KEY not found, using direct routing only');
        return;
      }

      const tools = this.createOrchestrationTools();
      const prompt = this.createOrchestrationPrompt();
      
      const agent = await createReactAgent({
        llm: this.llm,
        tools,
        prompt,
      });

      this.agentExecutor = new AgentExecutor({
        agent,
        tools,
        verbose: this.config.langchain.verbose,
        maxIterations: this.config.langchain.maxIterations,
        returnIntermediateSteps: true,
        handleParsingErrors: this.config.langchain.handleParsingErrors,
      });

      this.logger.info('LangChain agent executor initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize agent executor', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Continue without agent executor - fall back to direct routing
      this.agentExecutor = null;
    }
  }

  private createOrchestrationTools(): DynamicTool[] {
    return [
      new DynamicTool({
        name: 'route_to_curator',
        description: 'Route job to Curator Agent for learning path curation tasks. Use for creating educational content and learning paths.',
        func: async (input: string) => {
          try {
            const jobData = JSON.parse(input);
            const result = await this.curatorAgent.processJob(jobData);
            return JSON.stringify({ success: true, result });
          } catch (error) {
            return JSON.stringify({ 
              success: false, 
              error: error instanceof Error ? error.message : String(error) 
            });
          }
        },
      }),
      new DynamicTool({
        name: 'route_to_teacher',
        description: 'Route job to Teacher Agent for code explanation and educational breakdown tasks. Use for explaining code concepts.',
        func: async (input: string) => {
          try {
            const jobData = JSON.parse(input);
            const result = await this.teacherAgent.processJob(jobData);
            return JSON.stringify({ success: true, result });
          } catch (error) {
            return JSON.stringify({ 
              success: false, 
              error: error instanceof Error ? error.message : String(error) 
            });
          }
        },
      }),
      new DynamicTool({
        name: 'route_to_code_agent',
        description: 'Route job to Code Agent for template extraction or code integration tasks. Specify operation as "extract" or "integrate".',
        func: async (input: string) => {
          try {
            const { job, operation } = JSON.parse(input);
            let result;
            if (operation === 'extract') {
              result = await this.codeAgent.processExtractTemplateJob(job);
            } else if (operation === 'integrate') {
              result = await this.codeAgent.processIntegrateCodeJob(job);
            } else {
              throw new Error(`Unknown code agent operation: ${operation}`);
            }
            return JSON.stringify({ success: true, result });
          } catch (error) {
            return JSON.stringify({ 
              success: false, 
              error: error instanceof Error ? error.message : String(error) 
            });
          }
        },
      }),
      new DynamicTool({
        name: 'route_to_mentor',
        description: 'Route job to Mentor Agent for chat, guidance, and mentoring tasks. Use for providing learning support and encouragement.',
        func: async (input: string) => {
          try {
            const jobData = JSON.parse(input);
            const result = await this.mentorAgent.processJob(jobData);
            return JSON.stringify({ success: true, result });
          } catch (error) {
            return JSON.stringify({ 
              success: false, 
              error: error instanceof Error ? error.message : String(error) 
            });
          }
        },
      }),
      new DynamicTool({
        name: 'validate_job_requirements',
        description: 'Validate job requirements and determine if preprocessing is needed before routing to agents.',
        func: async (input: string) => {
          try {
            const job = JSON.parse(input);
            const validation = await this.validateJobRequirements(job);
            return JSON.stringify(validation);
          } catch (error) {
            return JSON.stringify({ 
              isValid: false, 
              issues: ['Failed to validate job requirements'],
              recommendations: [],
              error: error instanceof Error ? error.message : String(error)
            });
          }
        },
      }),
      new DynamicTool({
        name: 'handle_job_error',
        description: 'Handle job processing errors and determine retry strategy based on error type and job context.',
        func: async (input: string) => {
          try {
            const { job, error } = JSON.parse(input);
            const strategy = this.determineErrorHandlingStrategy(job, error);
            return JSON.stringify(strategy);
          } catch (parseError) {
            return JSON.stringify({
              shouldRetry: false,
              retryDelay: 0,
              maxRetries: 0,
              strategy: 'parsing_error',
              error: parseError instanceof Error ? parseError.message : String(parseError)
            });
          }
        },
      }),
    ];
  }

  private createOrchestrationPrompt(): PromptTemplate {
    return PromptTemplate.fromTemplate(`
You are an AI job orchestrator responsible for routing and coordinating different AI agents in a CodeLearn platform. Your role is to:

1. Analyze incoming jobs and determine the best agent to handle them
2. Validate job requirements before processing
3. Handle errors and determine retry strategies
4. Coordinate multi-step workflows when needed

Available agents and their capabilities:
- Curator Agent: Creates learning paths and curates educational content
- Teacher Agent: Explains code and provides educational breakdowns
- Code Agent: Extracts templates from repositories and integrates code
- Mentor Agent: Provides guidance, encouragement, and answers questions

Available tools:
{tools}

Job to process: {input}

Think step by step:
1. What type of job is this?
2. Which agent is best suited to handle it?
3. Are there any prerequisites or validations needed?
4. How should errors be handled for this job type?

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought: {agent_scratchpad}
    `);
  }

  async processJob(job: Job): Promise<JobResult> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Starting job processing with LangChain orchestration', {
        jobId: job.jobId,
        type: job.type,
        userId: job.userId,
      });

      // Update job status to in_progress
      await this.jobStatusUpdater.updateJobStatus(job.jobId, JobStatus.IN_PROGRESS);

      let result: any;

      // Use LangChain orchestration if available, otherwise fall back to direct routing
      if (this.agentExecutor) {
        result = await this.processJobWithLangChain(job);
      } else {
        this.logger.warn('LangChain orchestration not available, using direct routing', {
          jobId: job.jobId,
        });
        result = await this.processJobDirectly(job);
      }

      const processingTimeMs = Date.now() - startTime;

      // Update job status to completed
      await this.jobStatusUpdater.updateJobStatus(job.jobId, JobStatus.COMPLETED, result);

      const jobResult: JobResult = {
        jobId: job.jobId,
        status: JobStatus.COMPLETED,
        result,
        completedAt: new Date().toISOString(),
        processingTimeMs,
      };

      this.logger.info('Job completed successfully', {
        jobId: job.jobId,
        type: job.type,
        processingTimeMs,
      });

      return jobResult;

    } catch (error) {
      const processingTimeMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error('Job processing failed', {
        jobId: job.jobId,
        type: job.type,
        error: errorMessage,
        processingTimeMs,
      });

      // Use LangChain for error handling if available
      const shouldRetry = this.agentExecutor 
        ? await this.shouldRetryJobWithLangChain(job, error)
        : this.shouldRetryJob(job, error);
      
      const newStatus = shouldRetry ? JobStatus.RETRY : JobStatus.FAILED;

      // Update job status
      await this.jobStatusUpdater.updateJobStatus(job.jobId, newStatus, null, {
        message: errorMessage,
        code: 'PROCESSING_ERROR',
        details: error instanceof Error ? error.stack : undefined,
      });

      const jobResult: JobResult = {
        jobId: job.jobId,
        status: newStatus,
        error: {
          message: errorMessage,
          code: 'PROCESSING_ERROR',
          details: error instanceof Error ? error.stack : undefined,
        },
        processingTimeMs,
      };

      return jobResult;
    }
  }

  private async processJobWithLangChain(job: Job): Promise<any> {
    if (!this.agentExecutor) {
      throw new Error('Agent executor not initialized');
    }

    // First, check if this job requires workflow coordination
    const workflowPlan = await this.workflowCoordinator.planWorkflow(job);

    if (workflowPlan.type === 'workflow' && workflowPlan.workflow) {
      this.logger.info('Executing multi-step workflow', {
        jobId: job.jobId,
        workflowId: workflowPlan.workflow.id,
        stepCount: workflowPlan.workflow.steps.length,
      });

      return await this.workflowCoordinator.executeWorkflow(
        workflowPlan.workflow,
        this.agentExecutors
      );
    }

    // Single agent execution with LangChain orchestration
    const input = `Process this ${job.type} job with the following details:
Job ID: ${job.jobId}
User ID: ${job.userId}
Payload: ${JSON.stringify(job.payload, null, 2)}

Please analyze the job requirements, validate the input, and route to the appropriate agent.`;
    
    try {
      const response = await this.agentExecutor.invoke({
        input,
      });

      // Parse the final answer from LangChain response
      let result = response.output;
      
      // Try to parse as JSON if it looks like JSON
      if (typeof result === 'string' && (result.startsWith('{') || result.startsWith('['))) {
        try {
          const parsed = JSON.parse(result);
          // If it's a success response from our tools, extract the result
          if (parsed.success && parsed.result) {
            result = parsed.result;
          } else if (parsed.success === false) {
            throw new Error(parsed.error || 'Agent processing failed');
          } else {
            result = parsed;
          }
        } catch (parseError) {
          // If parsing fails, keep the original string result
          this.logger.debug('Could not parse LangChain response as JSON, using as string', {
            jobId: job.jobId,
            responsePreview: result.substring(0, 100),
          });
        }
      }

      this.logger.debug('LangChain orchestration completed', {
        jobId: job.jobId,
        intermediateSteps: response.intermediateSteps?.length || 0,
        hasResult: !!result,
      });

      return result;
    } catch (error) {
      this.logger.error('LangChain orchestration failed, falling back to direct routing', {
        jobId: job.jobId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      // Fall back to direct routing
      return await this.processJobDirectly(job);
    }
  }

  private async processJobDirectly(job: Job): Promise<any> {
    // Original direct routing logic
    switch (job.type) {
      case JobType.CURATE_LEARNING_PATH:
        return await this.curatorAgent.processJob(job);

      case JobType.EXPLAIN_CODE:
        return await this.teacherAgent.processJob(job);

      case JobType.EXTRACT_TEMPLATE:
        return await this.codeAgent.processExtractTemplateJob(job);

      case JobType.INTEGRATE_CODE:
        return await this.codeAgent.processIntegrateCodeJob(job);

      case JobType.MENTOR_CHAT:
        return await this.mentorAgent.processJob(job);

      default:
        throw new Error(`Unknown job type: ${(job as any).type}`);
    }
  }

  private async validateJobRequirements(job: Job): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Basic validation
    if (!job.jobId || !job.userId || !job.type) {
      issues.push('Missing required job fields');
    }

    // Type-specific validation
    switch (job.type) {
      case JobType.CURATE_LEARNING_PATH:
        const curateJob = job as any;
        if (!curateJob.payload?.technology) {
          issues.push('Learning path curation requires technology specification');
        }
        if (!curateJob.payload?.difficulty) {
          recommendations.push('Consider specifying difficulty level for better results');
        }
        break;

      case JobType.EXPLAIN_CODE:
        const explainJob = job as any;
        if (!explainJob.payload?.code) {
          issues.push('Code explanation requires code content');
        }
        if (!explainJob.payload?.language) {
          recommendations.push('Specify programming language for better explanations');
        }
        if (explainJob.payload?.code && explainJob.payload.code.length > 10000) {
          recommendations.push('Consider breaking down large code snippets for better analysis');
        }
        break;

      case JobType.EXTRACT_TEMPLATE:
        const extractJob = job as any;
        if (!extractJob.payload?.githubUrl) {
          issues.push('Template extraction requires GitHub URL');
        }
        if (!extractJob.payload?.extractionType) {
          recommendations.push('Specify extraction type for focused results');
        }
        break;

      case JobType.INTEGRATE_CODE:
        const integrateJob = job as any;
        if (!integrateJob.payload?.sourceCode || !integrateJob.payload?.targetCode) {
          issues.push('Code integration requires both source and target code');
        }
        if (!integrateJob.payload?.integrationInstructions) {
          recommendations.push('Provide integration instructions for better results');
        }
        break;

      case JobType.MENTOR_CHAT:
        const mentorJob = job as any;
        if (!mentorJob.payload?.message) {
          issues.push('Mentor chat requires a message');
        }
        if (mentorJob.payload?.message && mentorJob.payload.message.length < 5) {
          recommendations.push('Provide more detailed questions for better mentoring');
        }
        break;
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations,
    };
  }

  private determineErrorHandlingStrategy(job: Job, error: any): {
    shouldRetry: boolean;
    retryDelay: number;
    maxRetries: number;
    strategy: string;
  } {
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    
    // Don't retry if already at max retries
    if (job.retryCount >= job.maxRetries) {
      return {
        shouldRetry: false,
        retryDelay: 0,
        maxRetries: job.maxRetries,
        strategy: 'max_retries_reached',
      };
    }

    // Immediate retry for temporary failures
    const temporaryErrors = ['timeout', 'network', 'rate limit', 'service unavailable'];
    if (temporaryErrors.some(temp => errorMessage.includes(temp))) {
      return {
        shouldRetry: true,
        retryDelay: Math.min(1000 * Math.pow(2, job.retryCount), 30000), // Exponential backoff, max 30s
        maxRetries: job.maxRetries,
        strategy: 'exponential_backoff',
      };
    }

    // No retry for validation or authentication errors
    const permanentErrors = ['validation', 'authentication', 'authorization', 'invalid'];
    if (permanentErrors.some(perm => errorMessage.includes(perm))) {
      return {
        shouldRetry: false,
        retryDelay: 0,
        maxRetries: job.maxRetries,
        strategy: 'permanent_failure',
      };
    }

    // Default retry strategy for unknown errors
    return {
      shouldRetry: true,
      retryDelay: 5000, // 5 second delay
      maxRetries: Math.min(job.maxRetries, 2), // Limit retries for unknown errors
      strategy: 'conservative_retry',
    };
  }

  private async shouldRetryJobWithLangChain(job: Job, error: any): Promise<boolean> {
    if (!this.agentExecutor) {
      return this.shouldRetryJob(job, error);
    }

    try {
      const input = `Determine retry strategy for job error: ${JSON.stringify({ job, error: error.message })}`;
      const response = await this.agentExecutor.invoke({ input });
      
      const strategy = JSON.parse(response.output);
      return strategy.shouldRetry;
    } catch (langchainError) {
      this.logger.warn('LangChain error handling failed, using fallback', {
        jobId: job.jobId,
        error: langchainError instanceof Error ? langchainError.message : String(langchainError),
      });
      
      return this.shouldRetryJob(job, error);
    }
  }

  private shouldRetryJob(job: Job, error: any): boolean {
    // Don't retry if already at max retries
    if (job.retryCount >= job.maxRetries) {
      return false;
    }

    // Don't retry validation errors
    if (error instanceof Error && error.message.includes('validation')) {
      return false;
    }

    // Don't retry authentication errors
    if (error instanceof Error && error.message.includes('authentication')) {
      return false;
    }

    // Retry for temporary failures
    const retryableErrors = [
      'timeout',
      'network',
      'rate limit',
      'service unavailable',
      'internal server error',
    ];

    const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    return retryableErrors.some(retryableError => errorMessage.includes(retryableError));
  }

  /**
   * Get orchestration health status and metrics
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    langchainEnabled: boolean;
    agentStatus: {
      curator: boolean;
      teacher: boolean;
      code: boolean;
      mentor: boolean;
    };
    workflowCoordinatorEnabled: boolean;
    lastHealthCheck: string;
  } {
    const agentStatus = {
      curator: !!this.curatorAgent,
      teacher: !!this.teacherAgent,
      code: !!this.codeAgent,
      mentor: !!this.mentorAgent,
    };

    const allAgentsHealthy = Object.values(agentStatus).every(status => status);
    const langchainEnabled = !!this.agentExecutor;
    const workflowCoordinatorEnabled = !!this.workflowCoordinator;

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (allAgentsHealthy && workflowCoordinatorEnabled) {
      status = langchainEnabled ? 'healthy' : 'degraded';
    } else if (allAgentsHealthy) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      langchainEnabled,
      agentStatus,
      workflowCoordinatorEnabled,
      lastHealthCheck: new Date().toISOString(),
    };
  }

  /**
   * Get orchestration metrics
   */
  getMetrics(): {
    totalJobsProcessed: number;
    successfulJobs: number;
    failedJobs: number;
    averageProcessingTime: number;
    langchainUsageCount: number;
    directRoutingCount: number;
    workflowExecutionCount: number;
  } {
    // In a real implementation, these would be tracked in memory or persisted
    // For now, return placeholder metrics
    return {
      totalJobsProcessed: 0,
      successfulJobs: 0,
      failedJobs: 0,
      averageProcessingTime: 0,
      langchainUsageCount: 0,
      directRoutingCount: 0,
      workflowExecutionCount: 0,
    };
  }

  /**
   * Reinitialize the agent executor (useful for recovery scenarios)
   */
  async reinitializeAgentExecutor(): Promise<boolean> {
    try {
      await this.initializeAgentExecutor();
      return !!this.agentExecutor;
    } catch (error) {
      this.logger.error('Failed to reinitialize agent executor', {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }
}