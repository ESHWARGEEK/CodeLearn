"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentOrchestrator = void 0;
const job_1 = require("../types/job");
const curator_agent_1 = require("../agents/curator-agent");
const teacher_agent_1 = require("../agents/teacher-agent");
const code_agent_1 = require("../agents/code-agent");
const mentor_agent_1 = require("../agents/mentor-agent");
const job_status_updater_1 = require("./job-status-updater");
const logger_1 = require("../utils/logger");
class AgentOrchestrator {
    constructor() {
        this.logger = logger_1.Logger.getInstance();
        this.curatorAgent = new curator_agent_1.CuratorAgent();
        this.teacherAgent = new teacher_agent_1.TeacherAgent();
        this.codeAgent = new code_agent_1.CodeAgent();
        this.mentorAgent = new mentor_agent_1.MentorAgent();
        this.jobStatusUpdater = new job_status_updater_1.JobStatusUpdater();
    }
    async processJob(job) {
        const startTime = Date.now();
        try {
            this.logger.info('Starting job processing', {
                jobId: job.jobId,
                type: job.type,
                userId: job.userId,
            });
            await this.jobStatusUpdater.updateJobStatus(job.jobId, job_1.JobStatus.IN_PROGRESS);
            let result;
            switch (job.type) {
                case job_1.JobType.CURATE_LEARNING_PATH:
                    result = await this.curatorAgent.processJob(job);
                    break;
                case job_1.JobType.EXPLAIN_CODE:
                    result = await this.teacherAgent.processJob(job);
                    break;
                case job_1.JobType.EXTRACT_TEMPLATE:
                    result = await this.codeAgent.processExtractTemplateJob(job);
                    break;
                case job_1.JobType.INTEGRATE_CODE:
                    result = await this.codeAgent.processIntegrateCodeJob(job);
                    break;
                case job_1.JobType.MENTOR_CHAT:
                    result = await this.mentorAgent.processJob(job);
                    break;
                default:
                    throw new Error(`Unknown job type: ${job.type}`);
            }
            const processingTimeMs = Date.now() - startTime;
            await this.jobStatusUpdater.updateJobStatus(job.jobId, job_1.JobStatus.COMPLETED, result);
            const jobResult = {
                jobId: job.jobId,
                status: job_1.JobStatus.COMPLETED,
                result,
                completedAt: new Date().toISOString(),
                processingTimeMs,
            };
            this.logger.info('Job completed successfully', {
                jobId: job.jobId,
                type: job.type,
                processingTimeMs,
            });
            return jobResult;
        }
        catch (error) {
            const processingTimeMs = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('Job processing failed', {
                jobId: job.jobId,
                type: job.type,
                error: errorMessage,
                processingTimeMs,
            });
            const shouldRetry = this.shouldRetryJob(job, error);
            const newStatus = shouldRetry ? job_1.JobStatus.RETRY : job_1.JobStatus.FAILED;
            await this.jobStatusUpdater.updateJobStatus(job.jobId, newStatus, null, {
                message: errorMessage,
                code: 'PROCESSING_ERROR',
                details: error instanceof Error ? error.stack : undefined,
            });
            const jobResult = {
                jobId: job.jobId,
                status: newStatus,
                error: {
                    message: errorMessage,
                    code: 'PROCESSING_ERROR',
                    details: error instanceof Error ? error.stack : undefined,
                },
                processingTimeMs,
            };
            return jobResult;
        }
    }
    shouldRetryJob(job, error) {
        if (job.retryCount >= job.maxRetries) {
            return false;
        }
        if (error instanceof Error && error.message.includes('validation')) {
            return false;
        }
        if (error instanceof Error && error.message.includes('authentication')) {
            return false;
        }
        const retryableErrors = [
            'timeout',
            'network',
            'rate limit',
            'service unavailable',
            'internal server error',
        ];
        const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
        return retryableErrors.some(retryableError => errorMessage.includes(retryableError));
    }
}
exports.AgentOrchestrator = AgentOrchestrator;
//# sourceMappingURL=agent-orchestrator.js.map