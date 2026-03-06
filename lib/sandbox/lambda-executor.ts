/**
 * Lambda Executor Utility
 * 
 * Invokes the sandbox executor Lambda function for quick code execution
 */

import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import {
  LAMBDA_LIMITS,
  enforceTimeout,
  enforceOutputSize,
  validateResourceRequest,
} from './resource-limits';

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

export interface ExecuteRequest {
  code: string;
  language: 'javascript' | 'typescript';
  timeout?: number;
  memory?: number;
}

export interface ExecuteResponse {
  success: boolean;
  output?: string;
  errors?: string[];
  executionTime?: number;
  previewUrl?: string;
  resourceLimits?: {
    memory: number;
    timeout: number;
    enforced: boolean;
  };
}

/**
 * Execute code in Lambda sandbox with resource limit enforcement
 */
export async function executeLambda(
  request: ExecuteRequest
): Promise<ExecuteResponse> {
  try {
    // Validate resource request against limits
    const validation = validateResourceRequest(
      {
        timeout: request.timeout,
        memory: request.memory,
      },
      LAMBDA_LIMITS
    );

    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    const lambdaClient = getLambdaClient();
    
    // Enforce resource limits
    const effectiveTimeout = enforceTimeout(request.timeout, LAMBDA_LIMITS);
    const effectiveMemory = LAMBDA_LIMITS.memory; // Lambda memory is fixed at deployment
    
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
        resourceLimits: {
          memory: effectiveMemory,
          timeout: effectiveTimeout,
          enforced: true,
        },
      };
    }

    // Enforce output size limits
    if (payload.output) {
      const { output, truncated } = enforceOutputSize(payload.output, LAMBDA_LIMITS);
      payload.output = output;
      
      if (truncated && payload.errors) {
        payload.errors.push('Output was truncated due to size limits');
      } else if (truncated) {
        payload.errors = ['Output was truncated due to size limits'];
      }
    }

    // Add resource limit information
    return {
      ...payload,
      resourceLimits: {
        memory: effectiveMemory,
        timeout: effectiveTimeout,
        enforced: true,
      },
    };
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
