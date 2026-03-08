// Minimal stub for SQS operations
export async function sendMessage(queueUrl: string, message: any) {
  return { success: false, error: 'SQS not available in minimal deployment' };
}