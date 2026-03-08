// Minimal stub for learning paths
export interface Task {
  taskId: string;
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
  hints: string[];
}

export interface LearningPath {
  PK: string;
  SK: string;
  projectId: string;
  name: string;
  description: string;
  githubUrl: string;
  estimatedHours: number;
  tasks: Task[];
  generatedAt: number;
  expiresAt: number;
}

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

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
  // Stub implementation
  return {
    PK: `TECH#${technology}`,
    SK: `DIFF#${difficulty}`,
    projectId: data.projectId,
    name: data.name,
    description: data.description,
    githubUrl: data.githubUrl,
    estimatedHours: data.estimatedHours,
    tasks: data.tasks,
    generatedAt: Math.floor(Date.now() / 1000),
    expiresAt: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
  };
}

export async function getLearningPath(
  technology: string,
  difficulty: Difficulty
): Promise<LearningPath | null> {
  // Stub implementation
  return null;
}

export async function getLearningPathsByTechnology(
  technology: string
): Promise<LearningPath[]> {
  // Stub implementation
  return [];
}

export async function learningPathExists(
  technology: string,
  difficulty: Difficulty
): Promise<boolean> {
  // Stub implementation
  return false;
}

export async function getAvailableTechnologies(): Promise<string[]> {
  // Stub implementation
  return [];
}