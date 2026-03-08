/**
 * Example usage of Code Agent
 * Demonstrates how to analyze a GitHub repository and extract reusable components
 */

import { CodeAgent } from '../code-agent';

async function exampleCodeAnalysis() {
  const codeAgent = new CodeAgent();

  try {
    // Example: Analyze a popular React component library
    const result = await codeAgent.extractComponents({
      githubUrl: 'https://github.com/shadcn-ui/ui',
    });

    console.log('Repository Info:', result.repositoryInfo);
    console.log(`Found ${result.components.length} extractable components:`);

    result.components.forEach((component, index) => {
      console.log(`\n${index + 1}. ${component.name}`);
      console.log(`   Category: ${component.category}`);
      console.log(`   Complexity: ${component.complexity}`);
      console.log(`   File: ${component.filePath}`);
      console.log(`   Description: ${component.description}`);
      console.log(`   Dependencies: ${component.dependencies.join(', ')}`);
    });

    return result;
  } catch (error) {
    console.error('Code analysis failed:', error);
    throw error;
  }
}

// Example with specific component path
async function exampleSpecificComponent() {
  const codeAgent = new CodeAgent();

  try {
    const result = await codeAgent.extractComponents({
      githubUrl: 'https://github.com/vercel/next.js',
      componentPath: 'packages/next/src/client/components',
    });

    console.log('Specific component analysis:', result);
    return result;
  } catch (error) {
    console.error('Specific component analysis failed:', error);
    throw error;
  }
}

export { exampleCodeAnalysis, exampleSpecificComponent };