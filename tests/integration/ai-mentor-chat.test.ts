import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('POST /api/ai/mentor/chat - Integration Tests', () => {
  const baseUrl = process.env.TEST_API_URL || 'http://localhost:3000';

  describe('End-to-End Chat Flow', () => {
    it('should handle a complete chat conversation', async () => {
      // First message
      const response1 = await fetch(`${baseUrl}/api/ai/mentor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'What is React?',
          responseType: 'chat',
        }),
      });

      expect(response1.status).toBe(200);
      const data1 = await response1.json();
      expect(data1.success).toBe(true);
      expect(data1.data.response).toBeDefined();
      expect(typeof data1.data.response).toBe('string');

      // Follow-up message with conversation history
      const response2 = await fetch(`${baseUrl}/api/ai/mentor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'Can you tell me more about hooks?',
          responseType: 'chat',
          conversationHistory: [
            { role: 'user', content: 'What is React?' },
            { role: 'assistant', content: data1.data.response },
          ],
        }),
      });

      expect(response2.status).toBe(200);
      const data2 = await response2.json();
      expect(data2.success).toBe(true);
      expect(data2.data.response).toBeDefined();
    });

    it('should provide hints without revealing solutions', async () => {
      const response = await fetch(`${baseUrl}/api/ai/mentor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'I need help with this task',
          responseType: 'hint',
          taskContext: 'Create a counter component that increments on button click',
          codeContext: 'function Counter() { return <div>Counter</div>; }',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.response).toBeDefined();
      expect(data.data.responseType).toBe('hint');
    });

    it('should explain code concepts', async () => {
      const response = await fetch(`${baseUrl}/api/ai/mentor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'Explain this code',
          responseType: 'explanation',
          codeContext: 'const [count, setCount] = useState(0);',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.response).toBeDefined();
      expect(data.data.responseType).toBe('explanation');
    });
  });

  describe('Response Time Requirements', () => {
    it('should respond within 3 seconds for simple questions', async () => {
      const startTime = Date.now();

      const response = await fetch(`${baseUrl}/api/ai/mentor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'What is a React component?',
          responseType: 'chat',
        }),
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(3000); // 3 seconds
    });
  });

  describe('Context Handling', () => {
    it('should handle requests with task context', async () => {
      const response = await fetch(`${baseUrl}/api/ai/mentor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'How should I approach this task?',
          responseType: 'chat',
          taskContext:
            'Task: Create a login form with email and password validation',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.response).toBeDefined();
    });

    it('should handle requests with code context', async () => {
      const response = await fetch(`${baseUrl}/api/ai/mentor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'Is this code correct?',
          responseType: 'chat',
          codeContext: `
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  return (
    <form>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
          `,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.response).toBeDefined();
    });

    it('should handle requests with both task and code context', async () => {
      const response = await fetch(`${baseUrl}/api/ai/mentor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'Am I on the right track?',
          responseType: 'hint',
          taskContext: 'Add form validation to the login form',
          codeContext: 'function LoginForm() { /* ... */ }',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe('Conversation History', () => {
    it('should maintain context across multiple messages', async () => {
      const conversationHistory = [
        { role: 'user' as const, content: 'What is useState?' },
        {
          role: 'assistant' as const,
          content: 'useState is a React Hook that lets you add state to function components.',
        },
        { role: 'user' as const, content: 'How do I use it?' },
        {
          role: 'assistant' as const,
          content: 'You call useState with an initial value and it returns an array.',
        },
      ];

      const response = await fetch(`${baseUrl}/api/ai/mentor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'Can you show me an example?',
          responseType: 'chat',
          conversationHistory,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.response).toBeDefined();
    });
  });

  describe('Error Scenarios', () => {
    it('should handle malformed JSON', async () => {
      const response = await fetch(`${baseUrl}/api/ai/mentor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });

      expect(response.status).toBe(400);
    });

    it('should handle missing required fields', async () => {
      const response = await fetch(`${baseUrl}/api/ai/mentor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responseType: 'chat',
          // missing question
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle invalid response type', async () => {
      const response = await fetch(`${baseUrl}/api/ai/mentor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'Test question',
          responseType: 'invalid_type',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Response Format', () => {
    it('should return correct response structure', async () => {
      const response = await fetch(`${baseUrl}/api/ai/mentor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'What is React?',
          responseType: 'chat',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('response');
      expect(data.data).toHaveProperty('responseType');
      expect(data.data).toHaveProperty('timestamp');
      expect(typeof data.data.response).toBe('string');
      expect(typeof data.data.timestamp).toBe('number');
    });

    it('should include error details in error responses', async () => {
      const response = await fetch(`${baseUrl}/api/ai/mentor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: '',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(data.success).toBe(false);
      expect(data).toHaveProperty('error');
      expect(data.error).toHaveProperty('code');
      expect(data.error).toHaveProperty('message');
      expect(data.error).toHaveProperty('timestamp');
      expect(data.error).toHaveProperty('requestId');
    });
  });
});
