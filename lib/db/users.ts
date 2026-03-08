import { putItem, getItem, queryItems, TABLES } from './dynamodb';

/**
 * User Data Model
 * 
 * PK: "USER#{userId}"
 * SK: "PROFILE"
 */

export interface User {
  PK: string;              // "USER#{userId}"
  SK: string;              // "PROFILE"
  email: string;
  name: string;
  avatarUrl?: string;
  provider: 'github' | 'google' | 'email';
  tier: 'free' | 'pro' | 'team';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: number;       // Unix timestamp
  lastLoginAt: number;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

/**
 * Get a user by ID
 */
export async function getUser(userId: string): Promise<User | null> {
  const item = await getItem(TABLES.USERS, {
    PK: `USER#${userId}`,
    SK: 'PROFILE',
  });

  if (!item) {
    return null;
  }

  return item as User;
}

/**
 * Create a new user
 */
export async function createUser(
  userId: string,
  data: {
    email: string;
    name: string;
    provider: User['provider'];
    avatarUrl?: string;
  }
): Promise<User> {
  const now = Math.floor(Date.now() / 1000);

  const user: User = {
    PK: `USER#${userId}`,
    SK: 'PROFILE',
    email: data.email,
    name: data.name,
    avatarUrl: data.avatarUrl,
    provider: data.provider,
    tier: 'free', // Default to free tier
    createdAt: now,
    lastLoginAt: now,
    preferences: {
      theme: 'light',
      notifications: true,
    },
  };

  await putItem(TABLES.USERS, user as unknown as Record<string, unknown>);
  return user;
}

/**
 * Update user's last login time
 */
export async function updateUserLastLogin(userId: string): Promise<void> {
  const user = await getUser(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const now = Math.floor(Date.now() / 1000);
  const updatedUser: User = {
    ...user,
    lastLoginAt: now,
  };

  await putItem(TABLES.USERS, updatedUser as unknown as Record<string, unknown>);
}

/**
 * Update user tier (for subscription management)
 */
export async function updateUserTier(
  userId: string,
  tier: User['tier'],
  stripeCustomerId?: string | null,
  stripeSubscriptionId?: string | null
): Promise<void> {
  const user = await getUser(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const updatedUser: User = {
    ...user,
    tier,
    stripeCustomerId: stripeCustomerId || user.stripeCustomerId,
    stripeSubscriptionId: stripeSubscriptionId || user.stripeSubscriptionId,
  };

  // Clear Stripe references when downgrading to free
  if (tier === 'free' && stripeCustomerId === null && stripeSubscriptionId === null) {
    updatedUser.stripeCustomerId = undefined;
    updatedUser.stripeSubscriptionId = undefined;
  }

  await putItem(TABLES.USERS, updatedUser as unknown as Record<string, unknown>);
  
  console.log(`User tier updated: ${userId} -> ${tier}`, {
    userId,
    previousTier: user.tier,
    newTier: tier,
    stripeCustomerId: updatedUser.stripeCustomerId,
    stripeSubscriptionId: updatedUser.stripeSubscriptionId
  });
}

/**
 * Get a user by Stripe customer ID
 */
export async function getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | null> {
  // Since we don't have a GSI on stripeCustomerId, we'll need to scan
  // In production, consider adding a GSI for this lookup
  try {
    const { scanItems } = await import('./dynamodb');
    const items = await scanItems(TABLES.USERS, {
      FilterExpression: 'stripeCustomerId = :customerId',
      ExpressionAttributeValues: {
        ':customerId': stripeCustomerId
      }
    });

    return items.length > 0 ? (items[0] as User) : null;
  } catch (error) {
    console.error('Error getting user by Stripe customer ID:', error);
    return null;
  }
}

/**
 * Check if user has reached integration limit
 */
export async function checkIntegrationLimit(userId: string, currentCount: number): Promise<{
  allowed: boolean;
  limit: number;
  remaining: number;
}> {
  const user = await getUser(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Free tier: 5 integrations per month
  // Pro/Team tier: unlimited
  const limit = user.tier === 'free' ? 5 : Infinity;
  const remaining = user.tier === 'free' ? Math.max(0, limit - currentCount) : Infinity;
  const allowed = user.tier !== 'free' || currentCount < limit;

  return {
    allowed,
    limit: user.tier === 'free' ? limit : -1, // -1 indicates unlimited
    remaining: user.tier === 'free' ? remaining : -1,
  };
}