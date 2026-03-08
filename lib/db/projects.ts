import { putItem, getItem, queryItems, TABLES } from './dynamodb';

/**
 * Project Data Model
 * 
 * PK: "PROJECT#{projectId}"
 * SK: "USER#{userId}"
 * 
 * GSI: userId-status-index
 * - Partition Key: SK (userId)
 * - Sort Key: status
 */

export interface Project {
  PK: string;              // "PROJECT#{projectId}"
  SK: string;              // "USER#{userId}"
  name: string;
  technology: string;
  type: 'learning' | 'custom';
  status: 'active' | 'completed';
  progress: number;        // 0-100
  codeS3Key: string;       // S3 reference
  githubSourceUrl?: string;
  deploymentUrl?: string;
  deploymentPlatform?: 'vercel' | 'netlify';
  deployedAt?: number;     // Unix timestamp
  learningPathKey?: string; // "TECH#{technology}#DIFF#{difficulty}" for linking to learning path
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

/**
 * Create a new project
 */
export async function createProject(
  projectId: string,
  userId: string,
  data: {
    name: string;
    technology: string;
    type: 'learning' | 'custom';
    githubSourceUrl?: string;
    learningPathKey?: string;
  }
): Promise<Project> {
  const now = Math.floor(Date.now() / 1000);

  const project: Project = {
    PK: `PROJECT#${projectId}`,
    SK: `USER#${userId}`,
    name: data.name,
    technology: data.technology,
    type: data.type,
    status: 'active',
    progress: 0,
    codeS3Key: `${userId}/${projectId}/code.zip`,
    githubSourceUrl: data.githubSourceUrl,
    learningPathKey: data.learningPathKey,
    createdAt: now,
    updatedAt: now,
  };

  await putItem(TABLES.PROJECTS, project as unknown as Record<string, unknown>);
  return project;
}

/**
 * Get a project by projectId
 */
export async function getProject(projectId: string): Promise<Project | null> {
  // We need to query by PK since we don't know the userId
  const items = await queryItems(
    TABLES.PROJECTS,
    'PK = :pk',
    {
      ':pk': `PROJECT#${projectId}`,
    }
  );

  if (items.length === 0) {
    return null;
  }

  return items[0]! as Project;
}

/**
 * Get a project by projectId and userId
 */
export async function getProjectByUser(
  projectId: string,
  userId: string
): Promise<Project | null> {
  const item = await getItem(TABLES.PROJECTS, {
    PK: `PROJECT#${projectId}`,
    SK: `USER#${userId}`,
  });

  if (!item) {
    return null;
  }

  return item as Project;
}

/**
 * Get all projects for a user
 */
export async function getProjectsByUser(userId: string): Promise<Project[]> {
  const items = await queryItems(
    TABLES.PROJECTS,
    'SK = :sk',
    {
      ':sk': `USER#${userId}`,
    },
    'userId-status-index'
  );

  return items.map((item) => item as Project);
}

/**
 * Update project progress
 */
export async function updateProjectProgress(
  projectId: string,
  userId: string,
  progress: number
): Promise<void> {
  const project = await getProjectByUser(projectId, userId);
  if (!project) {
    throw new Error('Project not found');
  }

  const now = Math.floor(Date.now() / 1000);
  const updatedProject: Project = {
    ...project,
    progress,
    status: progress === 100 ? 'completed' : 'active',
    completedAt: progress === 100 ? now : project.completedAt,
    updatedAt: now,
  };

  await putItem(TABLES.PROJECTS, updatedProject as unknown as Record<string, unknown>);
}

/**
 * Update project code S3 key
 */
export async function updateProjectCode(
  projectId: string,
  userId: string,
  codeS3Key: string
): Promise<void> {
  const project = await getProjectByUser(projectId, userId);
  if (!project) {
    throw new Error('Project not found');
  }

  const now = Math.floor(Date.now() / 1000);
  const updatedProject: Project = {
    ...project,
    codeS3Key,
    updatedAt: now,
  };

  await putItem(TABLES.PROJECTS, updatedProject as unknown as Record<string, unknown>);
}

/**
 * Update project deployment URL
 */
export async function updateProjectDeployment(
  projectId: string,
  userId: string,
  deploymentUrl: string,
  platform?: 'vercel' | 'netlify'
): Promise<void> {
  const project = await getProjectByUser(projectId, userId);
  if (!project) {
    throw new Error('Project not found');
  }

  const now = Math.floor(Date.now() / 1000);
  const updatedProject: Project = {
    ...project,
    deploymentUrl,
    deploymentPlatform: platform,
    deployedAt: now,
    updatedAt: now,
  };

  await putItem(TABLES.PROJECTS, updatedProject as unknown as Record<string, unknown>);
}

/**
 * Get all completed projects with deployments for a user (for portfolio)
 * Requirements 9.3: "display all completed projects with live links"
 */
export async function getDeployedProjectsByUser(userId: string): Promise<Project[]> {
  const allProjects = await getProjectsByUser(userId);
  return allProjects.filter(project => 
    project.status === 'completed' && project.deploymentUrl
  );
}

/**
 * Get all completed projects for a user (regardless of deployment status)
 */
export async function getCompletedProjectsByUser(userId: string): Promise<Project[]> {
  const allProjects = await getProjectsByUser(userId);
  return allProjects.filter(project => project.status === 'completed');
}

