import { NextRequest } from 'next/server';
import { vi } from 'vitest';
import { POST } from '@/app/api/developer/extract/route';

// Mock console.log to avoid noise in tests
vi.spyOn(console, 'log').mockImplementation(() => {});

describe('/api/developer/extract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return error for missing GitHub URL', async () => {
    const request = new NextRequest('http://localhost:3000/api/developer/extract', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_URL');
    expect(data.error.message).toBe('GitHub URL is required');
  });

  it('should return error for invalid GitHub URL format', async () => {
    const request = new NextRequest('http://localhost:3000/api/developer/extract', {
      method: 'POST',
      body: JSON.stringify({
        githubUrl: 'invalid-url',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_URL_FORMAT');
    expect(data.error.message).toBe('Invalid GitHub URL format. Please use: https://github.com/owner/repo or git@github.com:owner/repo.git');
  });

  it('should accept valid GitHub URL and return job ID', async () => {
    const request = new NextRequest('http://localhost:3000/api/developer/extract', {
      method: 'POST',
      body: JSON.stringify({
        githubUrl: 'https://github.com/user/repo',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('queued');
    expect(data.data.jobId).toMatch(/^extract_\d+_[a-z0-9]+$/);
  });

  it('should accept GitHub URL with trailing slash', async () => {
    const request = new NextRequest('http://localhost:3000/api/developer/extract', {
      method: 'POST',
      body: JSON.stringify({
        githubUrl: 'https://github.com/user/repo/',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should accept GitHub URL with dashes and dots in names', async () => {
    const request = new NextRequest('http://localhost:3000/api/developer/extract', {
      method: 'POST',
      body: JSON.stringify({
        githubUrl: 'https://github.com/user-name.test/repo-name.test',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should reject non-GitHub URLs', async () => {
    const request = new NextRequest('http://localhost:3000/api/developer/extract', {
      method: 'POST',
      body: JSON.stringify({
        githubUrl: 'https://gitlab.com/user/repo',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_URL_FORMAT');
  });

  it('should handle malformed JSON gracefully', async () => {
    const request = new NextRequest('http://localhost:3000/api/developer/extract', {
      method: 'POST',
      body: 'invalid json',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INTERNAL_ERROR');
  });

  it('should include componentPath in job data when provided', async () => {
    const request = new NextRequest('http://localhost:3000/api/developer/extract', {
      method: 'POST',
      body: JSON.stringify({
        githubUrl: 'https://github.com/user/repo',
        componentPath: 'src/components/Button.tsx',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(console.log).toHaveBeenCalledWith(
      'Creating extraction job:',
      expect.objectContaining({
        componentPath: 'src/components/Button.tsx',
      })
    );
  });
});