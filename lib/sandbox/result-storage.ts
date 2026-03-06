/**
 * Sandbox Execution Result Storage
 * 
 * Handles storing execution results in S3 and DynamoDB for caching and retrieval.
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ExecutionResult } from './result-handler';

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
const dynamoClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' })
);

const RESULTS_BUCKET = process.env.SANDBOX_RESULTS_BUCKET || 'codelearn-sandbox-results-dev';
const RESULTS_TABLE = process.env.SANDBOX_RESULTS_TABLE || 'sandbox-results';
const CACHE_TTL_SECONDS = 24 * 60 * 60; // 24 hours

export interface StoredResult {
  resultId: string;
  userId: string;
  projectId?: string;
  code: string;
  language: string;
  result: ExecutionResult;
  previewUrl?: string;
  s3Key?: string;
  createdAt: number;
  expiresAt: number;
}

/**
 * Store execution result in S3 and DynamoDB
 */
export async function storeExecutionResult(
  userId: string,
  code: string,
  language: string,
  result: ExecutionResult,
  projectId?: string
): Promise<StoredResult> {
  const resultId = generateResultId();
  const timestamp = Date.now();
  const expiresAt = timestamp + CACHE_TTL_SECONDS * 1000;

  let s3Key: string | undefined;
  let previewUrl: string | undefined;

  // Store HTML output in S3 for preview
  if (result.output && isHTMLOutput(result.output)) {
    s3Key = `results/${userId}/${resultId}/output.html`;
    
    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: RESULTS_BUCKET,
          Key: s3Key,
          Body: result.output,
          ContentType: 'text/html',
          Metadata: {
            userId,
            resultId,
            language,
            timestamp: timestamp.toString(),
          },
        })
      );

      // Generate signed URL for preview (valid for 1 hour)
      previewUrl = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: RESULTS_BUCKET,
          Key: s3Key,
        }),
        { expiresIn: 3600 }
      );
    } catch (error) {
      console.error('Failed to store result in S3:', error);
      // Continue without S3 storage
    }
  }

  // Store metadata in DynamoDB for caching
  const storedResult: StoredResult = {
    resultId,
    userId,
    projectId,
    code,
    language,
    result,
    previewUrl,
    s3Key,
    createdAt: timestamp,
    expiresAt,
  };

  try {
    await dynamoClient.send(
      new PutCommand({
        TableName: RESULTS_TABLE,
        Item: {
          PK: `RESULT#${resultId}`,
          SK: `USER#${userId}`,
          ...storedResult,
          TTL: Math.floor(expiresAt / 1000), // DynamoDB TTL in seconds
        },
      })
    );
  } catch (error) {
    console.error('Failed to store result in DynamoDB:', error);
    // Continue without DynamoDB caching
  }

  return storedResult;
}

/**
 * Retrieve execution result from cache
 */
export async function getExecutionResult(
  resultId: string,
  userId: string
): Promise<StoredResult | null> {
  try {
    const response = await dynamoClient.send(
      new GetCommand({
        TableName: RESULTS_TABLE,
        Key: {
          PK: `RESULT#${resultId}`,
          SK: `USER#${userId}`,
        },
      })
    );

    if (!response.Item) {
      return null;
    }

    const storedResult = response.Item as StoredResult;

    // Check if result has expired
    if (storedResult.expiresAt < Date.now()) {
      return null;
    }

    // Regenerate preview URL if needed
    if (storedResult.s3Key && !storedResult.previewUrl) {
      try {
        storedResult.previewUrl = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: RESULTS_BUCKET,
            Key: storedResult.s3Key,
          }),
          { expiresIn: 3600 }
        );
      } catch (error) {
        console.error('Failed to generate preview URL:', error);
      }
    }

    return storedResult;
  } catch (error) {
    console.error('Failed to retrieve result from DynamoDB:', error);
    return null;
  }
}

/**
 * Check if output is HTML
 */
function isHTMLOutput(output: string): boolean {
  const trimmed = output.trim();
  return (
    trimmed.startsWith('<!DOCTYPE') ||
    trimmed.startsWith('<html') ||
    (trimmed.includes('<html') && trimmed.includes('</html>'))
  );
}

/**
 * Generate unique result ID
 */
function generateResultId(): string {
  return `result_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Check if result storage is available
 */
export function isResultStorageAvailable(): boolean {
  return !!(
    process.env.SANDBOX_RESULTS_BUCKET &&
    process.env.SANDBOX_RESULTS_TABLE &&
    process.env.AWS_REGION
  );
}
