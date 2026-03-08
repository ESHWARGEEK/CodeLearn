import { z } from 'zod';
export declare enum JobType {
    CURATE_LEARNING_PATH = "curate_learning_path",
    EXPLAIN_CODE = "explain_code",
    EXTRACT_TEMPLATE = "extract_template",
    INTEGRATE_CODE = "integrate_code",
    MENTOR_CHAT = "mentor_chat"
}
export declare enum JobStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    FAILED = "failed",
    RETRY = "retry"
}
export declare const BaseJobSchema: z.ZodObject<{
    jobId: z.ZodString;
    userId: z.ZodString;
    type: z.ZodNativeEnum<typeof JobType>;
    status: z.ZodNativeEnum<typeof JobStatus>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    retryCount: z.ZodDefault<z.ZodNumber>;
    maxRetries: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    jobId: string;
    userId: string;
    type: JobType;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    retryCount: number;
    maxRetries: number;
}, {
    jobId: string;
    userId: string;
    type: JobType;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    retryCount?: number | undefined;
    maxRetries?: number | undefined;
}>;
export declare const CurateLearningPathJobSchema: z.ZodObject<{
    jobId: z.ZodString;
    userId: z.ZodString;
    status: z.ZodNativeEnum<typeof JobStatus>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    retryCount: z.ZodDefault<z.ZodNumber>;
    maxRetries: z.ZodDefault<z.ZodNumber>;
} & {
    type: z.ZodLiteral<JobType.CURATE_LEARNING_PATH>;
    payload: z.ZodObject<{
        technology: z.ZodString;
        difficulty: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
        preferences: z.ZodOptional<z.ZodObject<{
            projectType: z.ZodOptional<z.ZodString>;
            timeCommitment: z.ZodOptional<z.ZodString>;
            learningGoals: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            projectType?: string | undefined;
            timeCommitment?: string | undefined;
            learningGoals?: string[] | undefined;
        }, {
            projectType?: string | undefined;
            timeCommitment?: string | undefined;
            learningGoals?: string[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        technology: string;
        difficulty: "beginner" | "intermediate" | "advanced";
        preferences?: {
            projectType?: string | undefined;
            timeCommitment?: string | undefined;
            learningGoals?: string[] | undefined;
        } | undefined;
    }, {
        technology: string;
        difficulty: "beginner" | "intermediate" | "advanced";
        preferences?: {
            projectType?: string | undefined;
            timeCommitment?: string | undefined;
            learningGoals?: string[] | undefined;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    jobId: string;
    userId: string;
    type: JobType.CURATE_LEARNING_PATH;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    retryCount: number;
    maxRetries: number;
    payload: {
        technology: string;
        difficulty: "beginner" | "intermediate" | "advanced";
        preferences?: {
            projectType?: string | undefined;
            timeCommitment?: string | undefined;
            learningGoals?: string[] | undefined;
        } | undefined;
    };
}, {
    jobId: string;
    userId: string;
    type: JobType.CURATE_LEARNING_PATH;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    payload: {
        technology: string;
        difficulty: "beginner" | "intermediate" | "advanced";
        preferences?: {
            projectType?: string | undefined;
            timeCommitment?: string | undefined;
            learningGoals?: string[] | undefined;
        } | undefined;
    };
    retryCount?: number | undefined;
    maxRetries?: number | undefined;
}>;
export declare const ExplainCodeJobSchema: z.ZodObject<{
    jobId: z.ZodString;
    userId: z.ZodString;
    status: z.ZodNativeEnum<typeof JobStatus>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    retryCount: z.ZodDefault<z.ZodNumber>;
    maxRetries: z.ZodDefault<z.ZodNumber>;
} & {
    type: z.ZodLiteral<JobType.EXPLAIN_CODE>;
    payload: z.ZodObject<{
        code: z.ZodString;
        language: z.ZodString;
        context: z.ZodOptional<z.ZodString>;
        difficulty: z.ZodOptional<z.ZodEnum<["beginner", "intermediate", "advanced"]>>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        language: string;
        difficulty?: "beginner" | "intermediate" | "advanced" | undefined;
        context?: string | undefined;
    }, {
        code: string;
        language: string;
        difficulty?: "beginner" | "intermediate" | "advanced" | undefined;
        context?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    jobId: string;
    userId: string;
    type: JobType.EXPLAIN_CODE;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    retryCount: number;
    maxRetries: number;
    payload: {
        code: string;
        language: string;
        difficulty?: "beginner" | "intermediate" | "advanced" | undefined;
        context?: string | undefined;
    };
}, {
    jobId: string;
    userId: string;
    type: JobType.EXPLAIN_CODE;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    payload: {
        code: string;
        language: string;
        difficulty?: "beginner" | "intermediate" | "advanced" | undefined;
        context?: string | undefined;
    };
    retryCount?: number | undefined;
    maxRetries?: number | undefined;
}>;
export declare const ExtractTemplateJobSchema: z.ZodObject<{
    jobId: z.ZodString;
    userId: z.ZodString;
    status: z.ZodNativeEnum<typeof JobStatus>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    retryCount: z.ZodDefault<z.ZodNumber>;
    maxRetries: z.ZodDefault<z.ZodNumber>;
} & {
    type: z.ZodLiteral<JobType.EXTRACT_TEMPLATE>;
    payload: z.ZodObject<{
        githubUrl: z.ZodString;
        extractionType: z.ZodEnum<["component", "pattern", "full"]>;
        targetFramework: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        githubUrl: string;
        extractionType: "component" | "pattern" | "full";
        targetFramework?: string | undefined;
    }, {
        githubUrl: string;
        extractionType: "component" | "pattern" | "full";
        targetFramework?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    jobId: string;
    userId: string;
    type: JobType.EXTRACT_TEMPLATE;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    retryCount: number;
    maxRetries: number;
    payload: {
        githubUrl: string;
        extractionType: "component" | "pattern" | "full";
        targetFramework?: string | undefined;
    };
}, {
    jobId: string;
    userId: string;
    type: JobType.EXTRACT_TEMPLATE;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    payload: {
        githubUrl: string;
        extractionType: "component" | "pattern" | "full";
        targetFramework?: string | undefined;
    };
    retryCount?: number | undefined;
    maxRetries?: number | undefined;
}>;
export declare const IntegrateCodeJobSchema: z.ZodObject<{
    jobId: z.ZodString;
    userId: z.ZodString;
    status: z.ZodNativeEnum<typeof JobStatus>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    retryCount: z.ZodDefault<z.ZodNumber>;
    maxRetries: z.ZodDefault<z.ZodNumber>;
} & {
    type: z.ZodLiteral<JobType.INTEGRATE_CODE>;
    payload: z.ZodObject<{
        sourceCode: z.ZodString;
        targetCode: z.ZodString;
        integrationInstructions: z.ZodString;
        framework: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        sourceCode: string;
        targetCode: string;
        integrationInstructions: string;
        framework: string;
    }, {
        sourceCode: string;
        targetCode: string;
        integrationInstructions: string;
        framework: string;
    }>;
}, "strip", z.ZodTypeAny, {
    jobId: string;
    userId: string;
    type: JobType.INTEGRATE_CODE;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    retryCount: number;
    maxRetries: number;
    payload: {
        sourceCode: string;
        targetCode: string;
        integrationInstructions: string;
        framework: string;
    };
}, {
    jobId: string;
    userId: string;
    type: JobType.INTEGRATE_CODE;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    payload: {
        sourceCode: string;
        targetCode: string;
        integrationInstructions: string;
        framework: string;
    };
    retryCount?: number | undefined;
    maxRetries?: number | undefined;
}>;
export declare const MentorChatJobSchema: z.ZodObject<{
    jobId: z.ZodString;
    userId: z.ZodString;
    status: z.ZodNativeEnum<typeof JobStatus>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    retryCount: z.ZodDefault<z.ZodNumber>;
    maxRetries: z.ZodDefault<z.ZodNumber>;
} & {
    type: z.ZodLiteral<JobType.MENTOR_CHAT>;
    payload: z.ZodObject<{
        message: z.ZodString;
        conversationHistory: z.ZodOptional<z.ZodArray<z.ZodObject<{
            role: z.ZodEnum<["user", "assistant"]>;
            content: z.ZodString;
            timestamp: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            role: "user" | "assistant";
            content: string;
            timestamp: string;
        }, {
            role: "user" | "assistant";
            content: string;
            timestamp: string;
        }>, "many">>;
        context: z.ZodOptional<z.ZodObject<{
            currentProject: z.ZodOptional<z.ZodString>;
            learningPath: z.ZodOptional<z.ZodString>;
            userLevel: z.ZodOptional<z.ZodEnum<["beginner", "intermediate", "advanced"]>>;
        }, "strip", z.ZodTypeAny, {
            currentProject?: string | undefined;
            learningPath?: string | undefined;
            userLevel?: "beginner" | "intermediate" | "advanced" | undefined;
        }, {
            currentProject?: string | undefined;
            learningPath?: string | undefined;
            userLevel?: "beginner" | "intermediate" | "advanced" | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        context?: {
            currentProject?: string | undefined;
            learningPath?: string | undefined;
            userLevel?: "beginner" | "intermediate" | "advanced" | undefined;
        } | undefined;
        conversationHistory?: {
            role: "user" | "assistant";
            content: string;
            timestamp: string;
        }[] | undefined;
    }, {
        message: string;
        context?: {
            currentProject?: string | undefined;
            learningPath?: string | undefined;
            userLevel?: "beginner" | "intermediate" | "advanced" | undefined;
        } | undefined;
        conversationHistory?: {
            role: "user" | "assistant";
            content: string;
            timestamp: string;
        }[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    jobId: string;
    userId: string;
    type: JobType.MENTOR_CHAT;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    retryCount: number;
    maxRetries: number;
    payload: {
        message: string;
        context?: {
            currentProject?: string | undefined;
            learningPath?: string | undefined;
            userLevel?: "beginner" | "intermediate" | "advanced" | undefined;
        } | undefined;
        conversationHistory?: {
            role: "user" | "assistant";
            content: string;
            timestamp: string;
        }[] | undefined;
    };
}, {
    jobId: string;
    userId: string;
    type: JobType.MENTOR_CHAT;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    payload: {
        message: string;
        context?: {
            currentProject?: string | undefined;
            learningPath?: string | undefined;
            userLevel?: "beginner" | "intermediate" | "advanced" | undefined;
        } | undefined;
        conversationHistory?: {
            role: "user" | "assistant";
            content: string;
            timestamp: string;
        }[] | undefined;
    };
    retryCount?: number | undefined;
    maxRetries?: number | undefined;
}>;
export declare const JobSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    jobId: z.ZodString;
    userId: z.ZodString;
    status: z.ZodNativeEnum<typeof JobStatus>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    retryCount: z.ZodDefault<z.ZodNumber>;
    maxRetries: z.ZodDefault<z.ZodNumber>;
} & {
    type: z.ZodLiteral<JobType.CURATE_LEARNING_PATH>;
    payload: z.ZodObject<{
        technology: z.ZodString;
        difficulty: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
        preferences: z.ZodOptional<z.ZodObject<{
            projectType: z.ZodOptional<z.ZodString>;
            timeCommitment: z.ZodOptional<z.ZodString>;
            learningGoals: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            projectType?: string | undefined;
            timeCommitment?: string | undefined;
            learningGoals?: string[] | undefined;
        }, {
            projectType?: string | undefined;
            timeCommitment?: string | undefined;
            learningGoals?: string[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        technology: string;
        difficulty: "beginner" | "intermediate" | "advanced";
        preferences?: {
            projectType?: string | undefined;
            timeCommitment?: string | undefined;
            learningGoals?: string[] | undefined;
        } | undefined;
    }, {
        technology: string;
        difficulty: "beginner" | "intermediate" | "advanced";
        preferences?: {
            projectType?: string | undefined;
            timeCommitment?: string | undefined;
            learningGoals?: string[] | undefined;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    jobId: string;
    userId: string;
    type: JobType.CURATE_LEARNING_PATH;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    retryCount: number;
    maxRetries: number;
    payload: {
        technology: string;
        difficulty: "beginner" | "intermediate" | "advanced";
        preferences?: {
            projectType?: string | undefined;
            timeCommitment?: string | undefined;
            learningGoals?: string[] | undefined;
        } | undefined;
    };
}, {
    jobId: string;
    userId: string;
    type: JobType.CURATE_LEARNING_PATH;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    payload: {
        technology: string;
        difficulty: "beginner" | "intermediate" | "advanced";
        preferences?: {
            projectType?: string | undefined;
            timeCommitment?: string | undefined;
            learningGoals?: string[] | undefined;
        } | undefined;
    };
    retryCount?: number | undefined;
    maxRetries?: number | undefined;
}>, z.ZodObject<{
    jobId: z.ZodString;
    userId: z.ZodString;
    status: z.ZodNativeEnum<typeof JobStatus>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    retryCount: z.ZodDefault<z.ZodNumber>;
    maxRetries: z.ZodDefault<z.ZodNumber>;
} & {
    type: z.ZodLiteral<JobType.EXPLAIN_CODE>;
    payload: z.ZodObject<{
        code: z.ZodString;
        language: z.ZodString;
        context: z.ZodOptional<z.ZodString>;
        difficulty: z.ZodOptional<z.ZodEnum<["beginner", "intermediate", "advanced"]>>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        language: string;
        difficulty?: "beginner" | "intermediate" | "advanced" | undefined;
        context?: string | undefined;
    }, {
        code: string;
        language: string;
        difficulty?: "beginner" | "intermediate" | "advanced" | undefined;
        context?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    jobId: string;
    userId: string;
    type: JobType.EXPLAIN_CODE;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    retryCount: number;
    maxRetries: number;
    payload: {
        code: string;
        language: string;
        difficulty?: "beginner" | "intermediate" | "advanced" | undefined;
        context?: string | undefined;
    };
}, {
    jobId: string;
    userId: string;
    type: JobType.EXPLAIN_CODE;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    payload: {
        code: string;
        language: string;
        difficulty?: "beginner" | "intermediate" | "advanced" | undefined;
        context?: string | undefined;
    };
    retryCount?: number | undefined;
    maxRetries?: number | undefined;
}>, z.ZodObject<{
    jobId: z.ZodString;
    userId: z.ZodString;
    status: z.ZodNativeEnum<typeof JobStatus>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    retryCount: z.ZodDefault<z.ZodNumber>;
    maxRetries: z.ZodDefault<z.ZodNumber>;
} & {
    type: z.ZodLiteral<JobType.EXTRACT_TEMPLATE>;
    payload: z.ZodObject<{
        githubUrl: z.ZodString;
        extractionType: z.ZodEnum<["component", "pattern", "full"]>;
        targetFramework: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        githubUrl: string;
        extractionType: "component" | "pattern" | "full";
        targetFramework?: string | undefined;
    }, {
        githubUrl: string;
        extractionType: "component" | "pattern" | "full";
        targetFramework?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    jobId: string;
    userId: string;
    type: JobType.EXTRACT_TEMPLATE;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    retryCount: number;
    maxRetries: number;
    payload: {
        githubUrl: string;
        extractionType: "component" | "pattern" | "full";
        targetFramework?: string | undefined;
    };
}, {
    jobId: string;
    userId: string;
    type: JobType.EXTRACT_TEMPLATE;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    payload: {
        githubUrl: string;
        extractionType: "component" | "pattern" | "full";
        targetFramework?: string | undefined;
    };
    retryCount?: number | undefined;
    maxRetries?: number | undefined;
}>, z.ZodObject<{
    jobId: z.ZodString;
    userId: z.ZodString;
    status: z.ZodNativeEnum<typeof JobStatus>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    retryCount: z.ZodDefault<z.ZodNumber>;
    maxRetries: z.ZodDefault<z.ZodNumber>;
} & {
    type: z.ZodLiteral<JobType.INTEGRATE_CODE>;
    payload: z.ZodObject<{
        sourceCode: z.ZodString;
        targetCode: z.ZodString;
        integrationInstructions: z.ZodString;
        framework: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        sourceCode: string;
        targetCode: string;
        integrationInstructions: string;
        framework: string;
    }, {
        sourceCode: string;
        targetCode: string;
        integrationInstructions: string;
        framework: string;
    }>;
}, "strip", z.ZodTypeAny, {
    jobId: string;
    userId: string;
    type: JobType.INTEGRATE_CODE;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    retryCount: number;
    maxRetries: number;
    payload: {
        sourceCode: string;
        targetCode: string;
        integrationInstructions: string;
        framework: string;
    };
}, {
    jobId: string;
    userId: string;
    type: JobType.INTEGRATE_CODE;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    payload: {
        sourceCode: string;
        targetCode: string;
        integrationInstructions: string;
        framework: string;
    };
    retryCount?: number | undefined;
    maxRetries?: number | undefined;
}>, z.ZodObject<{
    jobId: z.ZodString;
    userId: z.ZodString;
    status: z.ZodNativeEnum<typeof JobStatus>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    retryCount: z.ZodDefault<z.ZodNumber>;
    maxRetries: z.ZodDefault<z.ZodNumber>;
} & {
    type: z.ZodLiteral<JobType.MENTOR_CHAT>;
    payload: z.ZodObject<{
        message: z.ZodString;
        conversationHistory: z.ZodOptional<z.ZodArray<z.ZodObject<{
            role: z.ZodEnum<["user", "assistant"]>;
            content: z.ZodString;
            timestamp: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            role: "user" | "assistant";
            content: string;
            timestamp: string;
        }, {
            role: "user" | "assistant";
            content: string;
            timestamp: string;
        }>, "many">>;
        context: z.ZodOptional<z.ZodObject<{
            currentProject: z.ZodOptional<z.ZodString>;
            learningPath: z.ZodOptional<z.ZodString>;
            userLevel: z.ZodOptional<z.ZodEnum<["beginner", "intermediate", "advanced"]>>;
        }, "strip", z.ZodTypeAny, {
            currentProject?: string | undefined;
            learningPath?: string | undefined;
            userLevel?: "beginner" | "intermediate" | "advanced" | undefined;
        }, {
            currentProject?: string | undefined;
            learningPath?: string | undefined;
            userLevel?: "beginner" | "intermediate" | "advanced" | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        context?: {
            currentProject?: string | undefined;
            learningPath?: string | undefined;
            userLevel?: "beginner" | "intermediate" | "advanced" | undefined;
        } | undefined;
        conversationHistory?: {
            role: "user" | "assistant";
            content: string;
            timestamp: string;
        }[] | undefined;
    }, {
        message: string;
        context?: {
            currentProject?: string | undefined;
            learningPath?: string | undefined;
            userLevel?: "beginner" | "intermediate" | "advanced" | undefined;
        } | undefined;
        conversationHistory?: {
            role: "user" | "assistant";
            content: string;
            timestamp: string;
        }[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    jobId: string;
    userId: string;
    type: JobType.MENTOR_CHAT;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    retryCount: number;
    maxRetries: number;
    payload: {
        message: string;
        context?: {
            currentProject?: string | undefined;
            learningPath?: string | undefined;
            userLevel?: "beginner" | "intermediate" | "advanced" | undefined;
        } | undefined;
        conversationHistory?: {
            role: "user" | "assistant";
            content: string;
            timestamp: string;
        }[] | undefined;
    };
}, {
    jobId: string;
    userId: string;
    type: JobType.MENTOR_CHAT;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    payload: {
        message: string;
        context?: {
            currentProject?: string | undefined;
            learningPath?: string | undefined;
            userLevel?: "beginner" | "intermediate" | "advanced" | undefined;
        } | undefined;
        conversationHistory?: {
            role: "user" | "assistant";
            content: string;
            timestamp: string;
        }[] | undefined;
    };
    retryCount?: number | undefined;
    maxRetries?: number | undefined;
}>]>;
export type BaseJob = z.infer<typeof BaseJobSchema>;
export type CurateLearningPathJob = z.infer<typeof CurateLearningPathJobSchema>;
export type ExplainCodeJob = z.infer<typeof ExplainCodeJobSchema>;
export type ExtractTemplateJob = z.infer<typeof ExtractTemplateJobSchema>;
export type IntegrateCodeJob = z.infer<typeof IntegrateCodeJobSchema>;
export type MentorChatJob = z.infer<typeof MentorChatJobSchema>;
export type Job = z.infer<typeof JobSchema>;
export declare const JobResultSchema: z.ZodObject<{
    jobId: z.ZodString;
    status: z.ZodNativeEnum<typeof JobStatus>;
    result: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodObject<{
        message: z.ZodString;
        code: z.ZodString;
        details: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        details?: any;
    }, {
        code: string;
        message: string;
        details?: any;
    }>>;
    completedAt: z.ZodOptional<z.ZodString>;
    processingTimeMs: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    jobId: string;
    status: JobStatus;
    result?: any;
    error?: {
        code: string;
        message: string;
        details?: any;
    } | undefined;
    completedAt?: string | undefined;
    processingTimeMs?: number | undefined;
}, {
    jobId: string;
    status: JobStatus;
    result?: any;
    error?: {
        code: string;
        message: string;
        details?: any;
    } | undefined;
    completedAt?: string | undefined;
    processingTimeMs?: number | undefined;
}>;
export type JobResult = z.infer<typeof JobResultSchema>;
//# sourceMappingURL=job.d.ts.map