/**
 * Types for AI Agents
 */

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface CuratorInput {
  technology: string;
  difficulty: DifficultyLevel;
}

export interface RepositoryMetadata {
  id: string;
  name: string;
  description: string;
  githubUrl: string;
  stars: number;
  lastUpdated: string;
  hasDocumentation: boolean;
  readmeQuality: number; // 0-100
  codeStructure: number; // 0-100
  testCoverage: number; // 0-100
  educationalValue: number; // 0-100 (calculated score)
  techStack: string[];
  estimatedHours: number;
}

export interface CuratorOutput {
  repositories: RepositoryMetadata[];
  technology: string;
  difficulty: DifficultyLevel;
  generatedAt: number;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  updated_at: string;
  language: string | null;
  topics: string[];
  has_wiki: boolean;
  has_pages: boolean;
  default_branch: string;
}

export interface GitHubReadme {
  content: string;
  encoding: string;
}

// Teacher Agent Types

export interface TeacherInput {
  githubUrl: string;
  difficulty: DifficultyLevel;
  technology?: string;
}

export interface Task {
  taskId: string;
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
  hints: string[];
  learningObjectives: string[];
  completed: boolean;
}

export interface TeacherOutput {
  projectId: string;
  projectName: string;
  githubUrl: string;
  difficulty: DifficultyLevel;
  tasks: Task[];
  estimatedHours: number;
  generatedAt: number;
}

// Mentor Agent Types

export type MentorResponseType = 'hint' | 'explanation' | 'chat';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface MentorInput {
  responseType: MentorResponseType;
  question: string;
  taskContext?: string;
  codeContext?: string;
  conversationHistory: ConversationMessage[];
}

export interface MentorOutput {
  response: string;
  responseType: MentorResponseType;
  timestamp: number;
}

// Code Agent Types

export interface CodeAgentInput {
  githubUrl: string;
  componentPath?: string;
}

export interface CodeAgentOutput {
  components: ExtractableComponent[];
  repositoryInfo: {
    name: string;
    description: string;
    stars: number;
    language: string;
    license: string;
  };
}

export interface ExtractableComponent {
  id: string;
  name: string;
  description: string;
  filePath: string;
  dependencies: string[];
  category: string;
  complexity: 'simple' | 'moderate' | 'complex';
}
