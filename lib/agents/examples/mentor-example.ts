/**
 * Example usage of the Mentor Agent
 * 
 * This file demonstrates how to use the MentorAgent class
 * for providing hints, explanations, and chat responses.
 */

import { MentorAgent } from '../mentor-agent';
import { MentorInput } from '../types';

async function main() {
  const mentor = new MentorAgent();

  // Example 1: Get a hint for a task
  console.log('\n=== Example 1: Get Task Hint ===\n');
  
  const hint = await mentor.getTaskHint(
    'Create a React component',
    'Build a reusable Button component with props for variant and size',
    `import React from 'react';

export function Button() {
  return <button>Click me</button>;
}`
  );
  
  console.log('Hint:', hint);

  // Example 2: Explain code
  console.log('\n=== Example 2: Explain Code ===\n');
  
  const explanation = await mentor.explainCode(
    `const [count, setCount] = useState(0);`,
    'What does useState do?'
  );
  
  console.log('Explanation:', explanation);

  // Example 3: Chat with context
  console.log('\n=== Example 3: Chat with Context ===\n');
  
  const chatInput: MentorInput = {
    responseType: 'chat',
    question: 'How do I add TypeScript types to my component props?',
    taskContext: 'Building a Button component with variant and size props',
    codeContext: `export function Button({ variant, size }) {
  return <button className={\`btn-\${variant} btn-\${size}\`}>Click me</button>;
}`,
    conversationHistory: [],
  };
  
  const chatResponse = await mentor.getMentorResponse(chatInput);
  console.log('Response:', chatResponse.response);

  // Example 4: Streaming response
  console.log('\n=== Example 4: Streaming Response ===\n');
  
  const streamInput: MentorInput = {
    responseType: 'chat',
    question: 'What are React hooks and why should I use them?',
    conversationHistory: [],
  };
  
  process.stdout.write('Streaming: ');
  for await (const chunk of mentor.streamMentorResponse(streamInput)) {
    process.stdout.write(chunk);
  }
  console.log('\n');

  // Example 5: Conversation with history
  console.log('\n=== Example 5: Conversation with History ===\n');
  
  const conversationInput: MentorInput = {
    responseType: 'chat',
    question: 'Can you give me an example?',
    conversationHistory: [
      {
        role: 'user',
        content: 'What are React hooks?',
      },
      {
        role: 'assistant',
        content: 'React hooks are functions that let you use state and other React features in functional components.',
      },
    ],
  };
  
  const conversationResponse = await mentor.getMentorResponse(conversationInput);
  console.log('Response:', conversationResponse.response);
}

// Run examples if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { main as runMentorExamples };
