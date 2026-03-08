import { JobStatus } from '../types/job';
export declare class JobStatusUpdater {
    private dynamoClient;
    private logger;
    private jobsTableName;
    constructor();
    updateJobStatus(jobId: string, status: JobStatus, result?: any, error?: {
        message: string;
        code: string;
        details?: any;
    }): Promise<void>;
    getJobStatus(jobId: string): Promise<{
        status: JobStatus;
        result?: any;
        error?: any;
    } | null>;
}
//# sourceMappingURL=job-status-updater.d.ts.map