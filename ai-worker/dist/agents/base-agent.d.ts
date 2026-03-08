import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
export interface ModelConfig {
    modelId: string;
    maxTokens: number;
    temperature: number;
    topP?: number;
}
export declare abstract class BaseAgent {
    protected bedrockClient: BedrockRuntimeClient;
    protected logger: import("winston").Logger;
    constructor();
    protected invokeModel(prompt: string, config: ModelConfig, systemPrompt?: string): Promise<string>;
    protected retryWithBackoff<T>(operation: () => Promise<T>, maxRetries?: number, baseDelayMs?: number): Promise<T>;
}
//# sourceMappingURL=base-agent.d.ts.map