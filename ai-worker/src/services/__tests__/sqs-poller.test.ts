import { SQSPoller } from '../sqs-poller';
import { AgentOrchestrator } from '../agent-orchestrator';
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { JobType, JobStatus } from '../../types/job';

// Mock AWS SDK
jest.mock('@aws-sdk/client-sqs');
const mockSQSClient = SQSClient as jest.MockedClass<typeof SQSClient>;
const mockReceiveMessageCommand = ReceiveMessageCommand as jest.MockedClass<typeof ReceiveMessageCommand>;
const mockDeleteMessageCommand = DeleteMessageCommand as jest.MockedClass<typeof DeleteMessageCommand>;

// Mock AgentOrchestrator
jest.mock('../agent-orchestrator');
const mockAgentOrchestrator = AgentOrchestrator as jest.MockedClass<typeof AgentOrchestrator>;

describe('SQSPoller', () => {
  let sqsPoller: SQSPoller;
  let mockOrchestrator: jest.Mocked<AgentOrchestrator>;
  let mockSend: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockOrchestrator = new mockAgentOrchestrator() as jest.Mocked<AgentOrchestrator>;
    mockSend = jest.fn();
    
    (mockSQSClient as any).mockImplementation(() => ({
      send: mockSend,
    }));

    sqsPoller = new SQSPoller({
      queueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789/test-queue',
      region: 'us-east-1',
      orchestrator: mockOrchestrator,
    });
  });

  afterEach(async () => {
    await sqsPoller.stop();
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      expect(sqsPoller).toBeInstanceOf(SQSPoller);
    });

    it('should accept custom configuration', () => {
      const customPoller = new SQSPoller({
        queueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789/custom-queue',
        region: 'us-west-2',
        orchestrator: mockOrchestrator,
        maxMessages: 5,
        waitTimeSeconds: 10,
        visibilityTimeoutSeconds: 600,
      });

      expect(customPoller).toBeInstanceOf(SQSPoller);
    });
  });

  describe('message processing', () => {
    const mockJob = {
      jobId: 'test-job-123',
      userId: 'user-456',
      type: JobType.CURATE_LEARNING_PATH,
      status: JobStatus.PENDING,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      retryCount: 0,
      maxRetries: 3,
      payload: {
        technology: 'React',
        difficulty: 'beginner' as const,
      },
    };

    it('should process valid messages successfully', async () => {
      // Mock SQS receive message response
      mockSend.mockResolvedValueOnce({
        Messages: [
          {
            MessageId: 'msg-123',
            ReceiptHandle: 'receipt-123',
            Body: JSON.stringify(mockJob),
          },
        ],
      });

      // Mock successful job processing
      mockOrchestrator.processJob.mockResolvedValueOnce({
        jobId: mockJob.jobId,
        status: JobStatus.COMPLETED,
        result: { success: true },
        processingTimeMs: 1000,
      });

      // Mock successful message deletion
      mockSend.mockResolvedValueOnce({});

      // Start polling (will process one batch and then stop)
      await sqsPoller.start();
      
      // Wait a bit for processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await sqsPoller.stop();

      // Verify SQS operations
      expect(mockSend).toHaveBeenCalledWith(expect.any(mockReceiveMessageCommand));
      expect(mockSend).toHaveBeenCalledWith(expect.any(mockDeleteMessageCommand));
      
      // Verify job processing
      expect(mockOrchestrator.processJob).toHaveBeenCalledWith(mockJob);
    });

    it('should handle invalid message format gracefully', async () => {
      // Mock SQS receive message response with invalid JSON
      mockSend.mockResolvedValueOnce({
        Messages: [
          {
            MessageId: 'msg-123',
            ReceiptHandle: 'receipt-123',
            Body: 'invalid json',
          },
        ],
      });

      await sqsPoller.start();
      await new Promise(resolve => setTimeout(resolve, 100));
      await sqsPoller.stop();

      // Should receive message but not process job due to invalid format
      expect(mockSend).toHaveBeenCalledWith(expect.any(mockReceiveMessageCommand));
      expect(mockOrchestrator.processJob).not.toHaveBeenCalled();
      
      // Should not delete message on error
      expect(mockSend).not.toHaveBeenCalledWith(expect.any(mockDeleteMessageCommand));
    });

    it('should handle job processing failures gracefully', async () => {
      // Mock SQS receive message response
      mockSend.mockResolvedValueOnce({
        Messages: [
          {
            MessageId: 'msg-123',
            ReceiptHandle: 'receipt-123',
            Body: JSON.stringify(mockJob),
          },
        ],
      });

      // Mock job processing failure
      mockOrchestrator.processJob.mockRejectedValueOnce(new Error('Processing failed'));

      await sqsPoller.start();
      await new Promise(resolve => setTimeout(resolve, 100));
      await sqsPoller.stop();

      // Should receive message and attempt processing
      expect(mockSend).toHaveBeenCalledWith(expect.any(mockReceiveMessageCommand));
      expect(mockOrchestrator.processJob).toHaveBeenCalledWith(mockJob);
      
      // Should not delete message on processing failure
      expect(mockSend).not.toHaveBeenCalledWith(expect.any(mockDeleteMessageCommand));
    });

    it('should handle empty message batches', async () => {
      // Mock SQS receive message response with no messages
      mockSend.mockResolvedValueOnce({
        Messages: undefined,
      });

      await sqsPoller.start();
      await new Promise(resolve => setTimeout(resolve, 100));
      await sqsPoller.stop();

      // Should receive messages but not process any jobs
      expect(mockSend).toHaveBeenCalledWith(expect.any(mockReceiveMessageCommand));
      expect(mockOrchestrator.processJob).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle SQS receive errors gracefully', async () => {
      // Mock SQS receive error
      mockSend.mockRejectedValueOnce(new Error('SQS error'));

      await sqsPoller.start();
      await new Promise(resolve => setTimeout(resolve, 100));
      await sqsPoller.stop();

      // Should attempt to receive messages
      expect(mockSend).toHaveBeenCalledWith(expect.any(mockReceiveMessageCommand));
      expect(mockOrchestrator.processJob).not.toHaveBeenCalled();
    });

    it('should handle message deletion errors gracefully', async () => {
      const mockJob = {
        jobId: 'test-job-123',
        userId: 'user-456',
        type: JobType.CURATE_LEARNING_PATH,
        status: JobStatus.PENDING,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        retryCount: 0,
        maxRetries: 3,
        payload: {
          technology: 'React',
          difficulty: 'beginner' as const,
        },
      };

      // Mock successful receive and processing
      mockSend
        .mockResolvedValueOnce({
          Messages: [
            {
              MessageId: 'msg-123',
              ReceiptHandle: 'receipt-123',
              Body: JSON.stringify(mockJob),
            },
          ],
        })
        .mockRejectedValueOnce(new Error('Delete failed')); // Delete fails

      mockOrchestrator.processJob.mockResolvedValueOnce({
        jobId: mockJob.jobId,
        status: JobStatus.COMPLETED,
        result: { success: true },
        processingTimeMs: 1000,
      });

      await sqsPoller.start();
      await new Promise(resolve => setTimeout(resolve, 100));
      await sqsPoller.stop();

      // Should process job even if deletion fails
      expect(mockOrchestrator.processJob).toHaveBeenCalledWith(mockJob);
    });
  });

  describe('lifecycle management', () => {
    it('should start and stop polling correctly', async () => {
      mockSend.mockResolvedValue({ Messages: undefined });

      await sqsPoller.start();
      expect(sqsPoller['isPolling']).toBe(true);

      await sqsPoller.stop();
      expect(sqsPoller['isPolling']).toBe(false);
    });

    it('should not start if already polling', async () => {
      mockSend.mockResolvedValue({ Messages: undefined });

      await sqsPoller.start();
      await sqsPoller.start(); // Second start should be ignored

      expect(sqsPoller['isPolling']).toBe(true);
      
      await sqsPoller.stop();
    });
  });
});