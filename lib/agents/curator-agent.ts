/**
 * Curator Agent - Discovers and evaluates GitHub repositories for learning paths
 * Model: Llama 3.1 70B (cost-optimized for simple filtering)
 * 
 * Process:
 * 1. Search GitHub API for repositories matching technology
 * 2. Filter by stars (>50), recent activity (<6 months), documentation quality
 * 3. Rank by educational value (README quality, code structure, test coverage)
 * 4. Return top 3 repositories per difficulty level
 */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { Octokit } from '@octokit/rest';
import {
  CuratorInput,
  CuratorOutput,
  RepositoryMetadata,
  GitHubRepository,
  GitHubReadme,
  DifficultyLevel,
} from './types';

export class CuratorAgent {
  private bedrockClient: BedrockRuntimeClient;
  private octokit: Octokit;
  private readonly MODEL_ID = 'meta.llama3-1-70b-instruct-v1:0';

  constructor() {
    // Initialize AWS Bedrock client
    this.bedrockClient = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });

    // Initialize GitHub API client
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
  }

  /**
   * Main method to curate repositories for a given technology and difficulty
   */
  async curate(input: CuratorInput): Promise<CuratorOutput> {
    console.log(`[CuratorAgent] Starting curation for ${input.technology} (${input.difficulty})`);

    // Step 1: Search GitHub for repositories
    const repositories = await this.searchGitHubRepositories(input.technology);
    console.log(`[CuratorAgent] Found ${repositories.length} repositories`);

    // Step 2: Filter repositories by basic criteria
    const filteredRepos = await this.filterRepositories(repositories);
    console.log(`[CuratorAgent] Filtered to ${filteredRepos.length} repositories`);

    // Step 3: Enrich with metadata and evaluate
    const enrichedRepos = await this.enrichRepositories(filteredRepos);
    console.log(`[CuratorAgent] Enriched ${enrichedRepos.length} repositories`);

    // Step 4: Rank by educational value using AI
    const rankedRepos = await this.rankByEducationalValue(enrichedRepos, input);
    console.log(`[CuratorAgent] Ranked repositories`);

    // Step 5: Return top 3
    const topRepos = rankedRepos.slice(0, 3);

    return {
      repositories: topRepos,
      technology: input.technology,
      difficulty: input.difficulty,
      generatedAt: Date.now(),
    };
  }

  /**
   * Search GitHub API for repositories matching technology
   */
  private async searchGitHubRepositories(technology: string): Promise<GitHubRepository[]> {
    try {
      const query = this.buildSearchQuery(technology);
      
      const response = await this.octokit.search.repos({
        q: query,
        sort: 'stars',
        order: 'desc',
        per_page: 30, // Get more to filter from
      });

      return response.data.items as GitHubRepository[];
    } catch (error) {
      console.error('[CuratorAgent] GitHub search error:', error);
      throw new Error('Failed to search GitHub repositories');
    }
  }

  /**
   * Build GitHub search query based on technology
   */
  private buildSearchQuery(technology: string): string {
    const techLower = technology.toLowerCase();
    
    // Map technology to GitHub search terms
    const searchTerms: Record<string, string> = {
      react: 'react language:JavaScript language:TypeScript',
      vue: 'vue language:JavaScript language:TypeScript',
      'next.js': 'nextjs OR next.js language:JavaScript language:TypeScript',
      nextjs: 'nextjs OR next.js language:JavaScript language:TypeScript',
      'node.js': 'nodejs OR node.js language:JavaScript language:TypeScript',
      nodejs: 'nodejs OR node.js language:JavaScript language:TypeScript',
      python: 'python language:Python',
      django: 'django language:Python',
      flask: 'flask language:Python',
      express: 'express language:JavaScript language:TypeScript',
      angular: 'angular language:TypeScript',
      svelte: 'svelte language:JavaScript language:TypeScript',
      go: 'golang OR go language:Go',
      rust: 'rust language:Rust',
      typescript: 'typescript language:TypeScript',
      javascript: 'javascript language:JavaScript',
    };

    const searchTerm = searchTerms[techLower] || `${technology} language:JavaScript language:TypeScript`;
    
    // Add common filters
    return `${searchTerm} stars:>50 archived:false`;
  }

  /**
   * Filter repositories by stars, activity, and documentation
   */
  private async filterRepositories(repositories: GitHubRepository[]): Promise<GitHubRepository[]> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return repositories.filter((repo) => {
      // Filter by stars (>50)
      if (repo.stargazers_count <= 50) return false;

      // Filter by recent activity (<6 months)
      const lastUpdated = new Date(repo.updated_at);
      if (lastUpdated < sixMonthsAgo) return false;

      // Filter by description (must have one)
      if (!repo.description) return false;

      return true;
    });
  }

  /**
   * Enrich repositories with additional metadata
   */
  private async enrichRepositories(
    repositories: GitHubRepository[]
  ): Promise<RepositoryMetadata[]> {
    const enriched: RepositoryMetadata[] = [];

    for (const repo of repositories) {
      try {
        // Get README content
        const readme = await this.getReadme(repo.full_name);
        
        // Calculate quality scores
        const readmeQuality = this.calculateReadmeQuality(readme);
        const codeStructure = this.estimateCodeStructure(repo);
        const testCoverage = this.estimateTestCoverage(repo);
        
        // Extract tech stack from topics and language
        const techStack = this.extractTechStack(repo);
        
        // Estimate learning time based on repo size and complexity
        const estimatedHours = this.estimateLearningTime(repo, readmeQuality);

        enriched.push({
          id: repo.id.toString(),
          name: repo.name,
          description: repo.description || '',
          githubUrl: repo.html_url,
          stars: repo.stargazers_count,
          lastUpdated: repo.updated_at,
          hasDocumentation: readme !== null,
          readmeQuality,
          codeStructure,
          testCoverage,
          educationalValue: 0, // Will be calculated by AI
          techStack,
          estimatedHours,
        });
      } catch (error) {
        console.error(`[CuratorAgent] Error enriching ${repo.full_name}:`, error);
        // Skip this repo if we can't enrich it
      }
    }

    return enriched;
  }

  /**
   * Get README content from repository
   */
  private async getReadme(fullName: string): Promise<string | null> {
    try {
      const [owner, repo] = fullName.split('/');
      const response = await this.octokit.repos.getReadme({
        owner,
        repo,
      });

      const readme = response.data as GitHubReadme;
      
      // Decode base64 content
      const content = Buffer.from(readme.content, 'base64').toString('utf-8');
      return content;
    } catch (error) {
      console.error(`[CuratorAgent] Error fetching README for ${fullName}:`, error);
      return null;
    }
  }

  /**
   * Calculate README quality score (0-100)
   */
  private calculateReadmeQuality(readme: string | null): number {
    if (!readme) return 0;

    let score = 0;

    // Length check (good READMEs are detailed)
    if (readme.length > 500) score += 20;
    if (readme.length > 1500) score += 10;
    if (readme.length > 3000) score += 10;

    // Has sections
    if (readme.includes('## Installation') || readme.includes('## Setup')) score += 15;
    if (readme.includes('## Usage') || readme.includes('## Getting Started')) score += 15;
    if (readme.includes('## Features')) score += 10;
    if (readme.includes('## Documentation') || readme.includes('## Docs')) score += 10;
    if (readme.includes('## Contributing')) score += 5;
    if (readme.includes('## License')) score += 5;

    return Math.min(score, 100);
  }

  /**
   * Estimate code structure quality (0-100)
   */
  private estimateCodeStructure(repo: GitHubRepository): number {
    let score = 50; // Base score

    // Has topics (indicates good organization)
    if (repo.topics && repo.topics.length > 0) score += 20;
    if (repo.topics && repo.topics.length > 3) score += 10;

    // Has wiki or pages (indicates documentation)
    if (repo.has_wiki) score += 10;
    if (repo.has_pages) score += 10;

    return Math.min(score, 100);
  }

  /**
   * Estimate test coverage (0-100)
   */
  private estimateTestCoverage(repo: GitHubRepository): number {
    // This is a rough estimate based on topics
    // In a real implementation, we'd analyze the repo structure
    const topics = repo.topics || [];
    
    let score = 30; // Base score

    if (topics.includes('testing')) score += 30;
    if (topics.includes('jest')) score += 20;
    if (topics.includes('vitest')) score += 20;
    if (topics.includes('cypress')) score += 20;
    if (topics.includes('playwright')) score += 20;
    if (topics.includes('unit-testing')) score += 10;

    return Math.min(score, 100);
  }

  /**
   * Extract tech stack from repository
   */
  private extractTechStack(repo: GitHubRepository): string[] {
    const stack: string[] = [];

    // Add primary language
    if (repo.language) {
      stack.push(repo.language);
    }

    // Add relevant topics
    const relevantTopics = [
      'react',
      'vue',
      'angular',
      'svelte',
      'nextjs',
      'typescript',
      'javascript',
      'nodejs',
      'express',
      'mongodb',
      'postgresql',
      'mysql',
      'redis',
      'graphql',
      'rest-api',
      'tailwindcss',
      'sass',
      'webpack',
      'vite',
    ];

    if (repo.topics) {
      repo.topics.forEach((topic) => {
        if (relevantTopics.includes(topic.toLowerCase())) {
          stack.push(topic);
        }
      });
    }

    return stack;
  }

  /**
   * Estimate learning time in hours
   */
  private estimateLearningTime(repo: GitHubRepository, readmeQuality: number): number {
    // Base time on stars (more stars = more complex/feature-rich)
    let hours = 8; // Base time

    if (repo.stargazers_count > 100) hours += 2;
    if (repo.stargazers_count > 500) hours += 2;
    if (repo.stargazers_count > 1000) hours += 2;
    if (repo.stargazers_count > 5000) hours += 2;

    // Adjust based on README quality (better docs = easier to learn)
    if (readmeQuality > 70) hours -= 2;
    if (readmeQuality < 40) hours += 2;

    return Math.max(4, Math.min(hours, 20)); // Clamp between 4-20 hours
  }

  /**
   * Rank repositories by educational value using Llama 3.1
   */
  private async rankByEducationalValue(
    repositories: RepositoryMetadata[],
    input: CuratorInput
  ): Promise<RepositoryMetadata[]> {
    try {
      // Prepare prompt for Llama 3.1
      const prompt = this.buildRankingPrompt(repositories, input);

      // Invoke Llama 3.1 via Bedrock
      const response = await this.invokeLlama(prompt);

      // Parse AI response to get rankings
      const rankings = this.parseRankingResponse(response);

      // Apply rankings to repositories
      const rankedRepos = repositories.map((repo) => {
        const ranking = rankings.find((r) => r.id === repo.id);
        return {
          ...repo,
          educationalValue: ranking?.score || 50,
        };
      });

      // Sort by educational value (descending)
      rankedRepos.sort((a, b) => b.educationalValue - a.educationalValue);

      return rankedRepos;
    } catch (error) {
      console.error('[CuratorAgent] Error ranking repositories:', error);
      
      // Fallback: rank by simple heuristic
      return repositories
        .map((repo) => ({
          ...repo,
          educationalValue: (repo.readmeQuality + repo.codeStructure + repo.testCoverage) / 3,
        }))
        .sort((a, b) => b.educationalValue - a.educationalValue);
    }
  }

  /**
   * Build prompt for Llama 3.1 to rank repositories
   */
  private buildRankingPrompt(repositories: RepositoryMetadata[], input: CuratorInput): string {
    const repoList = repositories
      .map(
        (repo, idx) =>
          `${idx + 1}. ${repo.name} (ID: ${repo.id})
   Description: ${repo.description}
   Stars: ${repo.stars}
   README Quality: ${repo.readmeQuality}/100
   Code Structure: ${repo.codeStructure}/100
   Test Coverage: ${repo.testCoverage}/100
   Tech Stack: ${repo.techStack.join(', ')}
   Estimated Hours: ${repo.estimatedHours}`
      )
      .join('\n\n');

    return `You are an expert educator evaluating GitHub repositories for learning ${input.technology} at the ${input.difficulty} level.

Your task is to rank these repositories by their educational value for someone learning ${input.technology}.

Consider:
- For ${input.difficulty} level: ${this.getDifficultyGuidance(input.difficulty)}
- README quality and documentation
- Code structure and organization
- Presence of tests and examples
- Project complexity and scope
- Real-world applicability

Repositories to evaluate:

${repoList}

Respond with ONLY a JSON array of rankings in this exact format:
[
  {"id": "repo_id", "score": 85, "reason": "brief reason"},
  {"id": "repo_id", "score": 72, "reason": "brief reason"}
]

Score each repository from 0-100 based on educational value for ${input.difficulty} learners.`;
  }

  /**
   * Get difficulty-specific guidance for AI
   */
  private getDifficultyGuidance(difficulty: DifficultyLevel): string {
    const guidance = {
      beginner:
        'Look for simple, well-documented projects with clear structure. Avoid complex architectures.',
      intermediate:
        'Look for projects with moderate complexity, good patterns, and real-world features.',
      advanced:
        'Look for complex, production-ready projects with advanced patterns and scalability.',
    };

    return guidance[difficulty];
  }

  /**
   * Invoke Llama 3.1 via AWS Bedrock
   */
  private async invokeLlama(prompt: string): Promise<string> {
    const payload = {
      prompt,
      max_gen_len: 2048,
      temperature: 0.3, // Lower temperature for more consistent rankings
      top_p: 0.9,
    };

    const command = new InvokeModelCommand({
      modelId: this.MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    const response = await this.bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    return responseBody.generation;
  }

  /**
   * Parse AI response to extract rankings
   */
  private parseRankingResponse(response: string): Array<{ id: string; score: number }> {
    try {
      // Extract JSON from response (AI might add extra text)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const rankings = JSON.parse(jsonMatch[0]);
      
      return rankings.map((r: any) => ({
        id: r.id,
        score: r.score,
      }));
    } catch (error) {
      console.error('[CuratorAgent] Error parsing ranking response:', error);
      return [];
    }
  }
}
