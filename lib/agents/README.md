# AI Agents

This directory contains AI agents for the CodeLearn platform. Each agent is specialized for specific tasks and uses AWS Bedrock for AI capabilities.

## Curator Agent

The Curator Agent discovers and evaluates GitHub repositories for learning paths.

### Features

- **GitHub Integration**: Searches GitHub API for repositories matching technology
- **Smart Filtering**: Filters by stars (>50), recent activity (<6 months), documentation quality
- **AI Ranking**: Uses Llama 3.1 70B to rank repositories by educational value
- **Metadata Enrichment**: Analyzes README quality, code structure, and test coverage
- **Difficulty-Aware**: Provides recommendations tailored to beginner, intermediate, or advanced learners

### Usage

```typescript
import { CuratorAgent } from '@/lib/agents';

const agent = new CuratorAgent();

const result = await agent.curate({
  technology: 'react',
  difficulty: 'beginner',
});

console.log(result.repositories); // Top 3 curated repositories
```

### Configuration

The Curator Agent requires the following environment variables:

- `AWS_REGION`: AWS region for Bedrock (default: us-east-1)
- `GITHUB_TOKEN`: GitHub personal access token for API access

### Output Format

```typescript
{
  repositories: [
    {
      id: "123456",
      name: "awesome-react-app",
      description: "A beginner-friendly React application",
      githubUrl: "https://github.com/user/awesome-react-app",
      stars: 1250,
      lastUpdated: "2024-02-15T10:30:00Z",
      hasDocumentation: true,
      readmeQuality: 85,
      codeStructure: 78,
      testCoverage: 65,
      educationalValue: 82,
      techStack: ["TypeScript", "react", "tailwindcss"],
      estimatedHours: 10
    }
  ],
  technology: "react",
  difficulty: "beginner",
  generatedAt: 1709251200000
}
```

### Ranking Algorithm

The Curator Agent uses a multi-stage ranking process:

1. **GitHub Search**: Searches for repositories with >50 stars and recent activity
2. **Basic Filtering**: Removes archived repos and those without descriptions
3. **Metadata Enrichment**: Analyzes README, code structure, and test coverage
4. **AI Ranking**: Uses Llama 3.1 to evaluate educational value based on:
   - README quality and documentation
   - Code structure and organization
   - Presence of tests and examples
   - Project complexity and scope
   - Real-world applicability
   - Difficulty level appropriateness

### Caching

Results are cached in DynamoDB with a 24-hour TTL to reduce API calls and improve performance.

### Cost Optimization

The Curator Agent uses Llama 3.1 70B instead of Claude 3.5 Sonnet for cost optimization, as the ranking task is relatively simple and doesn't require complex reasoning.

## Future Agents

- **Teacher Agent**: Generates learning content and task breakdowns (Claude 3.5 Sonnet)
- **Code Agent**: Extracts templates and performs code integration (Claude 3.5 Sonnet)
- **Mentor Agent**: Provides explanations and answers questions (Claude 3.5 Sonnet)
