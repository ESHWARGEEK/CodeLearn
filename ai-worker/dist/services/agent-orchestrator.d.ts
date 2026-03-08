import { Job, JobResult } from '../types/job';
export declare class AgentOrchestrator {
    private curatorAgent;
    private teacherAgent;
    private codeAgent;
    private mentorAgent;
    private jobStatusUpdater;
    private logger;
    constructor();
    processJob(job: Job): Promise<JobResult>;
    private shouldRetryJob;
}
//# sourceMappingURL=agent-orchestrator.d.ts.map