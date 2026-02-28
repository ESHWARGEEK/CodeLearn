import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Create DynamoDB Document Client for easier data manipulation
export const dynamoDb = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: false,
  },
});

// Table names from environment variables
export const TABLES = {
  USERS: process.env.DYNAMODB_USERS_TABLE || 'codelearn-users-dev',
  PROJECTS: process.env.DYNAMODB_PROJECTS_TABLE || 'codelearn-projects-dev',
  LEARNING_PATHS: process.env.DYNAMODB_LEARNING_PATHS_TABLE || 'codelearn-learning-paths-dev',
  TEMPLATES: process.env.DYNAMODB_TEMPLATES_TABLE || 'codelearn-templates-dev',
  JOBS: process.env.DYNAMODB_JOBS_TABLE || 'codelearn-jobs-dev',
  INTEGRATIONS: process.env.DYNAMODB_INTEGRATIONS_TABLE || 'codelearn-integrations-dev',
};

// Helper functions
export async function getItem(tableName: string, key: Record<string, string>) {
  const command = new GetCommand({
    TableName: tableName,
    Key: key,
  });

  const response = await dynamoDb.send(command);
  return response.Item;
}

export async function putItem(tableName: string, item: Record<string, unknown>) {
  const command = new PutCommand({
    TableName: tableName,
    Item: item,
  });

  await dynamoDb.send(command);
}

export async function queryItems(
  tableName: string,
  keyConditionExpression: string,
  expressionAttributeValues: Record<string, unknown>,
  indexName?: string
) {
  const command = new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    IndexName: indexName,
  });

  const response = await dynamoDb.send(command);
  return response.Items || [];
}

export async function updateItem(
  tableName: string,
  key: Record<string, string>,
  updateExpression: string,
  expressionAttributeValues: Record<string, unknown>
) {
  const command = new UpdateCommand({
    TableName: tableName,
    Key: key,
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  });

  const response = await dynamoDb.send(command);
  return response.Attributes;
}

export async function deleteItem(tableName: string, key: Record<string, string>) {
  const command = new DeleteCommand({
    TableName: tableName,
    Key: key,
  });

  await dynamoDb.send(command);
}
