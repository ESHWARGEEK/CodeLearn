import { AgentOrchestrator } from './agent-orchestrator';
interface SQSPollerConfig {
    queueUrl: string;
    dlqUrl?: string;
    region: string;
    orchestrator: AgentOrchestrator;
    maxMessages?: number;
    waitTimeSeconds?: number;
    visibilityTimeoutSeconds?: number;
}
export declare class SQSPoller {
    private sqsClient;
    private config;
    private logger;
    private isPolling;
    private pollingInterval?;
    constructor(config: SQSPollerConfig);
    start(): Promise<void>;
    stop(): Promise<void>;
    private poll;
    private receiveMessages;
    private processMessage;
    private deleteMessage;
}
export {};
//# sourceMappingURL=sqs-poller.d.ts.map