// Minimal stub for DynamoDB operations
export async function getUsageStats(userId: string) {
  return {
    apiCalls: 0,
    storageUsed: 0,
    computeTime: 0
  };
}