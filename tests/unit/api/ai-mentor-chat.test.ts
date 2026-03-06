import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/ai/mentor/chat/route';
import { NextRequest } from 'next/server';
import { MentorAgent } from '@/lib/agents/mentor-agent';

// Mock MentorAgent
vi.mock('@/lib/agents/mentor-agent', () => ({
  MentorAgent: vi.fn(),
}));

describe('POST /api/ai/mentor/chat', () => {
  let mockMentorAgent: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock mentor agent
    mockMentorAgent = {
      getMentorResponse: vi.fn(),
      streamMentorResponse: vi.fn(),
    };

    (MentorAgent as any).mockImplementation(() => mockMentorAgent);
  });

  describe('Validation', () => {
    it('should return 400 if question is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/mentor/chat', {
        method: 'POST',
        body: JSON.stringify({
          responseType: 'chat',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('Required');
    });

    it('should return 400 if question is empty string', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/mentor/chat', {
        method: 'POST',
        body: JSON.stringify({
          question: '',
          responseType: 'chat',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 if responseType is invalid', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/mentor/chat', {
        method: 'POST',
        body: JSON.stringify({
          question: 'How do I use React hooks?',
          responseType: 'invalid',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept valid request with minimal fields', async () => {
      mockMentorAgent.getMentorResponse.mockResolvedValue({
        response: 'React hooks are functions that let you use state and other React features.',
        responseType: 'chat',
        timestamp: Date.now(),
      });

      const request = new NextRequest('http://localhost:3000/api/ai/mentor/chat', {
        method: 'POST',
        body: JSON.stringify({
          question: 'How do I use React hooks?',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should accept valid request with all optional fields', async () => {
      mockMentorAgent.getMentorResponse.mockResolvedValue({
        response: 'Here is a hint for your task.',
        responseType: 'hint',
        timestamp: Date.now(),
      });

      const request = new NextRequest('http://localhost:3000/api/ai/mentor/chat', {
        method: 'POST',
        body: JSON.stringify({
          question: 'I need help with this task',
          responseType: 'hint',
          taskContext: 'Create a React component',
          codeContext: 'function MyComponent() { return <div>Hello</div>; }',
          conversationHistory: [
            { role: 'user', content: 'Previous question' },
            { role: 'assistant', content: 'Previous answer' },
          ],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('Non-Streaming Response', () => {
    it('should return mentor response for chat type', async () => {
      const mockResponse = {
        response: 'React hooks are functions that let you use state and other React features.',
        responseType: 'chat',
        timestamp: 1709251200000,
      };

      mockMentorAgent.getMentorResponse.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/ai/mentor/chat', {
        method: 'POST',
        body: JSON.stringify({
          question: 'How do I use React hooks?',
          responseType: 'chat',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.response).toBe(mockResponse.response);
      expect(data.data.responseType).toBe('chat');
      expect(data.data.timestamp).toBe(mockResponse.timestamp);
    });

    it('should return hint response for hint type', async () => {
      const mockResponse = {
        response: 'Try using the useState hook to manage component state.',
        responseType: 'hint',
        timestamp: 1709251200000,
      };

      mockMentorAgent.getMentorResponse.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/ai/mentor/chat', {
        method: 'POST',
        body: JSON.stringify({
          question: 'I need a hint for managing state',
          responseType: 'hint',
          taskContext: 'Create a counter component',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.response).toBe(mockResponse.response);
      expect(data.data.responseType).toBe('hint');
    });

    it('should return explanation response for explanation type', async () => {
      const mockResponse = {
        response:
          'The useState hook returns an array with two elements: the current state value and a function to update it.',
        responseType: 'explanation',
        timestamp: 1709251200000,
      };

      mockMentorAgent.getMentorResponse.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/ai/mentor/chat', {
        method: 'POST',
        body: JSON.stringify({
          question: 'Explain this code',
          responseType: 'explanation',
          codeContext: 'const [count, setCount] = useState(0);',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.response).toBe(mockResponse.response);
      expect(data.data.responseType).toBe('explanation');
    });

    it('should pass conversation history to mentor agent', async () => {
      mockMentorAgent.getMentorResponse.mockResolvedValue({
        response: 'Based on our previous discussion...',
        responseType: 'chat',
        timestamp: Date.now(),
      });

      const conversationHistory = [
        { role: 'user' as const, content: 'What is React?' },
        { role: 'assistant' as const, content: 'React is a JavaScript library...' },
      ];

      const request = new NextRequest('http://localhost:3000/api/ai/mentor/chat', {
        method: 'POST',
        body: JSON.stringify({
          question: 'Can you tell me more?',
          conversationHistory,
        }),
      });

      await POST(request);

      expect(mockMentorAgent.getMentorResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationHistory,
        })
      );
    });

    it('should pass task and code context to mentor agent', async () => {
      mockMentorAgent.getMentorResponse.mockResolvedValue({
        response: 'Here is help with your task.',
        responseType: 'hint',
        timestamp: Date.now(),
      });

      const taskContext = 'Create a React component with state';
      const codeContext = 'function MyComponent() { }';

      const request = new NextRequest('http://localhost:3000/api/ai/mentor/chat', {
        method: 'POST',
        body: JSON.stringify({
          question: 'I need help',
          responseType: 'hint',
          taskContext,
          codeContext,
        }),
      });

      await POST(request);

      expect(mockMentorAgent.getMentorResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          taskContext,
          codeContext,
        })
      );
    });
  });

  describe('Streaming Response', () => {
    it('should return streaming response when stream=true', async () => {
      // Mock async generator
      async function* mockGenerator() {
        yield 'Hello ';
        yield 'from ';
        yield 'AI Mentor!';
      }

      mockMentorAgent.streamMentorResponse.mockReturnValue(mockGenerator());

      const request = new NextRequest('http://localhost:3000/api/ai/mentor/chat', {
        method: 'POST',
        body: JSON.stringify({
          question: 'How do I use React hooks?',
          stream: true,
        }),
      });

      const response = await POST(request);

      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
      expect(response.headers.get('Cache-Control')).toBe('no-cache');
      expect(response.headers.get('Connection')).toBe('keep-alive');
    });

    it('should call streamMentorResponse when stream=true', async () => {
      async function* mockGenerator() {
        yield 'Test';
      }

      mockMentorAgent.streamMentorResponse.mockReturnValue(mockGenerator());

      const request = new NextRequest('http://localhost:3000/api/ai/mentor/chat', {
        method: 'POST',
        body: JSON.stringify({
          question: 'Test question',
          stream: true,
        }),
      });

      await POST(request);

      expect(mockMentorAgent.streamMentorResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          question: 'Test question',
          responseType: 'chat',
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should return 500 if mentor agent throws error', async () => {
      mockMentorAgent.getMentorResponse.mockRejectedValue(
        new Error('Bedrock API error')
      );

      const request = new NextRequest('http://localhost:3000/api/ai/mentor/chat', {
        method: 'POST',
        body: JSON.stringify({
          question: 'How do I use React hooks?',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(data.error.message).toContain('Bedrock API error');
    });

    it('should return 500 with generic message for unknown errors', async () => {
      mockMentorAgent.getMentorResponse.mockRejectedValue('Unknown error');

      const request = new NextRequest('http://localhost:3000/api/ai/mentor/chat', {
        method: 'POST',
        body: JSON.stringify({
          question: 'Test question',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(data.error.message).toBe('Failed to get mentor response');
    });

    it('should include requestId in error response', async () => {
      mockMentorAgent.getMentorResponse.mockRejectedValue(new Error('Test error'));

      const request = new NextRequest('http://localhost:3000/api/ai/mentor/chat', {
        method: 'POST',
        body: JSON.stringify({
          question: 'Test question',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.error.requestId).toBeDefined();
      expect(typeof data.error.requestId).toBe('string');
    });

    it('should include timestamp in error response', async () => {
      mockMentorAgent.getMentorResponse.mockRejectedValue(new Error('Test error'));

      const request = new NextRequest('http://localhost:3000/api/ai/mentor/chat', {
        method: 'POST',
        body: JSON.stringify({
          question: 'Test question',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.error.timestamp).toBeDefined();
      expect(new Date(data.error.timestamp).toString()).not.toBe('Invalid Date');
    });
  });

  describe('Default Values', () => {
    it('should default responseType to "chat" if not provided', async () => {
      mockMentorAgent.getMentorResponse.mockResolvedValue({
        response: 'Test response',
        responseType: 'chat',
        timestamp: Date.now(),
      });

      const request = new NextRequest('http://localhost:3000/api/ai/mentor/chat', {
        method: 'POST',
        body: JSON.stringify({
          question: 'Test question',
        }),
      });

      await POST(request);

      expect(mockMentorAgent.getMentorResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          responseType: 'chat',
        })
      );
    });

    it('should default conversationHistory to empty array if not provided', async () => {
      mockMentorAgent.getMentorResponse.mockResolvedValue({
        response: 'Test response',
        responseType: 'chat',
        timestamp: Date.now(),
      });

      const request = new NextRequest('http://localhost:3000/api/ai/mentor/chat', {
        method: 'POST',
        body: JSON.stringify({
          question: 'Test question',
        }),
      });

      await POST(request);

      expect(mockMentorAgent.getMentorResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationHistory: [],
        })
      );
    });

    it('should default stream to false if not provided', async () => {
      mockMentorAgent.getMentorResponse.mockResolvedValue({
        response: 'Test response',
        responseType: 'chat',
        timestamp: Date.now(),
      });

      const request = new NextRequest('http://localhost:3000/api/ai/mentor/chat', {
        method: 'POST',
        body: JSON.stringify({
          question: 'Test question',
        }),
      });

      const response = await POST(request);

      expect(mockMentorAgent.getMentorResponse).toHaveBeenCalled();
      expect(mockMentorAgent.streamMentorResponse).not.toHaveBeenCalled();
      expect(response.headers.get('Content-Type')).not.toBe('text/event-stream');
    });
  });
});
