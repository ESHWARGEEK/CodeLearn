// Subscription Database Operations
// Task 15.6: Database operations for subscription management

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SubscriptionData } from '@/types/subscription';

const dynamoClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' })
);

const USERS_TABLE = process.env.USERS_TABLE_NAME || 'codelearn-users-dev';

export interface UserSubscription {
  userId: string;
  tier: 'free' | 'pro' | 'team';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: 'active' | 'cancelled' | 'past_due' | 'unpaid';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  paymentMethodLast4?: string;
  paymentMethodBrand?: string;
  updatedAt: string;
}

/**
 * Get user's subscription information from DynamoDB
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const command = new GetCommand({
      TableName: USERS_TABLE,
      Key: {
        PK: `USER#${userId}`,
        SK: 'PROFILE'
      }
    });

    const result = await dynamoClient.send(command);
    
    if (!result.Item) {
      return null;
    }

    return {
      userId: result.Item.userId,
      tier: result.Item.tier || 'free',
      stripeCustomerId: result.Item.stripeCustomerId,
      stripeSubscriptionId: result.Item.stripeSubscriptionId,
      subscriptionStatus: result.Item.subscriptionStatus,
      currentPeriodStart: result.Item.currentPeriodStart,
      currentPeriodEnd: result.Item.currentPeriodEnd,
      cancelAtPeriodEnd: result.Item.cancelAtPeriodEnd || false,
      paymentMethodLast4: result.Item.paymentMethodLast4,
      paymentMethodBrand: result.Item.paymentMethodBrand,
      updatedAt: result.Item.updatedAt
    };
  } catch (error) {
    console.error('Error getting user subscription:', error);
    throw error;
  }
}

/**
 * Update user's subscription information in DynamoDB
 */
export async function updateUserSubscription(
  userId: string, 
  updates: Partial<UserSubscription>
): Promise<void> {
  try {
    const updateExpression: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Build dynamic update expression
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'userId' && value !== undefined) {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    // Always update the updatedAt timestamp
    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const command = new UpdateCommand({
      TableName: USERS_TABLE,
      Key: {
        PK: `USER#${userId}`,
        SK: 'PROFILE'
      },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    });

    await dynamoClient.send(command);
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
}

/**
 * Update user tier (for subscription upgrades/downgrades)
 */
export async function updateUserTier(
  userId: string, 
  tier: 'free' | 'pro' | 'team'
): Promise<void> {
  try {
    await updateUserSubscription(userId, { tier });
  } catch (error) {
    console.error('Error updating user tier:', error);
    throw error;
  }
}

/**
 * Mark subscription as cancelled (but maintain access until period end)
 */
export async function cancelUserSubscription(userId: string): Promise<void> {
  try {
    await updateUserSubscription(userId, {
      cancelAtPeriodEnd: true,
      subscriptionStatus: 'cancelled'
    });
  } catch (error) {
    console.error('Error cancelling user subscription:', error);
    throw error;
  }
}

/**
 * Reactivate a cancelled subscription
 */
export async function reactivateUserSubscription(userId: string): Promise<void> {
  try {
    await updateUserSubscription(userId, {
      cancelAtPeriodEnd: false,
      subscriptionStatus: 'active'
    });
  } catch (error) {
    console.error('Error reactivating user subscription:', error);
    throw error;
  }
}

/**
 * Convert database subscription to API response format
 */
export function formatSubscriptionData(userSub: UserSubscription): SubscriptionData {
  return {
    plan: userSub.tier,
    status: userSub.subscriptionStatus || 'active',
    currentPeriodStart: userSub.currentPeriodStart || new Date().toISOString(),
    currentPeriodEnd: userSub.currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancelAtPeriodEnd: userSub.cancelAtPeriodEnd || false,
    paymentMethod: {
      type: 'card',
      last4: userSub.paymentMethodLast4 || '4242',
      brand: userSub.paymentMethodBrand || 'visa'
    },
    stripeSubscriptionId: userSub.stripeSubscriptionId,
    stripeCustomerId: userSub.stripeCustomerId
  };
}