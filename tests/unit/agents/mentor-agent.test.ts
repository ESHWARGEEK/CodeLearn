import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MentorAgent } from '@/lib/agents/mentor-agent';
import { MentorInput } from '@/lib/agents/types';

const mockSend = vi.fn();
vi.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: vi.fn(() => ({ send: mockSend })),
  InvokeModelWithResponseStreamCommand: vi.fn(),
}));

describe('MentorAgent', () => {
  let mentor: MentorAgent;
  beforeEach(() => {
    mentor = new MentorAgent();
    mockSend.mockReset();
  });

  it('should generate hints', async () => {
    mockSend.mockResolvedValue(createMockResponse('Use useState'));
    const output = await mentor.getMentorResponse({
      responseType: 'hint',
      question: 'How to make button interactive?',
      conversationHistory: [],
    });
    expect(output.response).toBeTruthy();
    expect(output.responseType).toBe('hint');
  });

  it('should explain code', async () => {
    mockSend.mockResolvedValue(createMockResponse('useState is a Hook'));
    const output = await mentor.getMentorResponse({
      responseType: 'explanation',
      question: 'What is useState?',
      conversationHistory: [],
    });
    expect(output.response).toBeTruthy();
    expect(output.responseType).toBe('explanation');
  });

  it('should chat', async () => {
    mockSend.mockResolvedValue(createMockResponse('Use interface'));
    const output = await mentor.getMentorResponse({
      responseType: 'chat',
      question: 'How to add types?',
      conversationHistory: [],
    });
    expect(output.response).toBeTruthy();
    expect(output.timestamp).toBeGreaterThan(0);
  });

  it('should provide task hints', async () => {
    mockSend.mockResolvedValue(createMockResponse('Think about state'));
    const hint = await mentor.getTaskHint('Counter', 'Build counter');
    expect(hint).toBeTruthy();
  });

  it('should explain code snippets', async () => {
    mockSend.mockResolvedValue(createMockResponse('Array destructuring'));
    const exp = await mentor.explainCode('const [x] = useState(0);');
    expect(exp).toBeTruthy();
  });

  it('should stream responses', async () => {
    mockSend.mockResolvedValue(createStreamResponse(['Hi ', 'there']));
    const chunks: string[] = [];
    for await (const chunk of mentor.streamMentorResponse({
      responseType: 'chat',
      question: 'Test',
      conversationHistory: [],
    })) {
      chunks.push(chunk);
    }
    expect(chunks.length).toBeGreaterThan(0);
  });

  it('should handle errors', async () => {
    mockSend.mockRejectedValue(new Error('API error'));
    await expect(mentor.getMentorResponse({
      responseType: 'chat',
      question: 'Test',
      conversationHistory: [],
    })).rejects.toThrow();
  });
});

function createMockResponse(text: string) {
  const encoder = new TextEncoder();
  return {
    body: {
      async *[Symbol.asyncIterator]() {
        yield {
          chunk: {
            bytes: encoder.encode(JSON.stringify({
              type: 'content_block_delta',
              delta: { text },
            })),
          },
        };
      },
    },
  };
}

function createStreamResponse(chunks: string[]) {
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
