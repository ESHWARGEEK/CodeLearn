"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherAgent = void 0;
const base_agent_1 = require("./base-agent");
class TeacherAgent extends base_agent_1.BaseAgent {
    constructor() {
        super(...arguments);
        this.modelConfig = {
            modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
            maxTokens: 3000,
            temperature: 0.3,
            topP: 0.9,
        };
    }
    async processJob(job) {
        this.logger.info('Processing code explanation job', {
            jobId: job.jobId,
            language: job.payload.language,
            codeLength: job.payload.code.length,
        });
        const systemPrompt = this.buildSystemPrompt();
        const userPrompt = this.buildUserPrompt(job.payload);
        const response = await this.retryWithBackoff(async () => {
            return await this.invokeModel(userPrompt, this.modelConfig, systemPrompt);
        });
        const explanation = this.parseExplanationResponse(response);
        this.validateExplanation(explanation);
        this.logger.info('Code explanation completed', {
            jobId: job.jobId,
            breakdownSections: explanation.breakdown.length,
            keyLearnings: explanation.keyLearnings.length,
        });
        return explanation;
    }
    buildSystemPrompt() {
        return `You are an expert programming teacher with years of experience explaining code to developers of all skill levels. Your explanations are:

1. Clear and pedagogical - break down complex concepts into digestible parts
2. Contextual - explain not just what the code does, but why it's written that way
3. Educational - highlight important programming concepts and best practices
4. Encouraging - maintain a supportive tone that builds confidence
5. Practical - provide actionable next steps for learning

Always respond with valid JSON in the exact format specified. Focus on helping the learner understand both the specific code and the broader programming concepts it demonstrates.`;
    }
    buildUserPrompt(payload) {
        const { code, language, context, difficulty } = payload;
        let prompt = `Explain this ${language} code in detail:

\`\`\`${language}
${code}
\`\`\``;
        if (context) {
            prompt += `\n\nContext: ${context}`;
        }
        if (difficulty) {
            prompt += `\n\nTarget audience: ${difficulty} level developers`;
        }
        prompt += `

Respond with a JSON object in this exact format:
{
  "summary": "Brief overview of what this code does and its purpose",
  "breakdown": [
    {
      "lineNumbers": "1-3",
      "code": "const example = 'code snippet';",
      "explanation": "Detailed explanation of what this section does",
      "concepts": ["variable declaration", "string literals"]
    }
  ],
  "keyLearnings": [
    "Important concept or pattern demonstrated",
    "Best practice shown in the code"
  ],
  "nextSteps": [
    "Suggestion for what to learn or try next",
    "Related concept to explore"
  ],
  "difficulty": "beginner"
}

Requirements:
- Break down the code into logical sections (3-8 sections)
- Explain each section clearly with relevant programming concepts
- Provide 3-5 key learnings that highlight important concepts
- Suggest 2-4 practical next steps for continued learning
- Assess the overall difficulty level of the code`;
        return prompt;
    }
    parseExplanationResponse(response) {
        try {
            const cleanResponse = response
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
            const parsed = JSON.parse(cleanResponse);
            if (!parsed.summary || !parsed.breakdown || !Array.isArray(parsed.breakdown)) {
                throw new Error('Invalid explanation structure');
            }
            return parsed;
        }
        catch (error) {
            this.logger.error('Failed to parse explanation response', {
                error: error instanceof Error ? error.message : String(error),
                responseLength: response.length,
                responsePreview: response.substring(0, 200),
            });
            throw new Error('Failed to parse AI response into valid explanation');
        }
    }
    validateExplanation(explanation) {
        if (!explanation.summary || explanation.summary.length < 10) {
            throw new Error('Explanation summary is too short');
        }
        if (!explanation.breakdown || explanation.breakdown.length < 1) {
            throw new Error('Explanation must have at least one breakdown section');
        }
        if (!explanation.keyLearnings || explanation.keyLearnings.length < 1) {
            throw new Error('Explanation must have at least one key learning');
        }
        if (!explanation.nextSteps || explanation.nextSteps.length < 1) {
            throw new Error('Explanation must have at least one next step');
        }
        for (const section of explanation.breakdown) {
            if (!section.lineNumbers || !section.code || !section.explanation) {
                throw new Error('Breakdown section missing required fields');
            }
            if (!section.concepts || section.concepts.length < 1) {
                throw new Error('Breakdown section must have at least one concept');
            }
        }
        const validDifficulties = ['beginner', 'intermediate', 'advanced'];
        if (!validDifficulties.includes(explanation.difficulty)) {
            throw new Error('Invalid difficulty level');
        }
        this.logger.debug('Code explanation validation passed', {
            summary: explanation.summary.substring(0, 50) + '...',
            breakdownSections: explanation.breakdown.length,
            keyLearnings: explanation.keyLearnings.length,
            difficulty: explanation.difficulty,
        });
    }
}
exports.TeacherAgent = TeacherAgent;
//# sourceMappingURL=teacher-agent.js.map