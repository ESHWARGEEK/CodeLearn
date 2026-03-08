/**
 * Stripe Webhook API Route Tests
 * Unit tests for webhook event handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Stripe first
vi.mock('@/lib/stripe', () => ({
  verifyWebhookSignature: vi.fn(),
  handleWebhookEvent: vi.fn(),
  stripeConfig: {
    webhookSecret: 'whsec_test_secret'
  }
}));

// Mock headers
vi.mock('next/headers', () => ({
  headers: vi.fn()
}));

// Import after mocking
const { POST } = await import('@/app/api/billing/webhook/route');
const { verifyWebhookSignature, handleWebhookEvent } = await import('@/lib/stripe');
const { headers } = await import('next/headers');

describe('/api/billing/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  const createMockRequest = (body: string) => {
    return {
      text: vi.fn().mockResolvedValue(body)
    } as unknown as NextRequest;
  };

  const mockEvent = {
    id: 'evt_test_123',
    type: 'customer.subscription.created',
    created: 1234567890,
    livemode: false,
    data: {
      object: {
        id: 'sub_test_123',
        customer: 'cus_test_123',
        metadata: { userId: 'user-123' }
      }
    }
  };

  it('should process webhook successfully', async () => {
    const body = JSON.stringify(mockEvent);
    const request = createMockRequest(body);
    
    vi.mocked(headers).mockReturnValue({
      get: vi.fn().mockReturnValue('test_signature')
    } as any);
    
    vi.mocked(verifyWebhookSignature).mockReturnValue(mockEvent as any);
    vi.mocked(handleWebhookEvent).mockResolvedValue(undefined);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
    expect(data.eventId).toBe('evt_test_123');
    expect(data.eventType).toBe('customer.subscription.created');
    expect(typeof data.processingTimeMs).toBe('number');
    expect(data.processingTimeMs).toBeGreaterThanOrEqual(0);
    
    expect(verifyWebhookSignature).toHaveBeenCalledWith(
      body,
      'test_signature',
      'whsec_test_secret'
    );
    expect(handleWebhookEvent).toHaveBeenCalledWith(mockEvent);
  });

  it('should return 400 when signature is missing', async () => {
    const request = createMockRequest('{}');
    
    vi.mocked(headers).mockReturnValue({
      get: vi.fn().mockReturnValue(null)
    } as any);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing signature');
  });

  it('should return 400 when signature verification fails', async () => {
    const request = createMockRequest('{}');
    
    vi.mocked(headers).mockReturnValue({
      get: vi.fn().mockReturnValue('invalid_signature')
    } as any);
    
    vi.mocked(verifyWebhookSignature).mockImplementation(() => {
      throw new Error('Invalid webhook signature');
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid signature');
  });

  it('should return 500 when webhook handler fails', async () => {
    const body = JSON.stringify(mockEvent);
    const request = createMockRequest(body);
    
    vi.mocked(headers).mockReturnValue({
      get: vi.fn().mockReturnValue('test_signature')
    } as any);
    
    vi.mocked(verifyWebhookSignature).mockReturnValue(mockEvent as any);
    vi.mocked(handleWebhookEvent).mockRejectedValue(new Error('Handler failed'));

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Webhook handler failed');
    expect(data.eventId).toBe('evt_test_123');
    expect(data.eventType).toBe('customer.subscription.created');
  });

  it('should log webhook processing details', async () => {
    const body = JSON.stringify(mockEvent);
    const request = createMockRequest(body);
    
    vi.mocked(headers).mockReturnValue({
      get: vi.fn().mockReturnValue('test_signature')
    } as any);
    
    vi.mocked(verifyWebhookSignature).mockReturnValue(mockEvent as any);
    vi.mocked(handleWebhookEvent).mockResolvedValue(undefined);

    await POST(request);

    expect(console.log).toHaveBeenCalledWith('Webhook received:', {
      eventId: 'evt_test_123',
      eventType: 'customer.subscription.created',
      created: 1234567890,
      livemode: false
    });

    expect(console.log).toHaveBeenCalledWith('Webhook processed successfully:', 
      expect.objectContaining({
        eventId: 'evt_test_123',
        eventType: 'customer.subscription.created',
        processingTimeMs: expect.any(Number)
      })
    );
  });

  it('should log detailed error information on failure', async () => {
    const body = JSON.stringify(mockEvent);
    const request = createMockRequest(body);
    
    vi.mocked(headers).mockReturnValue({
      get: vi.fn().mockReturnValue('test_signature')
    } as any);
    
    const error = new Error('Test error');
    error.stack = 'Test stack trace';
    
    vi.mocked(verifyWebhookSignature).mockReturnValue(mockEvent as any);
    vi.mocked(handleWebhookEvent).mockRejectedValue(error);

    await POST(request);

    expect(console.error).toHaveBeenCalledWith('Webhook error:', 
      expect.objectContaining({
        eventId: 'evt_test_123',
        eventType: 'customer.subscription.created',
        processingTimeMs: expect.any(Number),
        error: 'Test error',
        stack: 'Test stack trace'
      })
    );
  });
});