/**
 * Code Agent - Analyzes GitHub repositories and extracts reusable components
 * Model: Claude 3.5 Sonnet (optimized for code analysis and understanding)
 * 
 * Process:
 * 1. Clone/fetch repository content from GitHub
 * 2. Analyze code structure and identify reusable components
 * 3. Extract component metadata (dependencies, complexity, category)
 * 4. Return structured component data for template extraction
 */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { Octokit } from '@octokit/rest';
import {
  ExtractableComponent,
  ExtractionResult,
  TemplateCategory,
  TEMPLATE_CATEGORIES,
} from '@/types/templates';

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

export class CodeAgent {
  private bedrockClient: BedrockRuntimeClient;
  private octokit: Octokit;
  private readonly MODEL_ID = 'anthropic.claude-3-5-sonnet-20241022-v2:0';

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
   * Main method to analyze repository and extract components
   */
  async extractComponents(input: CodeAgentInput): Promise<CodeAgentOutput> {
    console.log(`[CodeAgent] Starting analysis for ${input.githubUrl}`);

    // Step 1: Get repository information
    const repoInfo = await this.getRepositoryInfo(input.githubUrl);
    console.log(`[CodeAgent] Repository: ${repoInfo.name}`);

    // Step 2: Get repository structure and files
    const repoStructure = await this.getRepositoryStructure(repoInfo.owner, repoInfo.repo);
    console.log(`[CodeAgent] Found ${repoStructure.files.length} relevant files`);

    // Step 3: Analyze code files and identify components
    const components = await this.analyzeComponents(repoStructure, repoInfo);
    console.log(`[CodeAgent] Identified ${components.length} extractable components`);

    return {
      components,
      repositoryInfo: {
        name: repoInfo.name,
        description: repoInfo.description || '',
        stars: repoInfo.stars,
        language: repoInfo.language || 'Unknown',
        license: repoInfo.license || 'Unknown',
      },
    };
  }

  /**
   * Extract repository information from GitHub URL
   */
  private async getRepositoryInfo(githubUrl: string) {
    const urlParts = githubUrl.replace('https://github.com/', '').split('/');
    const [owner, repo] = urlParts;

    if (!owner || !repo) {
      throw new Error('Invalid GitHub URL format');
    }

    try {
      const response = await this.octokit.repos.get({
        owner,
        repo,
      });

      return {
        owner,
        repo,
        name: response.data.name,
        description: response.data.description,
        stars: response.data.stargazers_count,
        language: response.data.language,
        license: response.data.license?.name,
        defaultBranch: response.data.default_branch,
      };
    } catch (error) {
      console.error('[CodeAgent] Error fetching repository info:', error);
      throw new Error('Failed to fetch repository information');
    }
  }

  /**
   * Get repository structure and relevant files
   */
  private async getRepositoryStructure(owner: string, repo: string) {
    try {
      // Get repository tree
      const treeResponse = await this.octokit.git.getTree({
        owner,
        repo,
        tree_sha: 'HEAD',
        recursive: 'true',
      });

      // Filter for relevant code files
      const relevantFiles = treeResponse.data.tree
        .filter((item) => {
          if (item.type !== 'blob') return false;
          
          const path = item.path || '';
          const isRelevant = 
            path.endsWith('.tsx') ||
            path.endsWith('.jsx') ||
            path.endsWith('.ts') ||
            path.endsWith('.js') ||
            path.endsWith('.vue') ||
            path.endsWith('.svelte');
          
          // Exclude common non-component files
          const isExcluded = 
            path.includes('node_modules') ||
            path.includes('.git') ||
            path.includes('dist') ||
            path.includes('build') ||
            path.includes('coverage') ||
            path.includes('.test.') ||
            path.includes('.spec.') ||
            path.includes('__tests__') ||
            path.includes('test/') ||
            path.includes('tests/');

          return isRelevant && !isExcluded;
        })
        .slice(0, 20); // Limit to first 20 files to avoid API limits

      // Get file contents for analysis
      const files = await Promise.all(
        relevantFiles.map(async (file) => {
          try {
            const contentResponse = await this.octokit.git.getBlob({
              owner,
              repo,
              file_sha: file.sha!,
            });

            const content = Buffer.from(contentResponse.data.content, 'base64').toString('utf-8');
            
            return {
              path: file.path!,
              content,
              size: file.size || 0,
            };
          } catch (error) {
            console.error(`[CodeAgent] Error fetching file ${file.path}:`, error);
            return null;
          }
        })
      );

      return {
        files: files.filter((file) => file !== null) as Array<{
          path: string;
          content: string;
          size: number;
        }>,
      };
    } catch (error) {
      console.error('[CodeAgent] Error fetching repository structure:', error);
      throw new Error('Failed to fetch repository structure');
    }
  }

  /**
   * Analyze code files and identify extractable components using Claude 3.5
   */
  private async analyzeComponents(
    repoStructure: { files: Array<{ path: string; content: string; size: number }> },
    repoInfo: any
  ): Promise<ExtractableComponent[]> {
    try {
      // Prepare code analysis prompt
      const prompt = this.buildAnalysisPrompt(repoStructure.files, repoInfo);

      // Invoke Claude 3.5 via Bedrock
      const response = await this.invokeClaude(prompt);

      // Parse AI response to get components
      const components = this.parseComponentsResponse(response);

      return components;
    } catch (error) {
      console.error('[CodeAgent] Error analyzing components:', error);
      
      // Fallback: return basic component analysis
      return this.fallbackComponentAnalysis(repoStructure.files);
    }
  }

  /**
   * Build analysis prompt for Claude 3.5
   */
  private buildAnalysisPrompt(
    files: Array<{ path: string; content: string; size: number }>,
    repoInfo: any
  ): string {
    const fileList = files
      .map((file, idx) => {
        // Truncate very large files for analysis
        const content = file.content.length > 3000 
          ? file.content.substring(0, 3000) + '\n... (truncated)'
          : file.content;
        
        return `File ${idx + 1}: ${file.path}
\`\`\`
${content}
\`\`\``;
      })
      .join('\n\n');

    const categories = TEMPLATE_CATEGORIES.join(', ');

    return `You are an expert code analyst specializing in identifying reusable components from codebases.

Analyze this ${repoInfo.language} repository and identify extractable, reusable components that would be valuable as templates.

Repository: ${repoInfo.name}
Description: ${repoInfo.description}
Language: ${repoInfo.language}

Files to analyze:

${fileList}

For each component you identify, consider:
1. **Reusability**: Can this component be easily extracted and used in other projects?
2. **Self-contained**: Does it have minimal external dependencies?
3. **Value**: Would developers find this component useful as a template?
4. **Complexity**: How complex is the component to understand and integrate?

Available categories: ${categories}

Respond with ONLY a JSON array of components in this exact format:
[
  {
    "id": "unique_component_id",
    "name": "Component Name",
    "description": "Brief description of what this component does and its value",
    "filePath": "path/to/component/file.tsx",
    "dependencies": ["dependency1", "dependency2"],
    "category": "ui-components",
    "complexity": "simple"
  }
]

Rules:
- Only include components that are genuinely reusable and valuable
- Use descriptive names and clear descriptions
- Include all external dependencies (npm packages, other files)
- Choose appropriate category from the list above
- Complexity levels: "simple" (basic component), "moderate" (some logic/state), "complex" (advanced patterns/multiple concerns)
- Maximum 10 components to maintain quality over quantity
- Focus on components that demonstrate good patterns and practices`;
  }

  /**
   * Invoke Claude 3.5 via AWS Bedrock
   */
  private async invokeClaude(prompt: string): Promise<string> {
    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 4000,
      temperature: 0.3, // Lower temperature for more consistent analysis
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    };

    const command = new InvokeModelCommand({
      modelId: this.MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    const response = await this.bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    return responseBody.content[0].text;
  }

  /**
   * Parse AI response to extract components
   */
  private parseComponentsResponse(response: string): ExtractableComponent[] {
    try {
      // Extract JSON from response (AI might add extra text)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const components = JSON.parse(jsonMatch[0]);
      
      return components.map((comp: any, index: number) => ({
        id: comp.id || `component_${index + 1}`,
        name: comp.name || 'Unnamed Component',
        description: comp.description || 'No description provided',
        filePath: comp.filePath || '',
        dependencies: Array.isArray(comp.dependencies) ? comp.dependencies : [],
        category: TEMPLATE_CATEGORIES.includes(comp.category) 
          ? comp.category 
          : 'utilities' as TemplateCategory,
        complexity: ['simple', 'moderate', 'complex'].includes(comp.complexity)
          ? comp.complexity
          : 'moderate' as 'simple' | 'moderate' | 'complex',
      }));
    } catch (error) {
      console.error('[CodeAgent] Error parsing components response:', error);
      return [];
    }
  }

  /**
   * Fallback component analysis when AI fails
   */
  private fallbackComponentAnalysis(
    files: Array<{ path: string; content: string; size: number }>
  ): ExtractableComponent[] {
    const components: ExtractableComponent[] = [];

    files.forEach((file, index) => {
      // Simple heuristic: look for React/Vue components
      const isComponent = 
        file.content.includes('export default') ||
        file.content.includes('export const') ||
        file.content.includes('export function');

      if (isComponent && file.size > 200 && file.size < 5000) {
        const fileName = file.path.split('/').pop()?.replace(/\.(tsx?|jsx?|vue)$/, '') || 'Component';
        
        components.push({
          id: `fallback_${index + 1}`,
          name: fileName,
          description: `Extracted component from ${file.path}`,
          filePath: file.path,
          dependencies: this.extractBasicDependencies(file.content),
          category: this.guessCategory(file.path, file.content),
          complexity: file.size > 2000 ? 'complex' : file.size > 1000 ? 'moderate' : 'simple',
        });
      }
    });

    return components.slice(0, 5); // Limit fallback results
  }

  /**
   * Extract basic dependencies from code content
   */
  private extractBasicDependencies(content: string): string[] {
    const dependencies: string[] = [];
    
    // Look for import statements
    const importMatches = content.match(/import.*from ['"]([^'"]+)['"]/g);
    if (importMatches) {
      importMatches.forEach((match) => {
        const depMatch = match.match(/from ['"]([^'"]+)['"]/);
        if (depMatch?.[1] && !depMatch[1].startsWith('.')) {
          dependencies.push(depMatch[1]);
        }
      });
    }

    return [...new Set(dependencies)]; // Remove duplicates
  }

  /**
   * Guess component category based on file path and content
   */
  private guessCategory(filePath: string, content: string): TemplateCategory {
    const path = filePath.toLowerCase();
    const contentLower = content.toLowerCase();

    if (path.includes('auth') || contentLower.includes('login') || contentLower.includes('signup')) {
      return 'authentication';
    }
    if (path.includes('form') || contentLower.includes('form') || contentLower.includes('input')) {
      return 'forms';
    }
    if (path.includes('nav') || contentLower.includes('navigation') || contentLower.includes('menu')) {
      return 'navigation';
    }
    if (path.includes('layout') || contentLower.includes('layout') || contentLower.includes('container')) {
      return 'layout';
    }
    if (path.includes('hook') || contentLower.includes('usehook') || contentLower.includes('use')) {
      return 'hooks';
    }
    if (path.includes('api') || contentLower.includes('fetch') || contentLower.includes('axios')) {
      return 'api-integration';
    }
    if (contentLower.includes('chart') || contentLower.includes('graph') || contentLower.includes('visualization')) {
      return 'data-visualization';
    }

    return 'ui-components'; // Default category
  }
}