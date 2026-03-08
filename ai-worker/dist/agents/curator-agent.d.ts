import { BaseAgent } from './base-agent';
import { CurateLearningPathJob } from '../types/job';
interface LearningPath {
    name: string;
    description: string;
    estimatedHours: number;
    githubUrl: string;
    tasks: Array<{
        id: string;
        title: string;
        description: string;
        order: number;
        estimatedMinutes: number;
        hints: string[];
        completed: boolean;
    }>;
}
export declare class CuratorAgent extends BaseAgent {
    private readonly modelConfig;
    processJob(job: CurateLearningPathJob): Promise<LearningPath>;
    private buildSystemPrompt;
    private buildUserPrompt;
    private parseLearningPathResponse;
    private validateLearningPath;
}
export {};
//# sourceMappingURL=curator-agent.d.ts.map