import { BaseAgent, ModelConfig } from './base-agent';
import { MentorChatJob } from '../types/job';

interface MentorResponse {
  message: string;
  suggestions: Array<{
    type: 'resource' | 'exercise' | 'concept' | 'debugging';
    title: string;
    description: string;
    action?: string;
  }>;
  followUpQuestions: string[];
  encouragement: string;
  learningPath?: {
    currentTopic: string;
    nextSteps: string[];
    estimatedTime: string;
  };
}

export class MentorAgent extends BaseAgent {
  private readonly modelConfig: ModelConfig = {
    modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    maxTokens: 2500,
    temperature: 0.6,
    topP: 0.9,
  };

  async processJob(job: MentorChatJob): Promise<MentorResponse> {
    this.logger.info('Processing mentor chat job', {
      jobId: job.jobId,
      messageLength: job.payload.message.length,
      hasHistory: !!job.payload.conversationHistory,
      hasContext: !!job.payload.context,
    });

    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(job.payload);

    const response = await this.retryWithBackoff(async () => {
      return await this.invokeModel(userPrompt, this.modelConfig, systemPrompt);
    });

    const mentorResponse = this.parseMentorResponse(response);
    this.validateMentorResponse(mentorResponse);

    this.logger.info('Mentor chat completed', {
      jobId: job.jobId,
      responseLength: mentorResponse.message.length,
      suggestionCount: mentorResponse.suggestions.length,
    });

    return mentorResponse;
  }

  private buildSystemPrompt(): string {
    return `You are an experienced programming mentor and teacher. Your role is to guide, encourage, and educate developers at all skill levels. Your mentoring style is:

1. **Supportive & Encouraging** - Build confidence and maintain motivation
2. **Socratic** - Ask questions that lead to discovery rather than giving direct answers
3. **Practical** - Focus on real-world applications and hands-on learning
4. **Adaptive** - Adjust your communication style to the learner's level
5. **Holistic** - Consider both technical skills and career development

Key principles:
- Never just give the answer - guide the learner to discover it
- Provide context and explain the "why" behind concepts
- Offer multiple learning paths and resources
- Celebrate progress and learning milestones
- Address both technical and emotional aspects of learning
- Encourage experimentation and learning from mistakes

Always respond with valid JSON in the exact format specified. Your goal is to be the mentor you wish you had when learning to code.`;
  }

  private buildUserPrompt(payload: any): string {
    const { message, conversationHistory, context } = payload;

    let prompt = `**Student Message:**
${message}`;

    if (conversationHistory && conversationHistory.length > 0) {
      prompt += `\n\n**Conversation History:**`;
      conversationHistory.slice(-5).forEach((msg: any) => {
        prompt += `\n${msg.role}: ${msg.content}`;
      });
    }

    if (context) {
      prompt += `\n\n**Learning Context:**`;
      if (context.currentProject) {
        prompt += `\nCurrent Project: ${context.currentProject}`;
      }
      if (context.learningPath) {
        prompt += `\nLearning Path: ${context.learningPath}`;
      }
      if (context.userLevel) {
        prompt += `\nUser Level: ${context.userLevel}`;
      }
    }

    prompt += `

Respond as a supportive programming mentor with a JSON object in this exact format:
{
  "message": "Your encouraging and educational response to the student",
  "suggestions": [
    {
      "type": "resource",
      "title": "Suggestion Title",
      "description": "Brief description of the suggestion",
      "action": "Specific action the student can take"
    }
  ],
  "followUpQuestions": [
    "Thought-provoking question to guide learning",
    "Question to check understanding"
  ],
  "encouragement": "Specific, genuine encouragement based on their progress",
  "learningPath": {
    "currentTopic": "What they're working on now",
    "nextSteps": ["Next learning milestone", "Follow-up concept"],
    "estimatedTime": "Realistic time estimate"
  }
}

Requirements:
- Provide a warm, encouraging response that addresses their specific question
- Include 2-4 practical suggestions (resources, exercises, concepts, or debugging tips)
- Ask 1-3 follow-up questions that promote deeper thinking
- Give specific, genuine encouragement
- If applicable, provide learning path guidance with realistic next steps
- Adapt your language and suggestions to their apparent skill level
- Focus on building understanding, not just solving the immediate problem`;

    return prompt;
  }

  private parseMentorResponse(response: string): MentorResponse {
    try {
      const cleanResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleanResponse);
      
      if (!parsed.message || !parsed.suggestions || !Array.isArray(parsed.suggestions)) {
        throw new Error('Invalid mentor response structure');
      }

      return parsed as MentorResponse;
    } catch (error) {
      this.logger.error('Failed to parse mentor response', {
        error: error instanceof Error ? error.message : String(error),
        responseLength: response.length,
        responsePreview: response.substring(0, 200),
      });
      
      throw new Error('Failed to parse AI response into valid mentor response');
    }
  }

  private validateMentorResponse(response: MentorResponse): void {
    // Validate basic structure
    if (!response.message || response.message.length < 20) {
      throw new Error('Mentor message is too short');
    }

    if (!response.suggestions || response.suggestions.length < 1) {
      throw new Error('Mentor response must have at least one suggestion');
    }

    if (!response.followUpQuestions || response.followUpQuestions.length < 1) {
      throw new Error('Mentor response must have at least one follow-up question');
    }

    if (!response.encouragement || response.encouragement.length < 10) {
      throw new Error('Encouragement message is too short');
    }

    // Validate suggestions
    const validSuggestionTypes = ['resource', 'exercise', 'concept', 'debugging'];
    for (const suggestion of response.suggestions) {
      if (!suggestion.type || !validSuggestionTypes.includes(suggestion.type)) {
        throw new Error(`Invalid suggestion type: ${suggestion.type}`);
      }

      if (!suggestion.title || !suggestion.description) {
        throw new Error('Suggestion missing required fields');
      }
    }

    // Validate learning path if provided
    if (response.learningPath) {
      if (!response.learningPath.currentTopic || !response.learningPath.nextSteps) {
        throw new Error('Learning path missing required fields');
      }

      if (!Array.isArray(response.learningPath.nextSteps) || response.learningPath.nextSteps.length < 1) {
        throw new Error('Learning path must have at least one next step');
      }
    }

    this.logger.debug('Mentor response validation passed', {
      messageLength: response.message.length,
      suggestionCount: response.suggestions.length,
      followUpQuestionCount: response.followUpQuestions.length,
      hasLearningPath: !!response.learningPath,
    });
  }
}