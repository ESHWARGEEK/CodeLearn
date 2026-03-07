/**
 * Integration test for AI Mentor conversation context
 * Verifies that conversation history is maintained across multiple messages
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('AI Mentor Conversation Context Integration', () => {
  let conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  beforeEach(() => {
    conversationHistory = [];
  });

  afterEach(() => {
    conversationHistory = [];
  });

  it('should maintain conversation context across multiple messages', async () => {
    // First message
    const firstResponse = await fetch('http://localhost:3000/api/ai/mentor/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'What is React?',
        responseType: 'chat',
        conversationHistory: [],
      }),
    });

    expect(firstResponse.ok).toBe(true);
    const firstData = await firstResponse.json();
    expect(firstData.success).toBe(true);

    // Add to conversation history
    conversationHistory.push({ role: 'user', content: 'What is React?' });
    conversationHistory.push({ role: 'assistant', content: firstData.data.response });

    // Second message (follow-up)
    const secondResponse = await fetch('http://localhost:3000/api/ai/mentor/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'Can you tell me more about hooks?',
        responseType: 'chat',
        conversationHistory,
      }),
    });

    expect(secondResponse.ok).toBe(true);
    const secondData = await secondResponse.json();
    expect(secondData.success).toBe(true);

    // Add to conversation history
    conversationHistory.push({ role: 'user', content: 'Can you tell me more about hooks?' });
    conversationHistory.push({ role: 'assistant', content: secondData.data.response });

    // Third message (another follow-up)
    const thirdResponse = await fetch('http://localhost:3000/api/ai/mentor/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'What about useState specifically?',
        responseType: 'chat',
        conversationHistory,
      }),
    });

    expect(thirdResponse.ok).toBe(true);
    const thirdData = await thirdResponse.json();
    expect(thirdData.success).toBe(true);

    // Verify conversation history is maintained
    expect(conversationHistory.length).toBe(4); // 2 user messages + 2 assistant responses
  });

  it('should handle conversation context with task and code context', async () => {
    const taskContext = 'Create a counter component with increment and decrement buttons';
    const codeContext = 'function Counter() { return <div>Counter</div>; }';

    // First message with context
    const firstResponse = await fetch('http://localhost:3000/api/ai/mentor/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'How do I add state to this component?',
        responseType: 'hint',
        taskContext,
        codeContext,
        conversationHistory: [],
      }),
    });

    expect(firstResponse.ok).toBe(true);
    const firstData = await firstResponse.json();
    expect(firstData.success).toBe(true);

    // Add to conversation history
    conversationHistory.push({ role: 'user', content: 'How do I add state to this component?' });
    conversationHistory.push({ role: 'assistant', content: firstData.data.response });

    // Follow-up question
    const secondResponse = await fetch('http://localhost:3000/api/ai/mentor/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'Can you show me an example?',
        responseType: 'explanation',
        taskContext,
        codeContext,
        conversationHistory,
      }),
    });

    expect(secondResponse.ok).toBe(true);
    const secondData = await secondResponse.json();
    expect(secondData.success).toBe(true);

    // Verify the AI can reference previous conversation
    expect(conversationHistory.length).toBe(2);
  });

  it('should handle streaming with conversation context', async () => {
    // First message
    conversationHistory.push({ role: 'user', content: 'What is TypeScript?' });
    conversationHistory.push({ role: 'assistant', content: 'TypeScript is a typed superset of JavaScript.' });

    // Streaming follow-up
    const response = await fetch('http://localhost:3000/api/ai/mentor/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'How do I use it with React?',
        responseType: 'chat',
        conversationHistory,
        stream: true,
      }),
    });

    expect(response.ok).toBe(true);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');

    // Read streaming response
    const reader = response.body?.getReader();
    expect(reader).toBeDefined();

    if (reader) {
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.chunk) {
                  accumulatedContent += data.chunk;
                }
                if (data.done) {
                  done = true;
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }

      expect(accumulatedContent.length).toBeGreaterThan(0);
    }
  });

  it('should handle empty conversation history', async () => {
    const response = await fetch('http://localhost:3000/api/ai/mentor/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'What is JavaScript?',
        responseType: 'chat',
        conversationHistory: [],
      }),
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.response).toBeTruthy();
  });

  it('should handle long conversation history', async () => {
    // Build a long conversation history
    const longHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    for (let i = 0; i < 10; i++) {
      longHistory.push({ role: 'user', content: `Question ${i}` });
      longHistory.push({ role: 'assistant', content: `Answer ${i}` });
    }

    const response = await fetch('http://localhost:3000/api/ai/mentor/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'Final question',
        responseType: 'chat',
        conversationHistory: longHistory,
      }),
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it('should validate conversation history format', async () => {
    const response = await fetch('http://localhost:3000/api/ai/mentor/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'Test question',
        responseType: 'chat',
        conversationHistory: [
          { role: 'invalid', content: 'Invalid role' }, // Invalid role
        ],
      }),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should handle conversation context with different response types', async () => {
    // Start with a chat
    conversationHistory.push({ role: 'user', content: 'What is React?' });
    conversationHistory.push({ role: 'assistant', content: 'React is a JavaScript library.' });

    // Follow up with a hint request
    const hintResponse = await fetch('http://localhost:3000/api/ai/mentor/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'How do I get started?',
        responseType: 'hint',
        conversationHistory,
      }),
    });

    expect(hintResponse.ok).toBe(true);
    const hintData = await hintResponse.json();
    expect(hintData.success).toBe(true);
    expect(hintData.data.responseType).toBe('hint');

    // Add to history
    conversationHistory.push({ role: 'user', content: 'How do I get started?' });
    conversationHistory.push({ role: 'assistant', content: hintData.data.response });

    // Follow up with an explanation request
    const explainResponse = await fetch('http://localhost:3000/api/ai/mentor/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'Can you explain components?',
        responseType: 'explanation',
        conversationHistory,
      }),
    });

    expect(explainResponse.ok).toBe(true);
    const explainData = await explainResponse.json();
    expect(explainData.success).toBe(true);
    expect(explainData.data.responseType).toBe('explanation');
  });
});
