import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class DatabaseStack extends cdk.Stack {
  public readonly usersTable: dynamodb.Table;
  public readonly projectsTable: dynamodb.Table;
  public readonly learningPathsTable: dynamodb.Table;
  public readonly templatesTable: dynamodb.Table;
  public readonly jobsTable: dynamodb.Table;
  public readonly integrationsTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Placeholder - will be implemented in task 2.2
    // Users table
    // Projects table
    // Learning paths table
    // Templates table
    // Jobs table
    // Integrations table
  }
}
