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

## Teacher Agent

The Teacher Agent generates learning content and task breakdowns from GitHub repositories.

### Features

- **Repository Analysis**: Fetches and analyzes GitHub repository structure
- **Framework Detection**: Automatically detects React, Next.js, Vue, Angular, and more
- **Intelligent Task Generation**: Uses Claude 3.5 Sonnet to create 10-15 sequential learning tasks
- **Difficulty-Aware**: Tailors tasks to beginner, intermediate, or advanced learners
- **Comprehensive Metadata**: Includes hints, learning objectives, and time estimates

### Usage

```typescript
import { TeacherAgent } from '@/lib/agents';

const agent = new TeacherAgent();

const result = await agent.generateTasks({
  githubUrl: 'https://github.com/vercel/next.js/tree/canary/examples/blog-starter',
  difficulty: 'intermediate',
  technology: 'nextjs',
});

console.log(result.tasks); // 10-15 sequential tasks
console.log(result.estimatedHours); // Total learning time
```

### Configuration

The Teacher Agent requires the following environment variables:

- `AWS_REGION`: AWS region for Bedrock (default: us-east-1)
- `GITHUB_TOKEN`: GitHub personal access token for API access

### Output Format

```typescript
{
  projectId: "vercel-blog-starter",
  projectName: "Blog Starter",
  githubUrl: "https://github.com/vercel/next.js/tree/canary/examples/blog-starter",
  difficulty: "intermediate",
  tasks: [
    {
      taskId: "task-1",
      title: "Set up Next.js project structure",
      description: "Initialize a new Next.js project with TypeScript and configure the basic folder structure",
      order: 1,
      estimatedMinutes: 20,
      hints: [
        "Use create-next-app with TypeScript template",
        "Set up src/ directory with components/, pages/, and lib/ folders"
      ],
      learningObjectives: [
        "Understand Next.js project initialization",
        "Learn folder structure best practices"
      ],
      completed: false
    }
  ],
  estimatedHours: 12,
  generatedAt: 1709251200000
}
```

### Task Generation Process

The Teacher Agent uses a multi-stage process:

1. **Repository Fetching**: Gets the complete file structure from GitHub
2. **Framework Detection**: Identifies the framework (React, Next.js, Vue, etc.)
3. **Dependency Analysis**: Analyzes package.json for key dependencies
4. **Structure Analysis**: Identifies components, pages, API routes, styles, and tests
5. **AI Task Generation**: Uses Claude 3.5 Sonnet to generate tasks based on:
   - Repository structure and complexity
   - Detected framework and patterns
   - Target difficulty level
   - Educational best practices
6. **Task Validation**: Ensures tasks are properly ordered, timed, and enriched

### Difficulty Levels

**Beginner:**
- Simple, well-documented steps
- Detailed explanations
- 15-30 minute tasks
- Focus on fundamentals

**Intermediate:**
- Moderate complexity
- Real-world patterns
- 30-45 minute tasks
- Focus on practical skills

**Advanced:**
- Complex architectures
- Production-ready practices
- 30-60 minute tasks
- Focus on optimization and scalability

### Caching

Results are cached in DynamoDB with a 24-hour TTL per repository to reduce API calls and improve performance.

### Model Selection

The Teacher Agent uses Claude 3.5 Sonnet for complex reasoning required to:
- Understand repository structure and patterns
- Generate coherent learning sequences
- Create educational content with appropriate difficulty
- Provide helpful hints without revealing solutions

## Future Agents

- **Code Agent**: Extracts templates and performs code integration (Claude 3.5 Sonnet)
- **Mentor Agent**: Provides explanations and answers questions (Claude 3.5 Sonnet)
