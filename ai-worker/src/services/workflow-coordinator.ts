import { Job, JobType } from '../types/job';
import { Logger } from '../utils/logger';
import { ChatAnthropic } from '@langchain/anthropic';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

export interface WorkflowStep {
  id: string;
  name: string;
  agentType: 'curator' | 'teacher' | 'code' | 'mentor';
  operation?: string;
  dependencies: string[];
  input: any;
  output?: any;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  retryCount: number;
  maxRetries: number;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export class WorkflowCoordinator {
  private logger = Logger.getInstance();
  private llm: ChatAnthropic;
  private workflowPlanner: RunnableSequence;

  constructor() {
    this.llm = new ChatAnthropic({
      modelName: 'claude-3-5-sonnet-20241022',
      temperature: 0.1,
      maxTokens: 2000,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    });

    this.workflowPlanner = this.initializeWorkflowPlanner();
  }

  private initializeWorkflowPlanner(): RunnableSequence {
    const plannerPrompt = PromptTemplate.fromTemplate(`
You are a workflow planner for an AI-powered CodeLearn platform. Your job is to analyze complex jobs and break them down into coordinated steps across multiple AI agents.

Available agents:
- Curator Agent: Creates learning paths, curates content
- Teacher Agent: Explains code, provides educational breakdowns  
- Code Agent: Extracts templates, integrates code
- Mentor Agent: Provides guidance, answers questions

Job to analyze: {job}

Determine if this job requires a multi-step workflow or can be handled by a single agent.

For single-agent jobs, respond with:
{{"type": "single", "agent": "agent_name", "operation": "operation_name"}}

For multi-step workflows, respond with:
{{
  "type": "workflow",
  "name": "Workflow Name",
  "description": "Brief description",
  "steps": [
    {{
      "id": "step1",
      "name": "Step Name",
      "agentType": "agent_name",
      "operation": "operation_name",
      "dependencies": [],
      "input": {{"key": "value"}}
    }}
  ]
}}

Consider these workflow patterns:
1. Learning Path + Code Explanation: Curator creates path, Teacher explains key concepts
2. Template Extraction + Integration: Code agent extracts, then integrates with guidance
3. Code Review + Mentoring: Teacher explains issues, Mentor provides improvement guidance
4. Multi-step Learning: Curator plans, Teacher explains, Mentor guides practice

Respond with valid JSON only.
    `);

    return RunnableSequence.from([
      plannerPrompt,
      this.llm,
      new StringOutputParser(),
    ]);
  }

  async planWorkflow(job: Job): Promise<{ type: 'single' | 'workflow'; workflow?: Workflow; singleAgent?: { agent: string; operation?: string } }> {
    try {
      this.logger.info('Planning workflow for job', {
        jobId: job.jobId,
        type: job.type,
      });

      const response = await this.workflowPlanner.invoke({
        job: JSON.stringify(job),
      });

      const plan = JSON.parse(response);

      if (plan.type === 'single') {
        return {
          type: 'single',
          singleAgent: {
            agent: plan.agent,
            operation: plan.operation,
          },
        };
      }

      // Create workflow from plan
      const workflow: Workflow = {
        id: `workflow_${job.jobId}_${Date.now()}`,
        name: plan.name,
        description: plan.description,
        steps: plan.steps.map((step: any) => ({
          ...step,
          status: 'pending' as const,
          retryCount: 0,
          maxRetries: 3,
          output: undefined,
        })),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.logger.info('Workflow planned successfully', {
        jobId: job.jobId,
        workflowId: workflow.id,
        stepCount: workflow.steps.length,
      });

      return {
        type: 'workflow',
        workflow,
      };

    } catch (error) {
      this.logger.error('Workflow planning failed', {
        jobId: job.jobId,
        error: error instanceof Error ? error.message : String(error),
      });

      // Fall back to single agent routing
      return this.fallbackToSingleAgent(job);
    }
  }

  async executeWorkflow(workflow: Workflow, agentExecutors: Map<string, (input: any, operation?: string) => Promise<any>>): Promise<any> {
    this.logger.info('Starting workflow execution', {
      workflowId: workflow.id,
      stepCount: workflow.steps.length,
    });

    workflow.status = 'in_progress';
    workflow.updatedAt = new Date().toISOString();

    try {
      const completedSteps = new Set<string>();
      let finalResult: any = null;

      while (completedSteps.size < workflow.steps.length) {
        const readySteps = workflow.steps.filter(step => 
          step.status === 'pending' && 
          step.dependencies.every(dep => completedSteps.has(dep))
        );

        if (readySteps.length === 0) {
          const pendingSteps = workflow.steps.filter(step => step.status === 'pending');
          if (pendingSteps.length > 0) {
            throw new Error('Workflow deadlock: no steps can be executed');
          }
          break;
        }

        // Execute ready steps in parallel
        const stepPromises = readySteps.map(step => this.executeWorkflowStep(step, workflow, agentExecutors));
        const stepResults = await Promise.allSettled(stepPromises);

        // Process results
        for (let i = 0; i < stepResults.length; i++) {
          const result = stepResults[i];
          const step = readySteps[i];

          if (result.status === 'fulfilled') {
            step.status = 'completed';
            step.output = result.value;
            completedSteps.add(step.id);
            finalResult = result.value; // Keep the last successful result

            this.logger.info('Workflow step completed', {
              workflowId: workflow.id,
              stepId: step.id,
              stepName: step.name,
            });
          } else {
            step.status = 'failed';
            step.retryCount++;

            this.logger.error('Workflow step failed', {
              workflowId: workflow.id,
              stepId: step.id,
              stepName: step.name,
              error: result.reason,
              retryCount: step.retryCount,
            });

            // Retry logic
            if (step.retryCount < step.maxRetries) {
              step.status = 'pending';
              this.logger.info('Retrying workflow step', {
                workflowId: workflow.id,
                stepId: step.id,
                retryCount: step.retryCount,
              });
            } else {
              throw new Error(`Workflow step ${step.name} failed after ${step.maxRetries} retries: ${result.reason}`);
            }
          }
        }

        workflow.updatedAt = new Date().toISOString();
      }

      workflow.status = 'completed';
      workflow.updatedAt = new Date().toISOString();

      this.logger.info('Workflow execution completed', {
        workflowId: workflow.id,
        completedSteps: completedSteps.size,
      });

      return finalResult;

    } catch (error) {
      workflow.status = 'failed';
      workflow.updatedAt = new Date().toISOString();

      this.logger.error('Workflow execution failed', {
        workflowId: workflow.id,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  private async executeWorkflowStep(
    step: WorkflowStep, 
    workflow: Workflow, 
    agentExecutors: Map<string, (input: any, operation?: string) => Promise<any>>
  ): Promise<any> {
    step.status = 'in_progress';

    const executor = agentExecutors.get(step.agentType);
    if (!executor) {
      throw new Error(`No executor found for agent type: ${step.agentType}`);
    }

    // Prepare input with outputs from dependency steps
    const enrichedInput = { ...step.input };
    
    for (const depId of step.dependencies) {
      const depStep = workflow.steps.find(s => s.id === depId);
      if (depStep && depStep.output) {
        enrichedInput[`${depId}_output`] = depStep.output;
      }
    }

    // Execute the step
    const result = await executor(enrichedInput, step.operation);
    return result;
  }

  private fallbackToSingleAgent(job: Job): { type: 'single'; singleAgent: { agent: string; operation?: string } } {
    // Simple mapping based on job type
    const agentMapping: Record<JobType, { agent: string; operation?: string }> = {
      [JobType.CURATE_LEARNING_PATH]: { agent: 'curator' },
      [JobType.EXPLAIN_CODE]: { agent: 'teacher' },
      [JobType.EXTRACT_TEMPLATE]: { agent: 'code', operation: 'extract' },
      [JobType.INTEGRATE_CODE]: { agent: 'code', operation: 'integrate' },
      [JobType.MENTOR_CHAT]: { agent: 'mentor' },
    };

    return {
      type: 'single',
      singleAgent: agentMapping[job.type] || { agent: 'mentor' },
    };
  }

  getWorkflowStatus(_workflowId: string): Workflow | null {
    // In a real implementation, this would fetch from a database
    // For now, return null as workflows are handled in-memory
    return null;
  }

  async cancelWorkflow(workflowId: string): Promise<void> {
    this.logger.info('Cancelling workflow', { workflowId });
    // Implementation would mark workflow as cancelled and stop execution
    // In a real implementation, this would:
    // 1. Find the workflow by ID
    // 2. Mark it as cancelled
    // 3. Stop any running steps
    // 4. Clean up resources
  }

  /**
   * Get workflow execution metrics
   */
  getWorkflowMetrics(): {
    totalWorkflowsExecuted: number;
    successfulWorkflows: number;
    failedWorkflows: number;
    averageWorkflowDuration: number;
    averageStepsPerWorkflow: number;
    mostCommonWorkflowPatterns: string[];
  } {
    // In a real implementation, these would be tracked
    return {
      totalWorkflowsExecuted: 0,
      successfulWorkflows: 0,
      failedWorkflows: 0,
      averageWorkflowDuration: 0,
      averageStepsPerWorkflow: 0,
      mostCommonWorkflowPatterns: [],
    };
  }

  /**
   * Validate workflow definition
   */
  validateWorkflow(workflow: Workflow): {
    isValid: boolean;
    issues: string[];
    warnings: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check basic structure
    if (!workflow.id || !workflow.name || !workflow.steps) {
      issues.push('Workflow missing required fields (id, name, steps)');
    }

    if (!Array.isArray(workflow.steps) || workflow.steps.length === 0) {
      issues.push('Workflow must have at least one step');
    }

    // Check steps
    const stepIds = new Set<string>();
    const validAgentTypes = ['curator', 'teacher', 'code', 'mentor'];

    for (const step of workflow.steps) {
      // Check for duplicate step IDs
      if (stepIds.has(step.id)) {
        issues.push(`Duplicate step ID: ${step.id}`);
      }
      stepIds.add(step.id);

      // Check required fields
      if (!step.id || !step.name || !step.agentType) {
        issues.push(`Step ${step.id || 'unknown'} missing required fields`);
      }

      // Check agent type
      if (!validAgentTypes.includes(step.agentType)) {
        issues.push(`Invalid agent type: ${step.agentType}`);
      }

      // Check dependencies
      for (const depId of step.dependencies) {
        if (!stepIds.has(depId) && !workflow.steps.some(s => s.id === depId)) {
          issues.push(`Step ${step.id} depends on non-existent step: ${depId}`);
        }
      }
    }

    // Check for circular dependencies
    if (this.hasCircularDependencies(workflow.steps)) {
      issues.push('Workflow contains circular dependencies');
    }

    // Warnings
    if (workflow.steps.length > 10) {
      warnings.push('Workflow has many steps, consider breaking into smaller workflows');
    }

    const isolatedSteps = workflow.steps.filter(step => 
      step.dependencies.length === 0 && 
      !workflow.steps.some(s => s.dependencies.includes(step.id))
    );
    if (isolatedSteps.length > 1) {
      warnings.push('Multiple isolated steps detected, consider if they can be combined');
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings,
    };
  }

  private hasCircularDependencies(steps: WorkflowStep[]): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (stepId: string): boolean => {
      if (recursionStack.has(stepId)) {
        return true; // Circular dependency found
      }
      if (visited.has(stepId)) {
        return false; // Already processed
      }

      visited.add(stepId);
      recursionStack.add(stepId);

      const step = steps.find(s => s.id === stepId);
      if (step) {
        for (const depId of step.dependencies) {
          if (hasCycle(depId)) {
            return true;
          }
        }
      }

      recursionStack.delete(stepId);
      return false;
    };

    for (const step of steps) {
      if (!visited.has(step.id) && hasCycle(step.id)) {
        return true;
      }
    }

    return false;
  }
}