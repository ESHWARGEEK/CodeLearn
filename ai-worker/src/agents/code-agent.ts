import { BaseAgent, ModelConfig } from './base-agent';
import { ExtractTemplateJob, IntegrateCodeJob } from '../types/job';

interface TemplateExtraction {
  components: Array<{
    name: string;
    type: 'component' | 'hook' | 'utility' | 'style';
    description: string;
    code: string;
    dependencies: string[];
    usage: string;
  }>;
  patterns: Array<{
    name: string;
    description: string;
    example: string;
    benefits: string[];
  }>;
  recommendations: string[];
}

interface CodeIntegration {
  integratedCode: string;
  changes: Array<{
    type: 'addition' | 'modification' | 'deletion';
    location: string;
    description: string;
    code: string;
  }>;
  explanation: string;
  testingSuggestions: string[];
  potentialIssues: string[];
}

export class CodeAgent extends BaseAgent {
  private readonly modelConfig: ModelConfig = {
    modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    maxTokens: 4000,
    temperature: 0.2,
    topP: 0.9,
  };

  async processExtractTemplateJob(job: ExtractTemplateJob): Promise<TemplateExtraction> {
    this.logger.info('Processing template extraction job', {
      jobId: job.jobId,
      githubUrl: job.payload.githubUrl,
      extractionType: job.payload.extractionType,
    });

    // Note: In a real implementation, you would fetch the GitHub repository content
    // For now, we'll simulate this with a placeholder
    const repoContent = await this.fetchGitHubContent(job.payload.githubUrl);

    const systemPrompt = this.buildExtractionSystemPrompt();
    const userPrompt = this.buildExtractionUserPrompt(job.payload, repoContent);

    const response = await this.retryWithBackoff(async () => {
      return await this.invokeModel(userPrompt, this.modelConfig, systemPrompt);
    });

    const extraction = this.parseExtractionResponse(response);
    this.validateExtraction(extraction);

    this.logger.info('Template extraction completed', {
      jobId: job.jobId,
      componentCount: extraction.components.length,
      patternCount: extraction.patterns.length,
    });

    return extraction;
  }

  async processIntegrateCodeJob(job: IntegrateCodeJob): Promise<CodeIntegration> {
    this.logger.info('Processing code integration job', {
      jobId: job.jobId,
      framework: job.payload.framework,
      sourceCodeLength: job.payload.sourceCode.length,
      targetCodeLength: job.payload.targetCode.length,
    });

    const systemPrompt = this.buildIntegrationSystemPrompt();
    const userPrompt = this.buildIntegrationUserPrompt(job.payload);

    const response = await this.retryWithBackoff(async () => {
      return await this.invokeModel(userPrompt, this.modelConfig, systemPrompt);
    });

    const integration = this.parseIntegrationResponse(response);
    this.validateIntegration(integration);

    this.logger.info('Code integration completed', {
      jobId: job.jobId,
      changeCount: integration.changes.length,
      integratedCodeLength: integration.integratedCode.length,
    });

    return integration;
  }

  private async fetchGitHubContent(githubUrl: string): Promise<string> {
    // Placeholder implementation
    // In a real implementation, you would use GitHub API or git clone
    this.logger.info('Fetching GitHub content', { githubUrl });
    
    return `// Placeholder GitHub content for ${githubUrl}
// This would contain the actual repository files
export const ExampleComponent = () => {
  return <div>Example component</div>;
};`;
  }

  private buildExtractionSystemPrompt(): string {
    return `You are an expert code analyst specializing in extracting reusable components and patterns from codebases. Your analysis focuses on:

1. Identifying well-structured, reusable components
2. Recognizing common design patterns and architectural decisions
3. Understanding dependencies and integration requirements
4. Providing clear usage examples and documentation
5. Suggesting best practices and improvements

Always respond with valid JSON in the exact format specified. Focus on extracting the most valuable and reusable parts of the codebase.`;
  }

  private buildExtractionUserPrompt(payload: any, repoContent: string): string {
    const { extractionType, targetFramework } = payload;

    let prompt = `Analyze this codebase and extract reusable ${extractionType}s:

${repoContent}

Extraction type: ${extractionType}`;

    if (targetFramework) {
      prompt += `\nTarget framework: ${targetFramework}`;
    }

    prompt += `

Respond with a JSON object in this exact format:
{
  "components": [
    {
      "name": "ComponentName",
      "type": "component",
      "description": "What this component does and when to use it",
      "code": "// Complete component code",
      "dependencies": ["react", "styled-components"],
      "usage": "// Example of how to use this component"
    }
  ],
  "patterns": [
    {
      "name": "Pattern Name",
      "description": "Description of the pattern and its benefits",
      "example": "// Code example showing the pattern",
      "benefits": ["Benefit 1", "Benefit 2"]
    }
  ],
  "recommendations": [
    "Suggestion for improving or using the extracted code",
    "Best practice recommendation"
  ]
}

Requirements:
- Extract 3-8 of the most valuable components/utilities
- Identify 2-5 important patterns or architectural decisions
- Provide complete, working code for each component
- Include clear usage examples
- List all dependencies accurately
- Provide 3-5 actionable recommendations`;

    return prompt;
  }

  private buildIntegrationSystemPrompt(): string {
    return `You are an expert software engineer specializing in code integration and refactoring. Your integration approach:

1. Maintains code quality and follows best practices
2. Preserves existing functionality while adding new features
3. Identifies potential conflicts and provides solutions
4. Suggests comprehensive testing strategies
5. Documents all changes clearly

Always respond with valid JSON in the exact format specified. Ensure the integrated code is production-ready and well-documented.`;
  }

  private buildIntegrationUserPrompt(payload: any): string {
    const { sourceCode, targetCode, integrationInstructions, framework } = payload;

    const prompt = `Integrate the source code into the target codebase following these instructions:

**Integration Instructions:**
${integrationInstructions}

**Framework:** ${framework}

**Source Code to Integrate:**
\`\`\`
${sourceCode}
\`\`\`

**Target Codebase:**
\`\`\`
${targetCode}
\`\`\`

Respond with a JSON object in this exact format:
{
  "integratedCode": "// Complete integrated code",
  "changes": [
    {
      "type": "addition",
      "location": "Line 15-20",
      "description": "Added new function for handling user input",
      "code": "// The specific code that was added"
    }
  ],
  "explanation": "Detailed explanation of how the integration was performed and why",
  "testingSuggestions": [
    "Test case 1: Verify new functionality works",
    "Test case 2: Ensure existing features still work"
  ],
  "potentialIssues": [
    "Potential issue 1 and how to address it",
    "Potential issue 2 and mitigation strategy"
  ]
}

Requirements:
- Provide complete, working integrated code
- Document all changes with clear descriptions
- Explain the integration approach and reasoning
- Suggest comprehensive testing strategies
- Identify potential issues and solutions
- Maintain code quality and consistency`;

    return prompt;
  }

  private parseExtractionResponse(response: string): TemplateExtraction {
    try {
      const cleanResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleanResponse);
      
      if (!parsed.components || !Array.isArray(parsed.components)) {
        throw new Error('Invalid extraction structure - missing components');
      }

      return parsed as TemplateExtraction;
    } catch (error) {
      this.logger.error('Failed to parse extraction response', {
        error: error instanceof Error ? error.message : String(error),
        responseLength: response.length,
      });
      
      throw new Error('Failed to parse AI response into valid extraction');
    }
  }

  private parseIntegrationResponse(response: string): CodeIntegration {
    try {
      const cleanResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleanResponse);
      
      if (!parsed.integratedCode || !parsed.changes || !Array.isArray(parsed.changes)) {
        throw new Error('Invalid integration structure');
      }

      return parsed as CodeIntegration;
    } catch (error) {
      this.logger.error('Failed to parse integration response', {
        error: error instanceof Error ? error.message : String(error),
        responseLength: response.length,
      });
      
      throw new Error('Failed to parse AI response into valid integration');
    }
  }

  private validateExtraction(extraction: TemplateExtraction): void {
    if (!extraction.components || extraction.components.length < 1) {
      throw new Error('Extraction must have at least one component');
    }

    for (const component of extraction.components) {
      if (!component.name || !component.code || !component.description) {
        throw new Error('Component missing required fields');
      }
    }

    this.logger.debug('Template extraction validation passed', {
      componentCount: extraction.components.length,
      patternCount: extraction.patterns?.length || 0,
    });
  }

  private validateIntegration(integration: CodeIntegration): void {
    if (!integration.integratedCode || integration.integratedCode.length < 10) {
      throw new Error('Integrated code is too short');
    }

    if (!integration.changes || integration.changes.length < 1) {
      throw new Error('Integration must have at least one change');
    }

    if (!integration.explanation || integration.explanation.length < 20) {
      throw new Error('Integration explanation is too short');
    }

    this.logger.debug('Code integration validation passed', {
      integratedCodeLength: integration.integratedCode.length,
      changeCount: integration.changes.length,
    });
  }
}