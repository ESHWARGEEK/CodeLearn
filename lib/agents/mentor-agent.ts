// Minimal stub for Vercel deployment

export class MentorAgent {
  async processMessage(message: string, context?: any) {
    return {
      response: 'AI Mentor is not available in minimal deployment mode.',
      suggestions: [],
      context: {}
    };
  }
}

export const mentorAgent = new MentorAgent();