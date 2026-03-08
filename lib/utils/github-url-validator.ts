/**
 * GitHub URL Validation Utility
 * 
 * Validates GitHub repository URLs and provides descriptive error messages.
 * Supports multiple GitHub URL formats including HTTPS and SSH.
 */

export interface GitHubUrlValidationResult {
  isValid: boolean;
  error?: string;
  normalizedUrl?: string;
  owner?: string;
  repo?: string;
}

export interface GitHubUrlParts {
  owner: string;
  repo: string;
}

/**
 * Validates GitHub repository owner and repository names
 * According to GitHub naming rules:
 * - Can contain alphanumeric characters, hyphens, underscores, and periods
 * - Cannot start or end with hyphens
 * - Cannot be empty
 * - Cannot exceed 100 characters
 */
function isValidGitHubName(name: string): boolean {
  if (!name || name.length === 0 || name.length > 100) {
    return false;
  }
  
  // Cannot start or end with hyphens
  if (name.startsWith('-') || name.endsWith('-')) {
    return false;
  }
  
  // Can only contain alphanumeric characters, hyphens, underscores, and periods
  const validPattern = /^[a-zA-Z0-9._-]+$/;
  return validPattern.test(name);
}

/**
 * Extracts owner and repository name from a GitHub URL
 */
function extractGitHubParts(url: string): GitHubUrlParts | null {
  // HTTPS format: https://github.com/owner/repo[.git][/]
  // More strict regex that only allows valid GitHub name characters
  const httpsMatch = url.match(/^https:\/\/github\.com\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+?)(?:\.git)?\/?$/);
  if (httpsMatch) {
    return {
      owner: httpsMatch[1],
      repo: httpsMatch[2]
    };
  }
  
  // SSH format: git@github.com:owner/repo.git
  const sshMatch = url.match(/^git@github\.com:([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+?)(?:\.git)?$/);
  if (sshMatch) {
    return {
      owner: sshMatch[1],
      repo: sshMatch[2]
    };
  }
  
  return null;
}

/**
 * Normalizes a GitHub URL to the standard HTTPS format
 */
function normalizeGitHubUrl(owner: string, repo: string): string {
  return `https://github.com/${owner}/${repo}`;
}

/**
 * Validates a GitHub repository URL
 * 
 * @param url - The GitHub repository URL to validate
 * @returns Validation result with error message if invalid
 */
export function validateGitHubUrl(url: string): GitHubUrlValidationResult {
  // Check if URL is provided
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return {
      isValid: false,
      error: 'Please enter a GitHub repository URL'
    };
  }
  
  const trimmedUrl = url.trim();
  
  // Extract owner and repo from URL
  const parts = extractGitHubParts(trimmedUrl);
  if (!parts) {
    return {
      isValid: false,
      error: 'Invalid GitHub URL format. Please use: https://github.com/owner/repo or git@github.com:owner/repo.git'
    };
  }
  
  const { owner, repo } = parts;
  
  // Validate owner name
  if (!isValidGitHubName(owner)) {
    return {
      isValid: false,
      error: 'Invalid repository owner name. Owner names can contain letters, numbers, hyphens, underscores, and periods, but cannot start or end with hyphens.'
    };
  }
  
  // Validate repository name
  if (!isValidGitHubName(repo)) {
    return {
      isValid: false,
      error: 'Invalid repository name. Repository names can contain letters, numbers, hyphens, underscores, and periods, but cannot start or end with hyphens.'
    };
  }
  
  // All validations passed
  return {
    isValid: true,
    normalizedUrl: normalizeGitHubUrl(owner, repo),
    owner,
    repo
  };
}

/**
 * Quick validation function that returns only boolean result
 * Useful for simple validation checks
 */
export function isValidGitHubUrl(url: string): boolean {
  return validateGitHubUrl(url).isValid;
}

/**
 * Supported GitHub URL formats for reference
 */
export const SUPPORTED_FORMATS = [
  'https://github.com/owner/repo',
  'https://github.com/owner/repo.git',
  'https://github.com/owner/repo/',
  'git@github.com:owner/repo.git'
] as const;