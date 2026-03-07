import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { MentorAgent } from '@/lib/agents/mentor-agent';
import { MentorInput, MentorResponseType } from '@/lib/agents/types';

// Validation schema
const ChatRequestSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  responseType: z.enum(['hint', 'explanation', 'chat']).default('chat'),
  taskContext: z.string().optional(),
  codeContext: z.string().optional(),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .default([]),
  stream: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = ChatRequestSchema.safeParse(body);

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: firstError?.message || 'Validation failed',
            details: validationResult.error.errors,
            timestamp: new Date().toISOString(),
            requestId: uuidv4(),
          },
        },
        { status: 400 }
      );
    }

    const { question, responseType, taskContext, codeContext, conversationHistory, stream } =
      validationResult.data;

    // Initialize Mentor Agent
    const mentorAgent = new MentorAgent();

    // Build input for mentor agent
    const mentorInput: MentorInput = {
      responseType: responseType as MentorResponseType,
      question,
      taskContext,
      codeContext,
      conversationHistory,
    };

    // Handle streaming response
    if (stream) {
      console.log('[MentorChatAPI] Streaming response');

      // Create a readable stream
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of mentorAgent.streamMentorResponse(mentorInput)) {
              // Send each chunk as Server-Sent Events format
              const data = `data: ${JSON.stringify({ chunk })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }

            // Send completion signal
            const doneData = `data: ${JSON.stringify({ done: true })}\n\n`;
            controller.enqueue(encoder.encode(doneData));
            controller.close();
          } catch (error) {
            console.error('[MentorChatAPI] Streaming error:', error);
            const errorData = `data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`;
            controller.enqueue(encoder.encode(errorData));
            controller.close();
          }
        },
      });

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // Handle non-streaming response
    console.log('[MentorChatAPI] Non-streaming response');
    const output = await mentorAgent.getMentorResponse(mentorInput);

    return NextResponse.json({
      success: true,
      data: {
        response: output.response,
        responseType: output.responseType,
        timestamp: output.timestamp,
      },
    });
  } catch (error) {
    console.error('[MentorChatAPI] Error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to get mentor response';

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: errorMessage,
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        },
      },
      { status: 500 }
    );
  }
}
