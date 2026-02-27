import * as cdk from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';

export class QueueStack extends cdk.Stack {
  public readonly aiJobsQueue: sqs.Queue;
  public readonly aiJobsDlq: sqs.Queue;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const env = this.node.tryGetContext('env') || 'dev';

    // Dead-Letter Queue
    // Stores failed jobs after 3 retry attempts
    this.aiJobsDlq = new sqs.Queue(this, 'AiJobsDlq', {
      queueName: `codelearn-ai-jobs-dlq-${env}`,
      retentionPeriod: cdk.Duration.days(4),
      encryption: sqs.QueueEncryption.SQS_MANAGED,
    });

    // AI Jobs Queue
    // Main queue for async AI operations (curation, extraction, integration)
    this.aiJobsQueue = new sqs.Queue(this, 'AiJobsQueue', {
      queueName: `codelearn-ai-jobs-queue-${env}`,
      visibilityTimeout: cdk.Duration.minutes(5),
      retentionPeriod: cdk.Duration.days(4),
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      deadLetterQueue: {
        queue: this.aiJobsDlq,
        maxReceiveCount: 3,
      },
    });

    // CloudWatch Alarm for queue depth
    const queueDepthAlarm = new cloudwatch.Alarm(this, 'QueueDepthAlarm', {
      alarmName: `codelearn-queue-depth-${env}`,
      alarmDescription: 'Alert when AI jobs queue depth exceeds 100 messages',
      metric: this.aiJobsQueue.metricApproximateNumberOfMessagesVisible(),
      threshold: 100,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });

    // CloudWatch Alarm for DLQ messages
    const dlqAlarm = new cloudwatch.Alarm(this, 'DlqAlarm', {
      alarmName: `codelearn-dlq-messages-${env}`,
      alarmDescription: 'Alert when messages appear in dead-letter queue',
      metric: this.aiJobsDlq.metricApproximateNumberOfMessagesVisible(),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    });

    // Output queue URLs for environment variables
    new cdk.CfnOutput(this, 'AiJobsQueueUrl', {
      value: this.aiJobsQueue.queueUrl,
      description: 'AI jobs queue URL',
      exportName: `codelearn-ai-jobs-queue-url-${env}`,
    });

    new cdk.CfnOutput(this, 'AiJobsQueueArn', {
      value: this.aiJobsQueue.queueArn,
      description: 'AI jobs queue ARN',
      exportName: `codelearn-ai-jobs-queue-arn-${env}`,
    });

    new cdk.CfnOutput(this, 'AiJobsDlqUrl', {
      value: this.aiJobsDlq.queueUrl,
      description: 'AI jobs DLQ URL',
      exportName: `codelearn-ai-jobs-dlq-url-${env}`,
    });

    new cdk.CfnOutput(this, 'AiJobsDlqArn', {
      value: this.aiJobsDlq.queueArn,
      description: 'AI jobs DLQ ARN',
      exportName: `codelearn-ai-jobs-dlq-arn-${env}`,
    });
  }
}
