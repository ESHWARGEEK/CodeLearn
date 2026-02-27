import * as cdk from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

export class QueueStack extends cdk.Stack {
  public readonly aiJobsQueue: sqs.Queue;
  public readonly aiJobsDlq: sqs.Queue;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Placeholder - will be implemented in task 2.5
    // AI jobs queue
    // Dead-letter queue
    // CloudWatch alarms
  }
}
