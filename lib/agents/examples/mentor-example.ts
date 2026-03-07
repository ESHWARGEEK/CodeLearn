/**
 * Example usage of the Mentor Agent
 * 
 * This file demonstrates how to use the MentorAgent class
 * for providing hints, explanations, and chat responses.
 */

import { MentorAgent } from '../mentor-agent';

async function main() {
  const mentor = new MentorAgent();

  // Example 1: Process a message for task help
  console.log('\n=== Example 1: Get Task Help ===\n');
  
  const taskHelp = await mentor.processMessage(
    'I need help creating a React component',
    {
      task: 'Build a reusable Button component with props for variant and size',
      code: `import React from 'react';

export function Button() {
  return <button>Click me</button>;
}`
    }
  );
  
  console.log('Response:', taskHelp.response);

  // Example 2: Process a message for code explanation
  console.log('\n=== Example 2: Explain Code ===\n');
  
  const explanation = await mentor.processMessage(
    'What does useState do?',
    {
      code: `const [count, setCount] = useState(0);`
    }
  );
  
  console.log('Response:', explanation.response);

  // Example 3: General chat
  console.log('\n=== Example 3: General Chat ===\n');
  
  const chatResponse = await mentor.processMessage(
    'How do I add TypeScript types to my component props?',
    {
      task: 'Building a Button component with variant and size props',
      code: `export function Button({ variant, size }) {
  return <button className={\`btn-\${variant} btn-\${size}\`}>Click me</button>;
}`
    }
  );
  
  console.log('Response:', chatResponse.response);
}

// Run examples if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { main as runMentorExamples };
