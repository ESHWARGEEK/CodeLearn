/**
 * Unit tests for Mentor Agent
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MentorAgent } from '@/lib/agents/mentor-agent';
import { MentorInput } from '@/lib/agents/types';

// Mock AWS Bedrock client
const mockSend = vi.fn();

vi.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: vi.fn(() => ({
    send: mockSend,
  })),
  InvokeModelWithResponseStreamCommand: vi.fn(),
}));

describe('MentorAgent', () => {
  let mentor: MentorAgent;

  beforeEach(() => {
    mentor = new MentorAgent();
    mockSend.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getMentorResponse', () => {
    it('should generate a hint without revealing the solution', async () => {
      mockSend.mockResolvedValue(
        createMockBedrockResponse(
          'Try using the useState hook to manage the button state.'
        )
      );

      const input: MentorInput = {
        responseType: 'hint',
        question: 'How do I make this button interactive?',
        taskContext: 'Create a counter button',
        codeContext: 'export function Button() { return <button>Click me</button>; }',
        conversationHistory: [],
      };

      const output = await mentor.getMentorResponse(input);

      expect(output.response).toBeTruthy();
      expect(output.responseType).toBe('hint');
      expect(output.timestamp).toBeGreaterThan(0);
    });

    it('should explain code concepts', async () => {
      mockSend.mockResolvedValue(
        createMockBedrockResponse(
          'useState is a React Hook that lets you add state to functional components.'
        )
      );

      const input: MentorInput = {
        responseType: 'explanation',
        question: 'What does useState do?',
        codeContext: 'const [count, setCount] = useState(0);',
        conversationHistory: [],
      };

      const output = await mentor.getMentorResponse(input);

      expect(output.response).toBeTruthy();
      expect(output.responseType).toBe('explanation');
    });

    it('should respond to chat questions', async () => {
      mockSend.mockResolvedValue(
        createMockBedrockResponse(
          'To add TypeScript types, define an interface for your props.'
        )
      );

      const input: MentorInput = {
        responseType: 'chat',
        question: 'How do I add TypeScript types?',
        conversationHistory: [],
      };

      const output = await mentor.getMentorResponse(input);

      expect(output.response).toBeTruthy();
      expect(output.responseType).toBe('chat');
    });
  });

  describe('getTaskHint', () => {
    it('should provide a contextual hint', async () => {
      mockSend.mockResolvedValue(
        createMockBedrockResponse('Think about what state you need to track.')
      );

      const hint = await mentor.getTaskHint(
        'Create a counter button',
        'Build a button that increments a counter'
      );

      expect(hint).toBeTruthy();
    });
  });

  describe('explainCode', () => {
    it('should explain code', async () => {
      mockSend.mockResolvedValue(
        createMockBedrockResponse('This code uses array destructuring.')
      );

      const explanation = await mentor.explainCode(
        'const [count, setCount] = useState(0);'
      );

      expect(explanation).toBeTruthy();
    });
  });
});

// Helper function
function createMockBedrockResponse(text: string) {
  const encoder = new TextEncoder();
  const chunk = {
    type: 'content_block_delta',
    delta: { text },
  };
  
  return {
    body: {
      async *[Symbol.asyncIterator]() {
        yield {
          chunk: {
            bytes: encoder.encode(JSON.stringify(chunk)),
          },
        };
      },
    },
  };
}

  it('should explain code concepts', async () => {
    mockSend.mockResolvedValue(
      createMockResponse('useState is a React Hook for state management')
    );
    
    const input: MentorInput = {
      responseType: 'explanation',
      question: 'What does useState do?',
      codeContext: 'const [count, setCount] = useState(0);',
      conversationHistory: [],
    };

    const output = await mentor.getMentorResponse(input);
    expect(output.response).toBeTruthy();
    expect(output.responseType).toBe('explanation');
  });

  it('should respond to chat questions', async () => {
    mockSend.mockResolvedValue(
      createMockResponse('Define an interface for your props')
    );
    
    const input: MentorInput = {
      responseType: 'chat',
      question: 'How do I add TypeScript types?',
      conversationHistory: [],
    };

    const output = await mentor.getMentorResponse(input);
    expect(output.response).toBeTruthy();
    expect(output.responseType).toBe('chat');
    expect(output.timestamp).toBeGreaterThan(0);
  });

  it('should maintain conversation history', async () => {
    mockSend.mockResolvedValue(
      createMockResponse('Here is an example: interface Props { name: string; }')
    );
    
    const input: MentorInput = {
      responseType: 'chat',
      question: 'Can you give me an example?',
      conversationHistory: [
        { role: 'user', content: 'How do I add types?' },
        { role: 'assistant', content: 'Use an interface' },
      ],
    };

    const output = await mentor.getMentorResponse(input);
    expect(output.response).toBeTruthy();
  });

  it('should handle errors gracefully', async () => {
    mockSend.mockRejectedValue(new Error('Bedrock API error'));
    
    const input: MentorInput = {
      responseType: 'chat',
      question: 'Help me',
      conversationHistory: [],
    };

    await expect(mentor.getMentorResponse(input)).rejects.toThrow();
  });

  it('should provide task hints', async () => {
    mockSend.mockResolvedValue(
      createMockResponse('Think about what state you need to track')
    );

    const hint = await mentor.getTaskHint(
      'Create a counter',
      'Build a button that increments'
    );

    expect(hint).toBeTruthy();
    expect(hint.length).toBeGreaterThan(10);
  });

  it('should explain code snippets', async () => {
    mockSend.mockResolvedValue(
      createMockResponse('This uses array destructuring with useState')
    );

    const explanation = await mentor.explainCode(
      'const [count, setCount] = useState(0);',
      'What does this do?'
    );

    expect(explanation).toBeTruthy();
    expect(explanation.length).toBeGreaterThan(10);
  });

  it('should stream responses', async () => {
    const chunks = ['React ', 'hooks ', 'are ', 'great'];
    mockSend.mockResolvedValue(createMockStreamingResponse(chunks));

    const input: MentorInput = {
      responseType: 'chat',
      question: 'What are React hooks?',
      conversationHistory: [],
    };

    const receivedChunks: string[] = [];
    for await (const chunk of mentor.streamMentorResponse(input)) {
      receivedChunks.push(chunk);
    }

    expect(receivedChunks.length).toBeGreaterThan(0);
    expect(receivedChunks.join('')).toContain('React');
  });

  it('should handle streaming errors', async () => {
    mockSend.mockRejectedValue(new Error('Stream error'));

    const input: MentorInput = {
      responseType: 'chat',
      question: 'Help',
      conversationHistory: [],
    };

    const generator = mentor.streamMentorResponse(input);
    await expect(generator.next()).rejects.toThrow('Failed to stream mentor response');
  });
});

function createMockStreamingResponse(chunks: string[]) {
  const encoder = new TextEncoder();
  return {
    body: {
      async *[Symbol.asyncIterator]() {
        for (const text of chunks) {
          yield {
            chunk: {
              bytes: encoder.encode(JSON.stringify({
                type: 'content_block_delta',
                delta: { text },
              })),
            },
          };
        }
      },
    },
  };
}
