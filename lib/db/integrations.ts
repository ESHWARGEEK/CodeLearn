import { putItem, getItem, queryItems, TABLES } from './dynamodb';

/**
 * Integration Data Model
 * 
 * PK: "INTEGRATION#{integrationId}"
 * SK: "USER#{userId}"
 * 
 * GSI: userId-month-index
 * - Partition Key: SK (userId)
 * - Sort Key: month
 */

export interface Integration {
  PK: string;              // "INTEGRATION#{integrationId}"
  SK: string;              // "USER#{userId}"
  templateId: string;
  projectId: string;
  month: string;           // "2024-02" for rate limiting
  status: 'preview' | 'approved' | 'undone';
  diff?: {
    additions: number;
    deletions: number;
    files: Array<{
      path: string;
      changes: string;
    }>;
  };
  explanation?: string;    // AI explanation of changes
  previewUrl?: string;     // S3 URL for preview
  createdAt: number;
  updatedAt: number;
}

/**
 * Create a new integration record
 */
export async function createIntegration(
  integrationId: string,
  userId: string,
  data: {
    templateId: string;
    projectId: string;
  }
): Promise<Integration> {
  const now = Math.floor(Date.now() / 1000);
  const currentMonth = new Date().toISOString().slice(0, 7); // "2024-02"

  const integration: Integration = {
    PK: `INTEGRATION#${integrationId}`,
    SK: `USER#${userId}`,
    templateId: data.templateId,
    projectId: data.projectId,
    month: currentMonth,
    status: 'preview',
    createdAt: now,
    updatedAt: now,
  };

  await putItem(TABLES.INTEGRATIONS, integration as unknown as Record<string, unknown>);
  return integration;
}

/**
 * Get an integration by ID
 */
export async function getIntegration(integrationId: string): Promise<Integration | null> {
  // We need to query by PK since we don't know the userId
  const items = await queryItems(
    TABLES.INTEGRATIONS,
    'PK = :pk',
    {
      ':pk': `INTEGRATION#${integrationId}`,
    }
  );

  if (items.length === 0) {
    return null;
  }

  return items[0]! as Integration;
}

/**
 * Get an integration by ID and userId
 */
export async function getIntegrationByUser(
  integrationId: string,
  userId: string
): Promise<Integration | null> {
  const item = await getItem(TABLES.INTEGRATIONS, {
    PK: `INTEGRATION#${integrationId}`,
    SK: `USER#${userId}`,
  });

  if (!item) {
    return null;
  }

  return item as Integration;
}

/**
 * Update integration with preview data
 */
export async function updateIntegrationPreview(
  integrationId: string,
  userId: string,
  data: {
    diff: Integration['diff'];
    explanation: string;
    previewUrl: string;
  }
): Promise<void> {
  const integration = await getIntegrationByUser(integrationId, userId);
  if (!integration) {
    throw new Error('Integration not found');
  }

  const now = Math.floor(Date.now() / 1000);
  const updatedIntegration: Integration = {
    ...integration,
    diff: data.diff,
    explanation: data.explanation,
    previewUrl: data.previewUrl,
    updatedAt: now,
  };

  await putItem(TABLES.INTEGRATIONS, updatedIntegration as unknown as Record<string, unknown>);
}

/**
 * Update integration status
 */
export async function updateIntegrationStatus(
  integrationId: string,
  status: Integration['status']
): Promise<void> {
  const integration = await getIntegration(integrationId);
  if (!integration) {
    throw new Error('Integration not found');
  }

  const now = Math.floor(Date.now() / 1000);
  const updatedIntegration: Integration = {
    ...integration,
    status,
    updatedAt: now,
  };

  await putItem(TABLES.INTEGRATIONS, updatedIntegration as unknown as Record<string, unknown>);
}


/**
 * Count integrations for a user in the current month (for rate limiting)
 */
export async function getMonthlyIntegrationCount(userId: string): Promise<number> {
  const currentMonth = new Date().toISOString().slice(0, 7); // "2024-02"
  
  const items = await queryItems(
    TABLES.INTEGRATIONS,
    'SK = :userId AND #month = :month',
    {
      ':userId': `USER#${userId}`,
      ':month': currentMonth,
    },
    'userId-month-index'
  );

  return items.length;
}

/**
 * Get all integrations for a user
 */
export async function getIntegrationsByUser(userId: string): Promise<Integration[]> {
  const items = await queryItems(
    TABLES.INTEGRATIONS,
    'SK = :sk',
    {
      ':sk': `USER#${userId}`,
    },
    'userId-month-index'
  );

  return items.map((item) => item as Integration);
}