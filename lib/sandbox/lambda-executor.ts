/**
 * Lambda Executor Utility
 * 
 * Invokes the sandbox executor Lambda function for quick code execution
 */

import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

// Allow dependency injection for testing
let lambdaClientInstance: LambdaClient | null = null;

export function getLambdaClient(): LambdaClient {
  if (!lambdaClientInstance) {
    lambdaClientInstance = new LambdaClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }
  return lambdaClientInstance;
}

// For testing purposes
export function setLambdaClient(client: LambdaClient | null) {
  lambdaClientInstance = client;
}

const FUNCTION_NAME = process.env.SANDBOX_EXECUTOR_FUNCTION_NAME || 'codelearn-sandbox-executor';
const MAX_LAMBDA_TIMEOUT = 15000; // 15 seconds
const DEFAULT_LAMBDA_TIMEOUT = 15000; // 15 seconds

export interface ExecuteRequest {
  code: string;
  language: 'javascript' | 'typescript';
  timeout?: number;
}

export interface ExecuteResponse {
  success: boolean;
  output?: string;
  errors?: string[];
  executionTime?: number;
  previewUrl?: string;
}

/**
 * Execute code in Lambda sandbox
 */
export async function executeLambda(
  request: ExecuteRequest
): Promise<ExecuteResponse> {
  try {
    const lambdaClient = getLambdaClient();
    
    // Enforce maximum timeout of 15 seconds
    const effectiveTimeout = Math.min(
      request.timeout || DEFAULT_LAMBDA_TIMEOUT,
      MAX_LAMBDA_TIMEOUT
    );
    
    const command = new InvokeCommand({
      FunctionName: FUNCTION_NAME,
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify({
        ...request,
        timeout: effectiveTimeout,
      }),
    });

    const response = await lambdaClient.send(command);

    if (!response.Payload) {
      return {
        success: false,
        errors: ['No response from Lambda function'],
      };
    }

    // Decode the payload
    const payload = JSON.parse(
      new TextDecoder().decode(response.Payload)
    ) as ExecuteResponse;

    // Check for Lambda errors
    if (response.FunctionError) {
      return {
        success: false,
        errors: [
          `Lambda execution error: ${response.FunctionError}`,
          ...(payload.errors || []),
        ],
      };
    }

    return payload;
  } catch (error) {
    console.error('Lambda invocation failed:', error);
    return {
      success: false,
      errors: [
        error instanceof Error
          ? error.message
          : 'Unknown error invoking Lambda function',
      ],
    };
  }
}

/**
 * Check if Lambda execution is available
 */
export function isLambdaAvailable(): boolean {
  return !!process.env.SANDBOX_EXECUTOR_FUNCTION_NAME;
}
