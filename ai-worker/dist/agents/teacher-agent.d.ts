import { BaseAgent } from './base-agent';
import { ExplainCodeJob } from '../types/job';
interface CodeExplanation {
    summary: string;
    breakdown: Array<{
        lineNumbers: string;
        code: string;
        explanation: string;
        concepts: string[];
    }>;
    keyLearnings: string[];
    nextSteps: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}
export declare class TeacherAgent extends BaseAgent {
    private readonly modelConfig;
    processJob(job: ExplainCodeJob): Promise<CodeExplanation>;
    private buildSystemPrompt;
    private buildUserPrompt;
    private parseExplanationResponse;
    private validateExplanation;
}
export {};
//# sourceMappingURL=teacher-agent.d.ts.map