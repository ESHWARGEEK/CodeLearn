import { dynamoDb, TABLES, putItem, getItem, queryItems } from './dynamodb';

/**
 * Learning Path Data Model
 * 
 * PK: "TECH#{technology}"
 * SK: "DIFF#{difficulty}"
 * 
 * Supports 24-hour caching via TTL (expiresAt field)
 */

export interface Task {
  taskId: string;
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
  hints: string[];
}

export interface LearningPath {
  PK: string;              // "TECH#{technology}"
  SK: string;              // "DIFF#{difficulty}"
  projectId: string;
  name: string;
  description: string;
  githubUrl: string;
  estimatedHours: number;
  tasks: Task[];
  generatedAt: number;     // Unix timestamp
  expiresAt: number;       // TTL for cache invalidation (24 hours)
}

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Create or update a learning path in DynamoDB
 * Automatically sets 24-hour TTL for caching
 */
export async function saveLearningPath(
  technology: string,
  difficulty: Difficulty,
  data: {
    projectId: string;
    name: string;
    description: string;
    githubUrl: string;
    estimatedHours: number;
    tasks: Task[];
  }
): Promise<LearningPath> {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + (24 * 60 * 60); // 24 hours from now

  const learningPath: LearningPath = {
    PK: `TECH#${technology}`,
    SK: `DIFF#${difficulty}`,
    projectId: data.projectId,
    name: data.name,
    description: data.description,
    githubUrl: data.githubUrl,
    estimatedHours: data.estimatedHours,
    tasks: data.tasks,
    generatedAt: now,
    expiresAt,
  };

  await putItem(TABLES.LEARNING_PATHS, learningPath as unknown as Record<string, unknown>);
  return learningPath;
}

/**
 * Get a specific learning path by technology and difficulty
 * Returns null if not found or expired
 */
export async function getLearningPath(
  technology: string,
  difficulty: Difficulty
): Promise<LearningPath | null> {
  const item = await getItem(TABLES.LEARNING_PATHS, {
    PK: `TECH#${technology}`,
    SK: `DIFF#${difficulty}`,
  });

  if (!item) {
    return null;
  }

  // Check if expired (TTL hasn't cleaned it up yet)
  const now = Math.floor(Date.now() / 1000);
  if (item.expiresAt && item.expiresAt < now) {
    return null;
  }

  return item as LearningPath;
}

/**
 * Get all learning paths for a specific technology
 * Returns paths for all difficulty levels (beginner, intermediate, advanced)
 */
export async function getLearningPathsByTechnology(
  technology: string
): Promise<LearningPath[]> {
  const items = await queryItems(
    TABLES.LEARNING_PATHS,
    'PK = :pk',
    {
      ':pk': `TECH#${technology}`,
    }
  );

  const now = Math.floor(Date.now() / 1000);
  
  // Filter out expired items
  return items
    .filter((item) => !item.expiresAt || item.expiresAt >= now)
    .map((item) => item as LearningPath);
}

/**
 * Check if a learning path exists and is not expired
 */
export async function learningPathExists(
  technology: string,
  difficulty: Difficulty
): Promise<boolean> {
  const path = await getLearningPath(technology, difficulty);
  return path !== null;
}

/**
 * Get all available technologies that have learning paths
 * Returns unique list of technologies
 */
export async function getAvailableTechnologies(): Promise<string[]> {
  // Note: This is a scan operation which can be expensive
  // In production, consider maintaining a separate index or cache
  const items = await queryItems(
    TABLES.LEARNING_PATHS,
    'PK = :pk',
    { ':pk': 'TECH#' }
  );

  const technologies = new Set<string>();
  items.forEach((item) => {
    if (item.PK && item.PK.startsWith('TECH#')) {
      const tech = item.PK.replace('TECH#', '');
      technologies.add(tech);
    }
  });

  return Array.from(technologies);
}
