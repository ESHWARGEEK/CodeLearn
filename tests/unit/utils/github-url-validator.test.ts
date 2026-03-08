import { describe, it, expect } from 'vitest';
import { 
  validateGitHubUrl, 
  isValidGitHubUrl, 
  SUPPORTED_FORMATS 
} from '@/lib/utils/github-url-validator';

describe('GitHub URL Validator', () => {
  describe('validateGitHubUrl', () => {
    describe('valid URLs', () => {
      it('should validate standard HTTPS GitHub URLs', () => {
        const result = validateGitHubUrl('https://github.com/facebook/react');
        
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
        expect(result.normalizedUrl).toBe('https://github.com/facebook/react');
        expect(result.owner).toBe('facebook');
        expect(result.repo).toBe('react');
      });

      it('should validate HTTPS URLs with .git suffix', () => {
        const result = validateGitHubUrl('https://github.com/vercel/next.js.git');
        
        expect(result.isValid).toBe(true);
        expect(result.normalizedUrl).toBe('https://github.com/vercel/next.js');
        expect(result.owner).toBe('vercel');
        expect(result.repo).toBe('next.js');
      });

      it('should validate HTTPS URLs with trailing slash', () => {
        const result = validateGitHubUrl('https://github.com/microsoft/vscode/');
        
        expect(result.isValid).toBe(true);
        expect(result.normalizedUrl).toBe('https://github.com/microsoft/vscode');
        expect(result.owner).toBe('microsoft');
        expect(result.repo).toBe('vscode');
      });

      it('should validate SSH format URLs', () => {
        const result = validateGitHubUrl('git@github.com:torvalds/linux.git');
        
        expect(result.isValid).toBe(true);
        expect(result.normalizedUrl).toBe('https://github.com/torvalds/linux');
        expect(result.owner).toBe('torvalds');
        expect(result.repo).toBe('linux');
      });

      it('should validate URLs with special characters in names', () => {
        const testCases = [
          'https://github.com/user_name/repo-name',
          'https://github.com/user.name/repo.name',
          'https://github.com/user123/repo_123',
          'https://github.com/a/b', // minimum length
        ];

        testCases.forEach(url => {
          const result = validateGitHubUrl(url);
          expect(result.isValid).toBe(true);
        });
      });
    });

    describe('invalid URLs', () => {
      it('should reject empty or null URLs', () => {
        const testCases = ['', '   ', null as any, undefined as any];
        
        testCases.forEach(url => {
          const result = validateGitHubUrl(url);
          expect(result.isValid).toBe(false);
          expect(result.error).toBe('Please enter a GitHub repository URL');
        });
      });

      it('should reject non-GitHub URLs', () => {
        const testCases = [
          'https://gitlab.com/user/repo',
          'https://bitbucket.org/user/repo',
          'https://example.com/user/repo',
          'https://github.io/user/repo',
        ];

        testCases.forEach(url => {
          const result = validateGitHubUrl(url);
          expect(result.isValid).toBe(false);
          expect(result.error).toBe('Invalid GitHub URL format. Please use: https://github.com/owner/repo or git@github.com:owner/repo.git');
        });
      });

      it('should reject malformed GitHub URLs', () => {
        const testCases = [
          'https://github.com/user', // missing repo
          'https://github.com/', // missing user and repo
          'https://github.com/user/repo/extra/path', // extra path
          'github.com/user/repo', // missing protocol
          'http://github.com/user/repo', // wrong protocol
        ];

        testCases.forEach(url => {
          const result = validateGitHubUrl(url);
          expect(result.isValid).toBe(false);
          expect(result.error).toBe('Invalid GitHub URL format. Please use: https://github.com/owner/repo or git@github.com:owner/repo.git');
        });
      });

      it('should reject invalid owner names', () => {
        const testCases = [
          {
            url: 'https://github.com/-invalid/repo', // starts with hyphen
            expectNameValidation: true
          },
          {
            url: 'https://github.com/invalid-/repo', // ends with hyphen
            expectNameValidation: true
          },
          {
            url: 'https://github.com//repo', // empty owner
            expectNameValidation: false // This fails at URL parsing stage
          },
          {
            url: 'https://github.com/user@name/repo', // invalid character
            expectNameValidation: false // This fails at URL parsing stage
          },
          {
            url: 'https://github.com/user name/repo', // space
            expectNameValidation: false // This fails at URL parsing stage
          },
        ];

        testCases.forEach(({ url, expectNameValidation }) => {
          const result = validateGitHubUrl(url);
          expect(result.isValid).toBe(false);
          if (expectNameValidation) {
            expect(result.error).toContain('Invalid repository owner name');
          } else {
            expect(result.error).toContain('Invalid GitHub URL format');
          }
        });
      });

      it('should reject invalid repository names', () => {
        const testCases = [
          {
            url: 'https://github.com/user/-invalid', // starts with hyphen
            expectNameValidation: true
          },
          {
            url: 'https://github.com/user/invalid-', // ends with hyphen
            expectNameValidation: true
          },
          {
            url: 'https://github.com/user/', // empty repo
            expectNameValidation: false // This fails at URL parsing stage
          },
          {
            url: 'https://github.com/user/repo@name', // invalid character
            expectNameValidation: false // This fails at URL parsing stage
          },
          {
            url: 'https://github.com/user/repo name', // space
            expectNameValidation: false // This fails at URL parsing stage
          },
        ];

        testCases.forEach(({ url, expectNameValidation }) => {
          const result = validateGitHubUrl(url);
          expect(result.isValid).toBe(false);
          if (expectNameValidation) {
            expect(result.error).toContain('Invalid repository name');
          } else {
            expect(result.error).toContain('Invalid GitHub URL format');
          }
        });
      });

      it('should reject names that are too long', () => {
        const longName = 'a'.repeat(101); // 101 characters
        const url = `https://github.com/${longName}/repo`;
        
        const result = validateGitHubUrl(url);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Invalid repository owner name');
      });
    });

    describe('edge cases', () => {
      it('should handle URLs with mixed case', () => {
        const result = validateGitHubUrl('https://GitHub.com/User/Repo');
        expect(result.isValid).toBe(false); // GitHub URLs are case-sensitive for domain
      });

      it('should trim whitespace from URLs', () => {
        const result = validateGitHubUrl('  https://github.com/user/repo  ');
        expect(result.isValid).toBe(true);
        expect(result.normalizedUrl).toBe('https://github.com/user/repo');
      });

      it('should handle minimum valid names', () => {
        const result = validateGitHubUrl('https://github.com/a/b');
        expect(result.isValid).toBe(true);
        expect(result.owner).toBe('a');
        expect(result.repo).toBe('b');
      });
    });
  });

  describe('isValidGitHubUrl', () => {
    it('should return true for valid URLs', () => {
      expect(isValidGitHubUrl('https://github.com/facebook/react')).toBe(true);
      expect(isValidGitHubUrl('git@github.com:torvalds/linux.git')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(isValidGitHubUrl('')).toBe(false);
      expect(isValidGitHubUrl('https://gitlab.com/user/repo')).toBe(false);
      expect(isValidGitHubUrl('https://github.com/user')).toBe(false);
    });
  });

  describe('SUPPORTED_FORMATS', () => {
    it('should export supported format examples', () => {
      expect(SUPPORTED_FORMATS).toEqual([
        'https://github.com/owner/repo',
        'https://github.com/owner/repo.git',
        'https://github.com/owner/repo/',
        'git@github.com:owner/repo.git'
      ]);
    });

    it('should validate all supported format examples', () => {
      // Test with actual owner/repo names
      const testUrls = [
        'https://github.com/facebook/react',
        'https://github.com/facebook/react.git',
        'https://github.com/facebook/react/',
        'git@github.com:facebook/react.git'
      ];

      testUrls.forEach(url => {
        expect(isValidGitHubUrl(url)).toBe(true);
      });
    });
  });

  describe('normalization', () => {
    it('should normalize all formats to standard HTTPS URL', () => {
      const testCases = [
        {
          input: 'https://github.com/user/repo.git',
          expected: 'https://github.com/user/repo'
        },
        {
          input: 'https://github.com/user/repo/',
          expected: 'https://github.com/user/repo'
        },
        {
          input: 'git@github.com:user/repo.git',
          expected: 'https://github.com/user/repo'
        },
        {
          input: 'https://github.com/user/repo',
          expected: 'https://github.com/user/repo'
        }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = validateGitHubUrl(input);
        expect(result.isValid).toBe(true);
        expect(result.normalizedUrl).toBe(expected);
      });
    });
  });
});