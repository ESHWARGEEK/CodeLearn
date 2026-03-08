import { BaseAgent } from './base-agent';
import { MentorChatJob } from '../types/job';
interface MentorResponse {
    message: string;
    suggestions: Array<{
        type: 'resource' | 'exercise' | 'concept' | 'debugging';
        title: string;
        description: string;
        action?: string;
    }>;
    followUpQuestions: string[];
    encouragement: string;
    learningPath?: {
        currentTopic: string;
        nextSteps: string[];
        estimatedTime: string;
    };
}
export declare class MentorAgent extends BaseAgent {
    private readonly modelConfig;
    processJob(job: MentorChatJob): Promise<MentorResponse>;
    private buildSystemPrompt;
    private buildUserPrompt;
    private parseMentorResponse;
    private validateMentorResponse;
}
export {};
//# sourceMappingURL=mentor-agent.d.ts.map