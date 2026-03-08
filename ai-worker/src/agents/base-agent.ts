import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { Logger } from '../utils/logger';

export interface ModelConfig {
  modelId: string;
  maxTokens: number;
  temperature: number;
  topP?: number;
}

export abstract class BaseAgent {
  protected bedrockClient: BedrockRuntimeClient;
  protected logger = Logger.getInstance();

  constructor() {
    this.bedrockClient = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  protected async invokeModel(
    prompt: string,
    config: ModelConfig,
    systemPrompt?: string
  ): Promise<string> {
    try {
      this.logger.debug('Invoking AI model', {
        modelId: config.modelId,
        promptLength: prompt.length,
        hasSystemPrompt: !!systemPrompt,
      });

      let requestBody: any;

      // Format request based on model type
      if (config.modelId.includes('claude')) {
        // Anthropic Claude format
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
      } else if (config.modelId.includes('llama')) {
        // Meta Llama format
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
      } else {
        throw new Error(`Unsupported model: ${config.modelId}`);
      }

      const command = new InvokeModelCommand({
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
      
      let content: string;
      
      if (config.modelId.includes('claude')) {
        content = responseBody.content[0].text;
      } else if (config.modelId.includes('llama')) {
        content = responseBody.generation;
      } else {
        throw new Error(`Unknown response format for model: ${config.modelId}`);
      }

      this.logger.debug('Model invocation successful', {
        modelId: config.modelId,
        responseLength: content.length,
      });

      return content;

    } catch (error) {
      this.logger.error('Model invocation failed', {
        modelId: config.modelId,
        error: error instanceof Error ? error.message : String(error),
      });
      
      throw error;
    }
  }

  protected async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelayMs: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff with jitter
        const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000;
        
        this.logger.warn(`Operation failed, retrying in ${delay}ms`, {
          attempt: attempt + 1,
          maxRetries,
          error: lastError.message,
        });

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }
}