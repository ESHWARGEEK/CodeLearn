/**
 * Mentor Agent - Provides explanations, hints, and answers questions
 * Model: Claude 3.5 Sonnet (conversational and educational)
 * 
 * Process:
 * 1. Understand user question and context
 * 2. Generate appropriate response (hint vs full explanation)
 * 3. Maintain conversation history for follow-ups
 * 4. Stream response for perceived speed
 */

import { BedrockRuntimeClient, InvokeModelWithResponseStreamCommand } from '@aws-sdk/client-bedrock-runtime';
import {
  MentorInput,
  MentorOutput,
  ConversationMessage,
  MentorResponseType,
} from './types';

export class MentorAgent {
  private bedrockClient: BedrockRuntimeClient;
  private readonly MODEL_ID = 'anthropic.claude-3-5-sonnet-20241022-v2:0';

  constructor() {
    // Initialize AWS Bedrock client
    this.bedrockClient = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  /**
   * Main method to get AI mentor response
   */
  async getMentorResponse(input: MentorInput): Promise<MentorOutput> {
    console.log(`[MentorAgent] Processing ${input.responseType} request`);

    // Build the prompt based on response type
    const prompt = this.buildPrompt(input);

    // Get response from Claude (non-streaming for simple API)
    const response = await this.invokeClaude(prompt, input.conversationHistory);

    return {
      response,
      responseType: input.responseType,
      timestamp: Date.now(),
    };
  }

  /**
   * Stream AI mentor response for real-time chat
   */
  async *streamMentorResponse(input: MentorInput): AsyncGenerator<string, void, unknown> {
    console.log(`[MentorAgent] Streaming ${input.responseType} request`);

    // Build the prompt based on response type
    const prompt = this.buildPrompt(input);

    // Stream response from Claude
    yield* this.streamClaude(prompt, input.conversationHistory);
  }

  /**
   * Build prompt based on request type and context
   */
  private buildPrompt(input: MentorInput): string {
    const { responseType, question, codeContext, taskContext } = input;

    switch (responseType) {
      case 'hint':
        return this.buildHintPrompt(question, taskContext, codeContext);
      
      case 'explanation':
        return this.buildExplanationPrompt(question, codeContext);
      
      case 'chat':
        return this.buildChatPrompt(question, taskContext, codeContext);
      
      default:
        return this.buildChatPrompt(question, taskContext, codeContext);
    }
  }

  /**
   * Build prompt for hint request
   */
  private buildHintPrompt(
    question: string,
    taskContext?: string,
    codeContext?: string
  ): string {
    return `You are a helpful programming mentor providing hints to a learner. Your goal is to guide them toward the solution WITHOUT revealing the complete answer.

**Current Task:**
${taskContext || 'No task context provided'}

**User's Code:**
\`\`\`
${codeContext || 'No code provided yet'}
\`\`\`

**User's Question:**
${question}

**Your Role:**
- Provide a helpful hint that guides them in the right direction
- DO NOT give the complete solution or write the code for them
- Ask guiding questions to help them think through the problem
- Reference documentation or concepts they should review
- Keep your hint concise (2-3 sentences)

Provide your hint now:`;
  }

  /**
   * Build prompt for explanation request
   */
  private buildExplanationPrompt(question: string, codeContext?: string): string {
    return `You are a helpful programming mentor explaining code concepts to a learner.

**Code to Explain:**
\`\`\`
${codeContext || 'No code provided'}
\`\`\`

**User's Question:**
${question}

**Your Role:**
- Explain the code concept in simple, clear terms
- Break down complex ideas into understandable parts
- Use analogies or examples when helpful
- Highlight key concepts and best practices
- Keep your explanation concise but thorough

Provide your explanation now:`;
  }

  /**
   * Build prompt for general chat
   */
  private buildChatPrompt(
    question: string,
    taskContext?: string,
    codeContext?: string
  ): string {
    let contextSection = '';

    if (taskContext) {
      contextSection += `**Current Task:**
${taskContext}

`;
    }

    if (codeContext) {
      contextSection += `**User's Code:**
\`\`\`
${codeContext}
\`\`\`

`;
    }

    return `You are a helpful programming mentor assisting a learner. You provide clear, educational responses that help them learn and grow as a developer.

${contextSection}**User's Question:**
${question}

**Your Role:**
- Answer their question clearly and helpfully
- Provide educational value in your response
- Encourage good programming practices
- Be supportive and patient
- If they're stuck, guide them toward the solution rather than giving it away
- Keep responses concise but informative

Provide your response now:`;
  }

  /**
   * Invoke Claude 3.5 Sonnet via AWS Bedrock (non-streaming)
   */
  private async invokeClaude(
    prompt: string,
    conversationHistory: ConversationMessage[] = []
  ): Promise<string> {
    // Build messages array with conversation history
    const messages = [
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: prompt,
      },
    ];

    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 2048,
      temperature: 0.7,
      messages,
    };

    const command = new InvokeModelWithResponseStreamCommand({
      modelId: this.MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    const response = await this.bedrockClient.send(command);

    // Collect streaming response
    let fullResponse = '';
    
    if (response.body) {
      for await (const event of response.body) {
        if (event.chunk) {
          const chunk = JSON.parse(new TextDecoder().decode(event.chunk.bytes));
          
          if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
            fullResponse += chunk.delta.text;
          }
        }
      }
    }

    return fullResponse;
  }

  /**
   * Stream Claude 3.5 Sonnet response via AWS Bedrock
   */
  private async *streamClaude(
    prompt: string,
    conversationHistory: ConversationMessage[] = []
  ): AsyncGenerator<string, void, unknown> {
    // Build messages array with conversation history
    const messages = [
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: prompt,
      },
    ];

    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 2048,
      temperature: 0.7,
      messages,
    };

    const command = new InvokeModelWithResponseStreamCommand({
      modelId: this.MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    try {
      const response = await this.bedrockClient.send(command);

      if (response.body) {
        for await (const event of response.body) {
          if (event.chunk) {
            const chunk = JSON.parse(new TextDecoder().decode(event.chunk.bytes));
            
            if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
              yield chunk.delta.text;
            }
          }
        }
      }
    } catch (error) {
      console.error('[MentorAgent] Streaming error:', error);
      throw new Error('Failed to stream mentor response');
    }
  }

  /**
   * Get a quick hint for a specific task
   */
  async getTaskHint(taskTitle: string, taskDescription: string, userCode?: string): Promise<string> {
    const input: MentorInput = {
      responseType: 'hint',
      question: 'I need a hint for this task',
      taskContext: `${taskTitle}\n\n${taskDescription}`,
      codeContext: userCode,
      conversationHistory: [],
    };

    const output = await this.getMentorResponse(input);
    return output.response;
  }

  /**
   * Explain a code snippet
   */
  async explainCode(code: string, specificQuestion?: string): Promise<string> {
    const input: MentorInput = {
      responseType: 'explanation',
      question: specificQuestion || 'Please explain this code',
      codeContext: code,
      conversationHistory: [],
    };

    const output = await this.getMentorResponse(input);
    return output.response;
  }
}
