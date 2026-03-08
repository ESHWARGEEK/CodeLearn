// Minimal stub for DynamoDB operations
export async function getUsageStats(userId: string) {
  return {
    apiCalls: 0,
    storageUsed: 0,
    computeTime: 0
  };
}

export const TABLES = {
  PROJECTS: 'stub-projects-table',
  LEARNING_PATHS: 'stub-learning-paths-table',
  USERS: 'stub-users-table',
  TEMPLATES: 'stub-templates-table',
  INTEGRATIONS: 'stub-integrations-table',
  JOBS: 'stub-jobs-table'
};

export async function putItem(tableName: string, item: Record<string, unknown>) {
  // Stub implementation
  return Promise.resolve();
}

export async function getItem(tableName: string, key: Record<string, unknown>) {
  // Stub implementation
  return null;
}

export async function queryItems(
  tableName: string,
  keyCondition: string,
  expressionAttributeValues: Record<string, unknown>,
  indexName?: string
) {
  // Stub implementation
  return [];
}