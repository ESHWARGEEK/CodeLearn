import { NextRequest } from 'next/server';
import { vi } from 'vitest';
import { GET, POST } from '@/app/api/jobs/[jobId]/route';

// Mock console.log to avoid noise in tests
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('/api/jobs/[jobId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return error for missing job ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/jobs/');
      const response = await GET(request, { params: { jobId: '' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('MISSING_JOB_ID');
    });

    it('should return 404 for non-existent job', async () => {
      const request = new NextRequest('http://localhost:3000/api/jobs/nonexistent');
      const response = await GET(request, { params: { jobId: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('JOB_NOT_FOUND');
    });

    it('should create and return queued status for new extraction job', async () => {
      const jobId = 'extract_123456789_abc123';
      const request = new NextRequest(`http://localhost:3000/api/jobs/${jobId}`);
      const response = await GET(request, { params: { jobId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.jobId).toBe(jobId);
      expect(data.data.status).toBe('queued');
      expect(data.data.progress).toBe(0);
    });
  });

  describe('POST (cancel)', () => {
    it('should cancel a job successfully', async () => {
      const jobId = 'extract_123456789_abc123';
      const request = new NextRequest(`http://localhost:3000/api/jobs/${jobId}/cancel`, {
        method: 'POST',
      });

      const response = await POST(request, { params: { jobId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.cancelled).toBe(true);
    });

    it('should handle unknown actions', async () => {
      const jobId = 'extract_123456789_abc123';
      const request = new NextRequest(`http://localhost:3000/api/jobs/${jobId}/unknown`, {
        method: 'POST',
      });

      const response = await POST(request, { params: { jobId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNKNOWN_ACTION');
    });
  });
});