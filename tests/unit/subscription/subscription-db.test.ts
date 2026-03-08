import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import {
  getUserSubscription,
  updateUserSubscription,
  updateUserTier,
  cancelUserSubscription,
  reactivateUserSubscription,
  formatSubscriptionData
} from '@/lib/db/subscriptions';

const dynamoMock = mockClient(DynamoDBDocumentClient);

describe('Subscription Database Operations', () => {
  beforeEach(() => {
    dynamoMock.reset();
    vi.clearAllMocks();
  });

  describe('getUserSubscription', () => {
    it('should return user subscription data', async () => {
      const mockItem = {
        userId: 'user123',
        tier: 'pro',
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_123',
        subscriptionStatus: 'active',
        currentPeriodStart: '2024-01-01T00:00:00Z',
        currentPeriodEnd: '2024-02-01T00:00:00Z',
        cancelAtPeriodEnd: false,
        paymentMethodLast4: '4242',
        paymentMethodBrand: 'visa',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      dynamoMock.on(GetCommand).resolves({ Item: mockItem });

      const result = await getUserSubscription('user123');

      expect(result).toEqual({
        userId: 'user123',
        tier: 'pro',
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_123',
        subscriptionStatus: 'active',
        currentPeriodStart: '2024-01-01T00:00:00Z',
        currentPeriodEnd: '2024-02-01T00:00:00Z',
        cancelAtPeriodEnd: false,
        paymentMethodLast4: '4242',
        paymentMethodBrand: 'visa',
        updatedAt: '2024-01-01T00:00:00Z'
      });

      expect(dynamoMock.commandCalls(GetCommand)).toHaveLength(1);
      expect(dynamoMock.commandCalls(GetCommand)[0].args[0].input).toEqual({
        TableName: 'codelearn-users-dev',
        Key: {
          PK: 'USER#user123',
          SK: 'PROFILE'
        }
      });
    });

    it('should return null when user not found', async () => {
      dynamoMock.on(GetCommand).resolves({ Item: undefined });

      const result = await getUserSubscription('user123');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      dynamoMock.on(GetCommand).rejects(new Error('Database error'));

      await expect(getUserSubscription('user123')).rejects.toThrow('Database error');
    });
  });

  describe('updateUserSubscription', () => {
    it('should update user subscription fields', async () => {
      dynamoMock.on(UpdateCommand).resolves({});

      const updates = {
        tier: 'pro' as const,
        stripeCustomerId: 'cus_123',
        subscriptionStatus: 'active' as const
      };

      await updateUserSubscription('user123', updates);

      expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(1);
      const updateCall = dynamoMock.commandCalls(UpdateCommand)[0].args[0].input;
      
      expect(updateCall.TableName).toBe('codelearn-users-dev');
      expect(updateCall.Key).toEqual({
        PK: 'USER#user123',
        SK: 'PROFILE'
      });
      expect(updateCall.UpdateExpression).toContain('SET #tier = :tier');
      expect(updateCall.UpdateExpression).toContain('#stripeCustomerId = :stripeCustomerId');
      expect(updateCall.UpdateExpression).toContain('#subscriptionStatus = :subscriptionStatus');
      expect(updateCall.UpdateExpression).toContain('#updatedAt = :updatedAt');
    });

    it('should handle empty updates', async () => {
      dynamoMock.on(UpdateCommand).resolves({});

      await updateUserSubscription('user123', {});

      expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(1);
      const updateCall = dynamoMock.commandCalls(UpdateCommand)[0].args[0].input;
      
      // Should only update the updatedAt field
      expect(updateCall.UpdateExpression).toBe('SET #updatedAt = :updatedAt');
    });
  });

  describe('updateUserTier', () => {
    it('should update user tier', async () => {
      dynamoMock.on(UpdateCommand).resolves({});

      await updateUserTier('user123', 'pro');

      expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(1);
      const updateCall = dynamoMock.commandCalls(UpdateCommand)[0].args[0].input;
      
      expect(updateCall.UpdateExpression).toContain('#tier = :tier');
      expect(updateCall.ExpressionAttributeValues[':tier']).toBe('pro');
    });
  });

  describe('cancelUserSubscription', () => {
    it('should mark subscription as cancelled', async () => {
      dynamoMock.on(UpdateCommand).resolves({});

      await cancelUserSubscription('user123');

      expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(1);
      const updateCall = dynamoMock.commandCalls(UpdateCommand)[0].args[0].input;
      
      expect(updateCall.UpdateExpression).toContain('#cancelAtPeriodEnd = :cancelAtPeriodEnd');
      expect(updateCall.UpdateExpression).toContain('#subscriptionStatus = :subscriptionStatus');
      expect(updateCall.ExpressionAttributeValues[':cancelAtPeriodEnd']).toBe(true);
      expect(updateCall.ExpressionAttributeValues[':subscriptionStatus']).toBe('cancelled');
    });
  });

  describe('reactivateUserSubscription', () => {
    it('should reactivate cancelled subscription', async () => {
      dynamoMock.on(UpdateCommand).resolves({});

      await reactivateUserSubscription('user123');

      expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(1);
      const updateCall = dynamoMock.commandCalls(UpdateCommand)[0].args[0].input;
      
      expect(updateCall.UpdateExpression).toContain('#cancelAtPeriodEnd = :cancelAtPeriodEnd');
      expect(updateCall.UpdateExpression).toContain('#subscriptionStatus = :subscriptionStatus');
      expect(updateCall.ExpressionAttributeValues[':cancelAtPeriodEnd']).toBe(false);
      expect(updateCall.ExpressionAttributeValues[':subscriptionStatus']).toBe('active');
    });
  });

  describe('formatSubscriptionData', () => {
    it('should format user subscription for API response', () => {
      const userSub = {
        userId: 'user123',
        tier: 'pro' as const,
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_123',
        subscriptionStatus: 'active' as const,
        currentPeriodStart: '2024-01-01T00:00:00Z',
        currentPeriodEnd: '2024-02-01T00:00:00Z',
        cancelAtPeriodEnd: false,
        paymentMethodLast4: '4242',
        paymentMethodBrand: 'visa',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      const result = formatSubscriptionData(userSub);

      expect(result).toEqual({
        plan: 'pro',
        status: 'active',
        currentPeriodStart: '2024-01-01T00:00:00Z',
        currentPeriodEnd: '2024-02-01T00:00:00Z',
        cancelAtPeriodEnd: false,
        paymentMethod: {
          type: 'card',
          last4: '4242',
          brand: 'visa'
        },
        stripeSubscriptionId: 'sub_123',
        stripeCustomerId: 'cus_123'
      });
    });

    it('should handle missing optional fields', () => {
      const userSub = {
        userId: 'user123',
        tier: 'free' as const,
        updatedAt: '2024-01-01T00:00:00Z'
      };

      const result = formatSubscriptionData(userSub);

      expect(result.plan).toBe('free');
      expect(result.status).toBe('active');
      expect(result.paymentMethod.last4).toBe('4242');
      expect(result.paymentMethod.brand).toBe('visa');
      expect(result.currentPeriodStart).toBeDefined();
      expect(result.currentPeriodEnd).toBeDefined();
    });
  });
});