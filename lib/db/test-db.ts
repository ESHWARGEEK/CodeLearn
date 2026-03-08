/**
 * Test Database Implementation
 * 
 * In-memory database for testing purposes
 */

import { Project } from './projects';

// In-memory storage for tests
const testData: {
  projects: Map<string, Project>;
  s3Objects: Map<string, Buffer>;
} = {
  projects: new Map(),
  s3Objects: new Map(),
};

export function clearTestData() {
  testData.projects.clear();
  testData.s3Objects.clear();
}

export const TABLES = {
  PROJECTS: 'test-projects-table',
  LEARNING_PATHS: 'test-learning-paths-table',
  USERS: 'test-users-table',
};

export async function putItem(tableName: string, item: Record<string, unknown>) {
  if (tableName === TABLES.PROJECTS) {
    const project = item as unknown as Project;
    const key = `${project.PK}#${project.SK}`;
    testData.projects.set(key, project);
  }
  return Promise.resolve();
}

export async function getItem(tableName: string, key: Record<string, unknown>) {
  if (tableName === TABLES.PROJECTS) {
    const searchKey = `${key.PK}#${key.SK}`;
    return testData.projects.get(searchKey) || null;
  }
  return null;
}

export async function queryItems(
  tableName: string,
  keyCondition: string,
  expressionAttributeValues: Record<string, unknown>,
  indexName?: string
) {
  if (tableName === TABLES.PROJECTS) {
    const results: Project[] = [];
    for (const [key, project] of testData.projects) {
      // Simple matching for test purposes
      if (keyCondition.includes('PK = :pk') && expressionAttributeValues[':pk']) {
        if (project.PK === expressionAttributeValues[':pk']) {
          results.push(project);
        }
      } else if (keyCondition.includes('SK = :sk') && expressionAttributeValues[':sk']) {
        if (project.SK === expressionAttributeValues[':sk']) {
          results.push(project);
        }
      }
    }
    return results;
  }
  return [];
}

// Test S3 implementation
export function putS3Object(key: string, data: Buffer) {
  testData.s3Objects.set(key, data);
}

export function getS3Object(key: string): Buffer | null {
  return testData.s3Objects.get(key) || null;
}