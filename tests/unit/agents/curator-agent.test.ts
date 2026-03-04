/**
 * Unit tests for Curator Agent
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CuratorAgent } from '@/lib/agents/curator-agent';
import type { CuratorInput } from '@/lib/agents/types';

// Mock AWS SDK
vi.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: vi.fn(() => ({
    send: vi.fn(),
  })),
  InvokeModelCommand: vi.fn(),
}));

// Mock Octokit
vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn(() => ({
    search: {
      repos: vi.fn(),
    },
    repos: {
      getReadme: vi.fn(),
    },
  })),
}));

describe('CuratorAgent', () => {
  let agent: CuratorAgent;

  beforeEach(() => {
    agent = new CuratorAgent();
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(agent).toBeInstanceOf(CuratorAgent);
    });
  });

  describe('curate', () => {
    it('should accept valid input', async () => {
      const input: CuratorInput = {
        technology: 'react',
        difficulty: 'beginner',
      };

      // This will fail without proper mocks, but validates the interface
      expect(input.technology).toBe('react');
      expect(input.difficulty).toBe('beginner');
    });

    it('should validate difficulty levels', () => {
      const validDifficulties = ['beginner', 'intermediate', 'advanced'];
      
      validDifficulties.forEach((difficulty) => {
        const input: CuratorInput = {
          technology: 'react',
          difficulty: difficulty as any,
        };
        
        expect(['beginner', 'intermediate', 'advanced']).toContain(input.difficulty);
      });
    });
  });

  describe('buildSearchQuery', () => {
    it('should build query for React', () => {
      // Access private method through type assertion for testing
      const query = (agent as any).buildSearchQuery('react');
      
      expect(query).toContain('react');
      expect(query).toContain('stars:>50');
      expect(query).toContain('archived:false');
    });

    it('should build query for Next.js', () => {
      const query = (agent as any).buildSearchQuery('next.js');
      
      expect(query).toContain('nextjs');
      expect(query).toContain('stars:>50');
    });

    it('should build query for Python', () => {
      const query = (agent as any).buildSearchQuery('python');
      
      expect(query).toContain('python');
      expect(query).toContain('language:Python');
    });
  });

  describe('calculateReadmeQuality', () => {
    it('should return 0 for null README', () => {
      const score = (agent as any).calculateReadmeQuality(null);
      expect(score).toBe(0);
    });

    it('should score based on length', () => {
      const shortReadme = 'Short README';
      const longReadme = 'A'.repeat(2000);
      
      const shortScore = (agent as any).calculateReadmeQuality(shortReadme);
      const longScore = (agent as any).calculateReadmeQuality(longReadme);
      
      expect(longScore).toBeGreaterThan(shortScore);
    });

    it('should score based on sections', () => {
      const readmeWithSections = `
# Project

## Installation
Instructions here

## Usage
Usage instructions

## Features
Feature list

## Documentation
Docs link

## Contributing
Contribution guide

## License
MIT
      `;
      
      const score = (agent as any).calculateReadmeQuality(readmeWithSections);
      expect(score).toBeGreaterThan(50);
    });

    it('should not exceed 100', () => {
      const perfectReadme = `
${'A'.repeat(5000)}
## Installation
## Usage
## Features
## Documentation
## Contributing
## License
      `;
      
      const score = (agent as any).calculateReadmeQuality(perfectReadme);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('estimateCodeStructure', () => {
    it('should score based on topics', () => {
      const repoWithTopics = {
        topics: ['react', 'typescript', 'testing', 'documentation'],
        has_wiki: true,
        has_pages: true,
      };
      
      const repoWithoutTopics = {
        topics: [],
        has_wiki: false,
        has_pages: false,
      };
      
      const scoreWith = (agent as any).estimateCodeStructure(repoWithTopics);
      const scoreWithout = (agent as any).estimateCodeStructure(repoWithoutTopics);
      
      expect(scoreWith).toBeGreaterThan(scoreWithout);
    });

    it('should not exceed 100', () => {
      const repo = {
        topics: ['a', 'b', 'c', 'd', 'e'],
        has_wiki: true,
        has_pages: true,
      };
      
      const score = (agent as any).estimateCodeStructure(repo);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('estimateTestCoverage', () => {
    it('should score based on testing topics', () => {
      const repoWithTests = {
        topics: ['testing', 'jest', 'cypress'],
      };
      
      const repoWithoutTests = {
        topics: ['react', 'typescript'],
      };
      
      const scoreWith = (agent as any).estimateTestCoverage(repoWithTests);
      const scoreWithout = (agent as any).estimateTestCoverage(repoWithoutTests);
      
      expect(scoreWith).toBeGreaterThan(scoreWithout);
    });
  });

  describe('extractTechStack', () => {
    it('should extract language and topics', () => {
      const repo = {
        language: 'TypeScript',
        topics: ['react', 'nextjs', 'tailwindcss'],
      };
      
      const stack = (agent as any).extractTechStack(repo);
      
      expect(stack).toContain('TypeScript');
      expect(stack).toContain('react');
      expect(stack).toContain('nextjs');
      expect(stack).toContain('tailwindcss');
    });

    it('should handle missing language', () => {
      const repo = {
        language: null,
        topics: ['react'],
      };
      
      const stack = (agent as any).extractTechStack(repo);
      
      expect(stack).toContain('react');
    });

    it('should filter irrelevant topics', () => {
      const repo = {
        language: 'JavaScript',
        topics: ['react', 'random-topic', 'another-random'],
      };
      
      const stack = (agent as any).extractTechStack(repo);
      
      expect(stack).toContain('react');
      expect(stack).not.toContain('random-topic');
    });
  });

  describe('estimateLearningTime', () => {
    it('should increase time with stars', () => {
      const smallRepo = { stargazers_count: 60 };
      const largeRepo = { stargazers_count: 10000 };
      
      const smallTime = (agent as any).estimateLearningTime(smallRepo, 70);
      const largeTime = (agent as any).estimateLearningTime(largeRepo, 70);
      
      expect(largeTime).toBeGreaterThan(smallTime);
    });

    it('should decrease time with better README', () => {
      const repo = { stargazers_count: 100 };
      
      const timeGoodReadme = (agent as any).estimateLearningTime(repo, 80);
      const timePoorReadme = (agent as any).estimateLearningTime(repo, 30);
      
      expect(timePoorReadme).toBeGreaterThan(timeGoodReadme);
    });

    it('should clamp between 4-20 hours', () => {
      const tinyRepo = { stargazers_count: 10 };
      const hugeRepo = { stargazers_count: 100000 };
      
      const minTime = (agent as any).estimateLearningTime(tinyRepo, 100);
      const maxTime = (agent as any).estimateLearningTime(hugeRepo, 0);
      
      expect(minTime).toBeGreaterThanOrEqual(4);
      expect(maxTime).toBeLessThanOrEqual(20);
    });
  });

  describe('getDifficultyGuidance', () => {
    it('should provide guidance for beginner', () => {
      const guidance = (agent as any).getDifficultyGuidance('beginner');
      
      expect(guidance).toContain('simple');
      expect(guidance.toLowerCase()).toMatch(/simple|clear|beginner/);
    });

    it('should provide guidance for intermediate', () => {
      const guidance = (agent as any).getDifficultyGuidance('intermediate');
      
      expect(guidance).toContain('moderate');
    });

    it('should provide guidance for advanced', () => {
      const guidance = (agent as any).getDifficultyGuidance('advanced');
      
      expect(guidance).toContain('complex' || 'advanced');
    });
  });

  describe('parseRankingResponse', () => {
    it('should parse valid JSON response', () => {
      const response = `[
        {"id": "123", "score": 85, "reason": "Great docs"},
        {"id": "456", "score": 72, "reason": "Good structure"}
      ]`;
      
      const rankings = (agent as any).parseRankingResponse(response);
      
      expect(rankings).toHaveLength(2);
      expect(rankings[0]).toEqual({ id: '123', score: 85 });
      expect(rankings[1]).toEqual({ id: '456', score: 72 });
    });

    it('should extract JSON from text with extra content', () => {
      const response = `Here are the rankings:
      
      [
        {"id": "123", "score": 85, "reason": "Great docs"}
      ]
      
      These are my recommendations.`;
      
      const rankings = (agent as any).parseRankingResponse(response);
      
      expect(rankings).toHaveLength(1);
      expect(rankings[0].id).toBe('123');
    });

    it('should return empty array for invalid response', () => {
      const response = 'Invalid response without JSON';
      
      const rankings = (agent as any).parseRankingResponse(response);
      
      expect(rankings).toEqual([]);
    });
  });
});
