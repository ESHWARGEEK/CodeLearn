import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPortfolioSettings, updatePortfolioSettings } from '@/lib/db/portfolio-settings';
import * as dynamodb from '@/lib/db/dynamodb';

// Mock DynamoDB operations
vi.mock('@/lib/db/dynamodb', () => ({
  getItem: vi.fn(),
  putItem: vi.fn(),
  TABLES: {
    PROJECTS: 'test-projects-table',
  },
}));

describe('Portfolio Settings Database Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPortfolioSettings', () => {
    it('should return existing portfolio settings', async () => {
      const mockRecord = {
        PK: 'USER#user-123',
        SK: 'PORTFOLIO_SETTINGS',
        isPublic: true,
        showGithubLinks: false,
        showTechStack: true,
        customDescription: 'My portfolio',
        createdAt: 1709251200,
        updatedAt: 1709337600,
      };

      vi.mocked(dynamodb.getItem).mockResolvedValue(mockRecord);

      const result = await getPortfolioSettings('user-123');

      expect(result).toEqual({
        isPublic: true,
        showGithubLinks: false,
        showTechStack: true,
        customDescription: 'My portfolio',
      });

      expect(dynamodb.getItem).toHaveBeenCalledWith('test-projects-table', {
        PK: 'USER#user-123',
        SK: 'PORTFOLIO_SETTINGS',
      });
    });

    it('should return default settings when no record exists', async () => {
      vi.mocked(dynamodb.getItem).mockResolvedValue(null);

      const result = await getPortfolioSettings('user-123');

      expect(result).toEqual({
        isPublic: false,
        showGithubLinks: true,
        showTechStack: true,
      });
    });
  });

  describe('updatePortfolioSettings', () => {
    it('should create new portfolio settings record', async () => {
      const settings = {
        isPublic: true,
        showGithubLinks: false,
        showTechStack: true,
        customDescription: 'Updated portfolio',
      };

      // Mock no existing record
      vi.mocked(dynamodb.getItem).mockResolvedValue(null);
      vi.mocked(dynamodb.putItem).mockResolvedValue();

      // Mock current time
      const mockTime = 1709337600;
      vi.spyOn(Date, 'now').mockReturnValue(mockTime * 1000);
      vi.spyOn(Math, 'floor').mockReturnValue(mockTime);

      await updatePortfolioSettings('user-123', settings);

      expect(dynamodb.putItem).toHaveBeenCalledWith('test-projects-table', {
        PK: 'USER#user-123',
        SK: 'PORTFOLIO_SETTINGS',
        isPublic: true,
        showGithubLinks: false,
        showTechStack: true,
        customDescription: 'Updated portfolio',
        createdAt: mockTime,
        updatedAt: mockTime,
      });
    });

    it('should update existing portfolio settings record', async () => {
      const existingRecord = {
        PK: 'USER#user-123',
        SK: 'PORTFOLIO_SETTINGS',
        isPublic: false,
        showGithubLinks: true,
        showTechStack: true,
        createdAt: 1709251200,
        updatedAt: 1709251200,
      };

      const settings = {
        isPublic: true,
        showGithubLinks: false,
        showTechStack: true,
        customDescription: 'Updated portfolio',
      };

      vi.mocked(dynamodb.getItem).mockResolvedValue(existingRecord);
      vi.mocked(dynamodb.putItem).mockResolvedValue();

      // Mock current time
      const mockTime = 1709337600;
      vi.spyOn(Date, 'now').mockReturnValue(mockTime * 1000);
      vi.spyOn(Math, 'floor').mockReturnValue(mockTime);

      await updatePortfolioSettings('user-123', settings);

      expect(dynamodb.putItem).toHaveBeenCalledWith('test-projects-table', {
        PK: 'USER#user-123',
        SK: 'PORTFOLIO_SETTINGS',
        isPublic: true,
        showGithubLinks: false,
        showTechStack: true,
        customDescription: 'Updated portfolio',
        createdAt: 1709251200, // Preserved from existing record
        updatedAt: mockTime,
      });
    });

    it('should handle settings without optional fields', async () => {
      const settings = {
        isPublic: false,
        showGithubLinks: true,
        showTechStack: false,
      };

      vi.mocked(dynamodb.getItem).mockResolvedValue(null);
      vi.mocked(dynamodb.putItem).mockResolvedValue();

      const mockTime = 1709337600;
      vi.spyOn(Date, 'now').mockReturnValue(mockTime * 1000);
      vi.spyOn(Math, 'floor').mockReturnValue(mockTime);

      await updatePortfolioSettings('user-123', settings);

      expect(dynamodb.putItem).toHaveBeenCalledWith('test-projects-table', {
        PK: 'USER#user-123',
        SK: 'PORTFOLIO_SETTINGS',
        isPublic: false,
        showGithubLinks: true,
        showTechStack: false,
        customDescription: undefined,
        createdAt: mockTime,
        updatedAt: mockTime,
      });
    });
  });
});