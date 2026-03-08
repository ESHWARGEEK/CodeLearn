import { getItem, TABLES } from './dynamodb';

/**
 * User Profile Data Model
 * 
 * PK: "USER#{userId}"
 * SK: "PROFILE"
 */

export interface UserProfile {
  PK: string;              // "USER#{userId}"
  SK: string;              // "PROFILE"
  email: string;
  name: string;
  avatarUrl?: string;
  provider: 'github' | 'google' | 'email';
  tier: 'free' | 'pro' | 'team';
  createdAt: number;
  lastLoginAt: number;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

/**
 * Get user profile by userId
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const item = await getItem(TABLES.PROJECTS, {
    PK: `USER#${userId}`,
    SK: 'PROFILE',
  });

  if (!item) {
    return null;
  }

  return item as UserProfile;
}