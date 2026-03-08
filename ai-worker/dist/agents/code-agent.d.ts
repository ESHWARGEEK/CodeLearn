import { BaseAgent } from './base-agent';
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
export declare class CodeAgent extends BaseAgent {
    private readonly modelConfig;
    processExtractTemplateJob(job: ExtractTemplateJob): Promise<TemplateExtraction>;
    processIntegrateCodeJob(job: IntegrateCodeJob): Promise<CodeIntegration>;
    private fetchGitHubContent;
    private buildExtractionSystemPrompt;
    private buildExtractionUserPrompt;
    private buildIntegrationSystemPrompt;
    private buildIntegrationUserPrompt;
    private parseExtractionResponse;
    private parseIntegrationResponse;
    private validateExtraction;
    private validateIntegration;
}
export {};
//# sourceMappingURL=code-agent.d.ts.map