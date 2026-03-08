"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobResultSchema = exports.JobSchema = exports.MentorChatJobSchema = exports.IntegrateCodeJobSchema = exports.ExtractTemplateJobSchema = exports.ExplainCodeJobSchema = exports.CurateLearningPathJobSchema = exports.BaseJobSchema = exports.JobStatus = exports.JobType = void 0;
const zod_1 = require("zod");
var JobType;
(function (JobType) {
    JobType["CURATE_LEARNING_PATH"] = "curate_learning_path";
    JobType["EXPLAIN_CODE"] = "explain_code";
    JobType["EXTRACT_TEMPLATE"] = "extract_template";
    JobType["INTEGRATE_CODE"] = "integrate_code";
    JobType["MENTOR_CHAT"] = "mentor_chat";
})(JobType || (exports.JobType = JobType = {}));
var JobStatus;
(function (JobStatus) {
    JobStatus["PENDING"] = "pending";
    JobStatus["IN_PROGRESS"] = "in_progress";
    JobStatus["COMPLETED"] = "completed";
    JobStatus["FAILED"] = "failed";
    JobStatus["RETRY"] = "retry";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
exports.BaseJobSchema = zod_1.z.object({
    jobId: zod_1.z.string(),
    userId: zod_1.z.string(),
    type: zod_1.z.nativeEnum(JobType),
    status: zod_1.z.nativeEnum(JobStatus),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
    retryCount: zod_1.z.number().default(0),
    maxRetries: zod_1.z.number().default(3),
});
exports.CurateLearningPathJobSchema = exports.BaseJobSchema.extend({
    type: zod_1.z.literal(JobType.CURATE_LEARNING_PATH),
    payload: zod_1.z.object({
        technology: zod_1.z.string(),
        difficulty: zod_1.z.enum(['beginner', 'intermediate', 'advanced']),
        preferences: zod_1.z.object({
            projectType: zod_1.z.string().optional(),
            timeCommitment: zod_1.z.string().optional(),
            learningGoals: zod_1.z.array(zod_1.z.string()).optional(),
        }).optional(),
    }),
});
exports.ExplainCodeJobSchema = exports.BaseJobSchema.extend({
    type: zod_1.z.literal(JobType.EXPLAIN_CODE),
    payload: zod_1.z.object({
        code: zod_1.z.string(),
        language: zod_1.z.string(),
        context: zod_1.z.string().optional(),
        difficulty: zod_1.z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    }),
});
exports.ExtractTemplateJobSchema = exports.BaseJobSchema.extend({
    type: zod_1.z.literal(JobType.EXTRACT_TEMPLATE),
    payload: zod_1.z.object({
        githubUrl: zod_1.z.string().url(),
        extractionType: zod_1.z.enum(['component', 'pattern', 'full']),
        targetFramework: zod_1.z.string().optional(),
    }),
});
exports.IntegrateCodeJobSchema = exports.BaseJobSchema.extend({
    type: zod_1.z.literal(JobType.INTEGRATE_CODE),
    payload: zod_1.z.object({
        sourceCode: zod_1.z.string(),
        targetCode: zod_1.z.string(),
        integrationInstructions: zod_1.z.string(),
        framework: zod_1.z.string(),
    }),
});
exports.MentorChatJobSchema = exports.BaseJobSchema.extend({
    type: zod_1.z.literal(JobType.MENTOR_CHAT),
    payload: zod_1.z.object({
        message: zod_1.z.string(),
        conversationHistory: zod_1.z.array(zod_1.z.object({
            role: zod_1.z.enum(['user', 'assistant']),
            content: zod_1.z.string(),
            timestamp: zod_1.z.string(),
        })).optional(),
        context: zod_1.z.object({
            currentProject: zod_1.z.string().optional(),
            learningPath: zod_1.z.string().optional(),
            userLevel: zod_1.z.enum(['beginner', 'intermediate', 'advanced']).optional(),
        }).optional(),
    }),
});
exports.JobSchema = zod_1.z.discriminatedUnion('type', [
    exports.CurateLearningPathJobSchema,
    exports.ExplainCodeJobSchema,
    exports.ExtractTemplateJobSchema,
    exports.IntegrateCodeJobSchema,
    exports.MentorChatJobSchema,
]);
exports.JobResultSchema = zod_1.z.object({
    jobId: zod_1.z.string(),
    status: zod_1.z.nativeEnum(JobStatus),
    result: zod_1.z.any().optional(),
    error: zod_1.z.object({
        message: zod_1.z.string(),
        code: zod_1.z.string(),
        details: zod_1.z.any().optional(),
    }).optional(),
    completedAt: zod_1.z.string().optional(),
    processingTimeMs: zod_1.z.number().optional(),
});
//# sourceMappingURL=job.js.map