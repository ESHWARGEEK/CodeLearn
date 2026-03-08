import { z } from 'zod';

// Job Types
export enum JobType {
  CURATE_LEARNING_PATH = 'curate_learning_path',
  EXPLAIN_CODE = 'explain_code',
  EXTRACT_TEMPLATE = 'extract_template',
  INTEGRATE_CODE = 'integrate_code',
  MENTOR_CHAT = 'mentor_chat',
}

export enum JobStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRY = 'retry',
}

// Base Job Schema
export const BaseJobSchema = z.object({
  jobId: z.string(),
  userId: z.string(),
  type: z.nativeEnum(JobType),
  status: z.nativeEnum(JobStatus),
  createdAt: z.string(),
  updatedAt: z.string(),
  retryCount: z.number().default(0),
  maxRetries: z.number().default(3),
});

// Curate Learning Path Job
export const CurateLearningPathJobSchema = BaseJobSchema.extend({
  type: z.literal(JobType.CURATE_LEARNING_PATH),
  payload: z.object({
    technology: z.string(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    preferences: z.object({
      projectType: z.string().optional(),
      timeCommitment: z.string().optional(),
      learningGoals: z.array(z.string()).optional(),
    }).optional(),
  }),
});

// Explain Code Job
export const ExplainCodeJobSchema = BaseJobSchema.extend({
  type: z.literal(JobType.EXPLAIN_CODE),
  payload: z.object({
    code: z.string(),
    language: z.string(),
    context: z.string().optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  }),
});

// Extract Template Job
export const ExtractTemplateJobSchema = BaseJobSchema.extend({
  type: z.literal(JobType.EXTRACT_TEMPLATE),
  payload: z.object({
    githubUrl: z.string().url(),
    extractionType: z.enum(['component', 'pattern', 'full']),
    targetFramework: z.string().optional(),
  }),
});

// Integrate Code Job
export const IntegrateCodeJobSchema = BaseJobSchema.extend({
  type: z.literal(JobType.INTEGRATE_CODE),
  payload: z.object({
    sourceCode: z.string(),
    targetCode: z.string(),
    integrationInstructions: z.string(),
    framework: z.string(),
  }),
});

// Mentor Chat Job
export const MentorChatJobSchema = BaseJobSchema.extend({
  type: z.literal(JobType.MENTOR_CHAT),
  payload: z.object({
    message: z.string(),
    conversationHistory: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
      timestamp: z.string(),
    })).optional(),
    context: z.object({
      currentProject: z.string().optional(),
      learningPath: z.string().optional(),
      userLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    }).optional(),
  }),
});

// Union type for all job schemas
export const JobSchema = z.discriminatedUnion('type', [
  CurateLearningPathJobSchema,
  ExplainCodeJobSchema,
  ExtractTemplateJobSchema,
  IntegrateCodeJobSchema,
  MentorChatJobSchema,
]);

// TypeScript types
export type BaseJob = z.infer<typeof BaseJobSchema>;
export type CurateLearningPathJob = z.infer<typeof CurateLearningPathJobSchema>;
export type ExplainCodeJob = z.infer<typeof ExplainCodeJobSchema>;
export type ExtractTemplateJob = z.infer<typeof ExtractTemplateJobSchema>;
export type IntegrateCodeJob = z.infer<typeof IntegrateCodeJobSchema>;
export type MentorChatJob = z.infer<typeof MentorChatJobSchema>;
export type Job = z.infer<typeof JobSchema>;

// Job Result Schema
export const JobResultSchema = z.object({
  jobId: z.string(),
  status: z.nativeEnum(JobStatus),
  result: z.any().optional(),
  error: z.object({
    message: z.string(),
    code: z.string(),
    details: z.any().optional(),
  }).optional(),
  completedAt: z.string().optional(),
  processingTimeMs: z.number().optional(),
});

export type JobResult = z.infer<typeof JobResultSchema>;