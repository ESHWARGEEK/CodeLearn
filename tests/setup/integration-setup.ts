/**
 * Integration test setup
 * 
 * Mocks database and S3 operations for integration tests
 */

import { vi, beforeEach, afterEach } from 'vitest';
import * as testDb from '@/lib/db/test-db';

// Mock the database module
vi.mock('@/lib/db/dynamodb', async () => {
  const testDbModule = await import('@/lib/db/test-db');
  return {
    ...testDbModule,
  };
});

// Mock the S3 module
vi.mock('@/lib/storage/s3', () => ({
  putObject: vi.fn().mockImplementation((key: string, data: Buffer) => {
    testDb.putS3Object(key, data);
    return Promise.resolve();
  }),
  getObject: vi.fn().mockImplementation((key: string) => {
    const data = testDb.getS3Object(key);
    return Promise.resolve(data);
  }),
  deleteObject: vi.fn().mockResolvedValue(undefined),
  getSignedObjectUrl: vi.fn().mockResolvedValue('https://example.com/signed-url'),
  uploadProjectCode: vi.fn().mockImplementation((userId: string, projectId: string, code: Buffer) => {
    const key = `${userId}/${projectId}/code.zip`;
    testDb.putS3Object(key, code);
    return Promise.resolve(key);
  }),
  getProjectCode: vi.fn().mockImplementation((userId: string, projectId: string) => {
    const key = `${userId}/${projectId}/code.zip`;
    const data = testDb.getS3Object(key);
    return Promise.resolve(data);
  }),
}));

// Setup and teardown
beforeEach(() => {
  testDb.clearTestData();
});

afterEach(() => {
  testDb.clearTestData();
});