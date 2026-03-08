import { putItem, getItem, queryItems, TABLES } from './dynamodb';

/**
 * Job Data Model
 * 
 * PK: "JOB#{jobId}"
 * SK: "USER#{userId}"
 */

export interface Job {
  PK: string;              // "JOB#{jobId}"
  SK: string;              // "USER#{userId}"
  type: 'curate' | 'extract' | 'integrate';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;        // 0-100
  input: Record<string, any>;
  result?: Record<string, any>;
  error?: string;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;       // TTL 24 hours
}

/**
 * Create a new job
 */
export async function createJob(
  jobId: string,
  userId: string,
  data: {
    type: Job['type'];
    input: Record<string, any>;
  }
): Promise<Job> {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + (24 * 60 * 60); // 24 hours from now

  const job: Job = {
    PK: `JOB#${jobId}`,
    SK: `USER#${userId}`,
    type: data.type,
    status: 'queued',
    progress: 0,
    input: data.input,
    createdAt: now,
    updatedAt: now,
    expiresAt,
  };

  await putItem(TABLES.JOBS, job as unknown as Record<string, unknown>);
  return job;
}

/**
 * Get a job by ID
 */
export async function getJob(jobId: string): Promise<Job | null> {
  // We need to query by PK since we don't know the userId
  const items = await queryItems(
    TABLES.JOBS,
    'PK = :pk',
    {
      ':pk': `JOB#${jobId}`,
    }
  );

  if (items.length === 0) {
    return null;
  }

  return items[0]! as Job;
}

/**
 * Get a job by ID and userId
 */
export async function getJobByUser(
  jobId: string,
  userId: string
): Promise<Job | null> {
  const item = await getItem(TABLES.JOBS, {
    PK: `JOB#${jobId}`,
    SK: `USER#${userId}`,
  });

  if (!item) {
    return null;
  }

  return item as Job;
}

/**
 * Update job status and progress
 */
export async function updateJobStatus(
  jobId: string,
  userId: string,
  status: Job['status'],
  progress?: number,
  result?: Record<string, any>,
  error?: string
): Promise<void> {
  const job = await getJobByUser(jobId, userId);
  if (!job) {
    throw new Error('Job not found');
  }

  const now = Math.floor(Date.now() / 1000);
  const updatedJob: Job = {
    ...job,
    status,
    progress: progress ?? job.progress,
    result: result ?? job.result,
    error: error ?? job.error,
    updatedAt: now,
  };

  await putItem(TABLES.JOBS, updatedJob as unknown as Record<string, unknown>);
}

/**
 * Get all jobs for a user
 */
export async function getJobsByUser(userId: string): Promise<Job[]> {
  const items = await queryItems(
    TABLES.JOBS,
    'SK = :sk',
    {
      ':sk': `USER#${userId}`,
    }
  );

  return items.map((item) => item as Job);
}