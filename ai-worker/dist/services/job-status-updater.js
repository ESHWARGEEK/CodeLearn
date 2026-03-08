"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobStatusUpdater = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const job_1 = require("../types/job");
const logger_1 = require("../utils/logger");
class JobStatusUpdater {
    constructor() {
        this.logger = logger_1.Logger.getInstance();
        const client = new client_dynamodb_1.DynamoDBClient({
            region: process.env.AWS_REGION || 'us-east-1',
        });
        this.dynamoClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
        this.jobsTableName = process.env.JOBS_TABLE_NAME || `codelearn-jobs-${process.env.ENVIRONMENT || 'dev'}`;
    }
    async updateJobStatus(jobId, status, result, error) {
        try {
            const updateExpression = ['#status = :status', '#updatedAt = :updatedAt'];
            const expressionAttributeNames = {
                '#status': 'status',
                '#updatedAt': 'updatedAt',
            };
            const expressionAttributeValues = {
                ':status': status,
                ':updatedAt': new Date().toISOString(),
            };
            if (result !== undefined) {
                updateExpression.push('#result = :result');
                expressionAttributeNames['#result'] = 'result';
                expressionAttributeValues[':result'] = result;
            }
            if (error) {
                updateExpression.push('#error = :error');
                expressionAttributeNames['#error'] = 'error';
                expressionAttributeValues[':error'] = error;
            }
            if (status === job_1.JobStatus.COMPLETED || status === job_1.JobStatus.FAILED) {
                updateExpression.push('#completedAt = :completedAt');
                expressionAttributeNames['#completedAt'] = 'completedAt';
                expressionAttributeValues[':completedAt'] = new Date().toISOString();
            }
            if (status === job_1.JobStatus.RETRY) {
                updateExpression.push('#retryCount = #retryCount + :one');
                expressionAttributeNames['#retryCount'] = 'retryCount';
                expressionAttributeValues[':one'] = 1;
            }
            const command = new lib_dynamodb_1.UpdateCommand({
                TableName: this.jobsTableName,
                Key: {
                    PK: `JOB#${jobId}`,
                    SK: 'METADATA',
                },
                UpdateExpression: `SET ${updateExpression.join(', ')}`,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
            });
            await this.dynamoClient.send(command);
            this.logger.debug('Job status updated', {
                jobId,
                status,
                hasResult: result !== undefined,
                hasError: error !== undefined,
            });
        }
        catch (error) {
            this.logger.error('Failed to update job status', {
                jobId,
                status,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async getJobStatus(jobId) {
        try {
            const command = new lib_dynamodb_1.GetCommand({
                TableName: this.jobsTableName,
                Key: {
                    PK: `JOB#${jobId}`,
                    SK: 'METADATA',
                },
            });
            const response = await this.dynamoClient.send(command);
            if (!response.Item) {
                return null;
            }
            return {
                status: response.Item.status,
                result: response.Item.result,
                error: response.Item.error,
            };
        }
        catch (error) {
            this.logger.error('Failed to get job status', {
                jobId,
                error: error instanceof Error ? error.message : String(error),
            });
            return null;
        }
    }
}
exports.JobStatusUpdater = JobStatusUpdater;
//# sourceMappingURL=job-status-updater.js.map