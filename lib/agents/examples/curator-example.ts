/**
 * Example usage of the Curator Agent
 * 
 * This file demonstrates how to use the Curator Agent to discover
 * and evaluate GitHub repositories for learning paths.
 * 
 * Note: This is for demonstration purposes only. In production,
 * the Curator Agent will be called from the AI Worker Service.
 */

import { CuratorAgent } from '../curator-agent';
import type { CuratorInput, DifficultyLevel } from '../types';

async function main() {
  // Initialize the Curator Agent
  const agent = new CuratorAgent();

  // Example 1: Curate React repositories for beginners
  console.log('\n=== Example 1: React for Beginners ===\n');
  
  const reactBeginner: CuratorInput = {
    technology: 'react',
    difficulty: 'beginner',
  };

  try {
    const result = await agent.curate(reactBeginner);
    
    console.log(`Found ${result.repositories.length} repositories for ${result.technology} (${result.difficulty})`);
    console.log('\nTop Repositories:');
    
    result.repositories.forEach((repo, index) => {
      console.log(`\n${index + 1}. ${repo.name}`);
      console.log(`   Description: ${repo.description}`);
      console.log(`   Stars: ${repo.stars}`);
      console.log(`   Educational Value: ${repo.educationalValue}/100`);
      console.log(`   Estimated Hours: ${repo.estimatedHours}`);
      console.log(`   Tech Stack: ${repo.techStack.join(', ')}`);
      console.log(`   URL: ${repo.githubUrl}`);
    });
  } catch (error) {
    console.error('Error curating React repositories:', error);
  }

  // Example 2: Curate Next.js repositories for intermediate learners
  console.log('\n\n=== Example 2: Next.js for Intermediate ===\n');
  
  const nextjsIntermediate: CuratorInput = {
    technology: 'next.js',
    difficulty: 'intermediate',
  };

  try {
    const result = await agent.curate(nextjsIntermediate);
    
    console.log(`Found ${result.repositories.length} repositories for ${result.technology} (${result.difficulty})`);
    console.log('\nTop Repositories:');
    
    result.repositories.forEach((repo, index) => {
      console.log(`\n${index + 1}. ${repo.name}`);
      console.log(`   Educational Value: ${repo.educationalValue}/100`);
      console.log(`   README Quality: ${repo.readmeQuality}/100`);
      console.log(`   Code Structure: ${repo.codeStructure}/100`);
      console.log(`   Test Coverage: ${repo.testCoverage}/100`);
    });
  } catch (error) {
    console.error('Error curating Next.js repositories:', error);
  }

  // Example 3: Curate Python repositories for advanced learners
  console.log('\n\n=== Example 3: Python for Advanced ===\n');
  
  const pythonAdvanced: CuratorInput = {
    technology: 'python',
    difficulty: 'advanced',
  };

  try {
    const result = await agent.curate(pythonAdvanced);
    
    console.log(`Found ${result.repositories.length} repositories for ${result.technology} (${result.difficulty})`);
    console.log('\nTop Repositories:');
    
    result.repositories.forEach((repo, index) => {
      console.log(`\n${index + 1}. ${repo.name} (${repo.stars} ⭐)`);
      console.log(`   ${repo.description}`);
    });
  } catch (error) {
    console.error('Error curating Python repositories:', error);
  }
}

// Run the examples
if (require.main === module) {
  main().catch(console.error);
}

export { main };
