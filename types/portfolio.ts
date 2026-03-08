// Portfolio Types for CodeLearn Platform
// Task 10.1: Define TypeScript interfaces for portfolio functionality

export interface PortfolioProject {
  id: string;
  name: string;
  description: string;
  technology: string;
  techStack: string[];
  githubUrl: string;
  deploymentUrl: string;
  deploymentPlatform: 'vercel' | 'netlify';
  deployedAt: number;
  status: 'completed';
  type: 'learning' | 'custom';
  progress: number;
  completedAt?: number;
}

export interface PortfolioData {
  projects: PortfolioProject[];
  total: number;
}

export interface PortfolioResponse {
  success: boolean;
  data?: PortfolioData;
  error?: {
    code: string;
    message: string;
  };
}

export interface PortfolioFilters {
  search?: string;
  technology?: string;
  status?: 'all' | 'completed';
  dateRange?: 'all' | 'last-week' | 'last-month' | 'last-year';
  sortBy?: 'newest' | 'oldest' | 'name' | 'technology' | 'completion-date';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface PortfolioSettings {
  isPublic: boolean;
  showGithubLinks: boolean;
  showTechStack: boolean;
  customDescription?: string;
}

export interface PublicPortfolioData extends PortfolioData {
  user: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  settings: PortfolioSettings;
}