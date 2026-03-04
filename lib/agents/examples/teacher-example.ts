/**
 * Example usage of Teacher Agent
 * 
 * This file demonstrates how to use the Teacher Agent to generate
 * learning tasks from a GitHub repository.
 */

import { TeacherAgent } from '../teacher-agent';
import { TeacherInput } from '../types';

async function main() {
  console.log('=== Teacher Agent Example ===\n');

  // Initialize the agent
  const agent = new TeacherAgent();

  // Example 1: Generate tasks for a beginner React project
  console.log('Example 1: Beginner React Project');
  const beginnerInput: TeacherInput = {
    githubUrl: 'https://github.com/facebook/create-react-app',
    difficulty: 'beginner',
    technology: 'react',
  };

  try {
    const beginnerResult = await agent.generateTasks(beginnerInput);
    console.log(`\nProject: ${beginnerResult.projectName}`);
    console.log(`Difficulty: ${beginnerResult.difficulty}`);
    console.log(`Total Tasks: ${beginnerResult.tasks.length}`);
    console.log(`Estimated Hours: ${beginnerResult.estimatedHours}`);
    console.log('\nFirst 3 Tasks:');
    beginnerResult.tasks.slice(0, 3).forEach((task) => {
      console.log(`\n${task.order}. ${task.title}`);
      console.log(`   Description: ${task.description}`);
      console.log(`   Time: ${task.estimatedMinutes} minutes`);
      console.log(`   Hints: ${task.hints.length} hint(s)`);
    });
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('\n---\n');

  // Example 2: Generate tasks for an intermediate Next.js project
  console.log('Example 2: Intermediate Next.js Project');
  const intermediateInput: TeacherInput = {
    githubUrl: 'https://github.com/vercel/next.js/tree/canary/examples/blog-starter',
    difficulty: 'intermediate',
    technology: 'nextjs',
  };

  try {
    const intermediateResult = await agent.generateTasks(intermediateInput);
    console.log(`\nProject: ${intermediateResult.projectName}`);
    console.log(`Difficulty: ${intermediateResult.difficulty}`);
    console.log(`Total Tasks: ${intermediateResult.tasks.length}`);
    console.log(`Estimated Hours: ${intermediateResult.estimatedHours}`);
    console.log('\nTask Breakdown:');
    intermediateResult.tasks.forEach((task) => {
      console.log(`${task.order}. ${task.title} (${task.estimatedMinutes}min)`);
    });
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('\n---\n');

  // Example 3: Generate tasks for an advanced project
  console.log('Example 3: Advanced Full-Stack Project');
  const advancedInput: TeacherInput = {
    githubUrl: 'https://github.com/vercel/commerce',
    difficulty: 'advanced',
    technology: 'nextjs',
  };

  try {
    const advancedResult = await agent.generateTasks(advancedInput);
    console.log(`\nProject: ${advancedResult.projectName}`);
    console.log(`Difficulty: ${advancedResult.difficulty}`);
    console.log(`Total Tasks: ${advancedResult.tasks.length}`);
    console.log(`Estimated Hours: ${advancedResult.estimatedHours}`);
    
    // Show learning objectives
    console.log('\nLearning Objectives (First Task):');
    advancedResult.tasks[0].learningObjectives.forEach((obj) => {
      console.log(`- ${obj}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

export { main as runTeacherExample };
