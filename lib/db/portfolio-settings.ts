import { putItem, getItem, TABLES } from './dynamodb';
import { PortfolioSettings } from '@/types/portfolio';

/**
 * Portfolio Settings Data Model
 * 
 * PK: "USER#{userId}"
 * SK: "PORTFOLIO_SETTINGS"
 */

export interface PortfolioSettingsRecord {
  PK: string;              // "USER#{userId}"
  SK: string;              // "PORTFOLIO_SETTINGS"
  isPublic: boolean;
  showGithubLinks: boolean;
  showTechStack: boolean;
  customDescription?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Get portfolio settings for a user
 */
export async function getPortfolioSettings(userId: string): Promise<PortfolioSettings> {
  const item = await getItem(TABLES.PROJECTS, {
    PK: `USER#${userId}`,
    SK: 'PORTFOLIO_SETTINGS',
  });

  if (!item) {
    // Return default settings if none exist
    return {
      isPublic: false,
      showGithubLinks: true,
      showTechStack: true,
    };
  }

  const record = item as PortfolioSettingsRecord;
  return {
    isPublic: record.isPublic,
    showGithubLinks: record.showGithubLinks,
    showTechStack: record.showTechStack,
    customDescription: record.customDescription,
  };
}

/**
 * Update portfolio settings for a user
 */
export async function updatePortfolioSettings(
  userId: string,
  settings: PortfolioSettings
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  
  // Get existing record to preserve createdAt
  const existing = await getItem(TABLES.PROJECTS, {
    PK: `USER#${userId}`,
    SK: 'PORTFOLIO_SETTINGS',
  });

  const record: PortfolioSettingsRecord = {
    PK: `USER#${userId}`,
    SK: 'PORTFOLIO_SETTINGS',
    isPublic: settings.isPublic,
    showGithubLinks: settings.showGithubLinks,
    showTechStack: settings.showTechStack,
    customDescription: settings.customDescription,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  await putItem(TABLES.PROJECTS, record as unknown as Record<string, unknown>);
}