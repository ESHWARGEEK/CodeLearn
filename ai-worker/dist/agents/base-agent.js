"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAgent = void 0;
const client_bedrock_runtime_1 = require("@aws-sdk/client-bedrock-runtime");
const logger_1 = require("../utils/logger");
class BaseAgent {
    constructor() {
        this.logger = logger_1.Logger.getInstance();
        this.bedrockClient = new client_bedrock_runtime_1.BedrockRuntimeClient({
            region: process.env.AWS_REGION || 'us-east-1',
        });
    }
    async invokeModel(prompt, config, systemPrompt) {
        try {
            this.logger.debug('Invoking AI model', {
                modelId: config.modelId,
                promptLength: prompt.length,
                hasSystemPrompt: !!systemPrompt,
            });
            let requestBody;
            if (config.modelId.includes('claude')) {
                const messages = [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ];
                requestBody = {
                    anthropic_version: 'bedrock-2023-05-31',
                    max_tokens: config.maxTokens,
                    temperature: config.temperature,
                    top_p: config.topP || 0.9,
                    messages,
                };
                if (systemPrompt) {
                    requestBody.system = systemPrompt;
                }
            }
            else if (config.modelId.includes('llama')) {
                let fullPrompt = prompt;
                if (systemPrompt) {
                    fullPrompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n${prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;
                }
                requestBody = {
                    prompt: fullPrompt,
                    max_gen_len: config.maxTokens,
                    temperature: config.temperature,
                    top_p: config.topP || 0.9,
                };
            }
            else {
                throw new Error(`Unsupported model: ${config.modelId}`);
            }
            const command = new client_bedrock_runtime_1.InvokeModelCommand({
                modelId: config.modelId,
                contentType: 'application/json',
                accept: 'application/json',
                body: JSON.stringify(requestBody),
            });
            const response = await this.bedrockClient.send(command);
            if (!response.body) {
                throw new Error('Empty response from model');
            }
            const responseBody = JSON.parse(new TextDecoder().decode(response.body));
            let content;
            if (config.modelId.includes('claude')) {
                content = responseBody.content[0].text;
            }
            else if (config.modelId.includes('llama')) {
                content = responseBody.generation;
            }
            else {
                throw new Error(`Unknown response format for model: ${config.modelId}`);
            }
            this.logger.debug('Model invocation successful', {
                modelId: config.modelId,
                responseLength: content.length,
            });
            return content;
        }
        catch (error) {
            this.logger.error('Model invocation failed', {
                modelId: config.modelId,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }
    async retryWithBackoff(operation, maxRetries = 3, baseDelayMs = 1000) {
        let lastError;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                if (attempt === maxRetries) {
                    break;
                }
                const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000;
                this.logger.warn(`Operation failed, retrying in ${delay}ms`, {
                    attempt: attempt + 1,
                    maxRetries,
                    error: lastError.message,
                });
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw lastError;
    }
}
exports.BaseAgent = BaseAgent;
//# sourceMappingURL=base-agent.js.map