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

    const env = this.node.tryGetContext('env') || 'dev';

    // Users Table
    // PK: USER#{userId}, SK: PROFILE
    this.usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: `codelearn-users-${env}`,
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.ON_DEMAND,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Projects Table
    // PK: PROJECT#{projectId}, SK: USER#{userId}
    // GSI: userId-status-index (SK as PK, status as SK)
    this.projectsTable = new dynamodb.Table(this, 'ProjectsTable', {
      tableName: `codelearn-projects-${env}`,
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.ON_DEMAND,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Add GSI for querying projects by userId and status
    this.projectsTable.addGlobalSecondaryIndex({
      indexName: 'userId-status-index',
      partitionKey: {
        name: 'SK', // userId
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'status',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Learning Paths Table
    // PK: TECH#{technology}, SK: DIFF#{difficulty}
    // TTL for cache invalidation (24 hours)
    this.learningPathsTable = new dynamodb.Table(this, 'LearningPathsTable', {
      tableName: `codelearn-learning-paths-${env}`,
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.ON_DEMAND,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      timeToLiveAttribute: 'expiresAt',
    });

    // Templates Table
    // PK: TEMPLATE#{templateId}, SK: METADATA
    // GSI: technology-rating-index
    this.templatesTable = new dynamodb.Table(this, 'TemplatesTable', {
      tableName: `codelearn-templates-${env}`,
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.ON_DEMAND,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Add GSI for querying templates by technology sorted by rating
    this.templatesTable.addGlobalSecondaryIndex({
      indexName: 'technology-rating-index',
      partitionKey: {
        name: 'technology',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'rating',
        type: dynamodb.AttributeType.NUMBER,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Jobs Table
    // PK: JOB#{jobId}, SK: USER#{userId}
    // TTL for automatic cleanup (24 hours)
    this.jobsTable = new dynamodb.Table(this, 'JobsTable', {
      tableName: `codelearn-jobs-${env}`,
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.ON_DEMAND,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      timeToLiveAttribute: 'expiresAt',
    });

    // Integrations Table
    // PK: INTEGRATION#{integrationId}, SK: USER#{userId}
    // GSI: userId-month-index for rate limiting
    this.integrationsTable = new dynamodb.Table(this, 'IntegrationsTable', {
      tableName: `codelearn-integrations-${env}`,
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.ON_DEMAND,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Add GSI for counting integrations per user per month
    this.integrationsTable.addGlobalSecondaryIndex({
      indexName: 'userId-month-index',
      partitionKey: {
        name: 'SK', // userId
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'month',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Output table names for environment variables
    new cdk.CfnOutput(this, 'UsersTableName', {
      value: this.usersTable.tableName,
      description: 'Users table name',
      exportName: `codelearn-users-table-${env}`,
    });

    new cdk.CfnOutput(this, 'ProjectsTableName', {
      value: this.projectsTable.tableName,
      description: 'Projects table name',
      exportName: `codelearn-projects-table-${env}`,
    });

    new cdk.CfnOutput(this, 'LearningPathsTableName', {
      value: this.learningPathsTable.tableName,
      description: 'Learning paths table name',
      exportName: `codelearn-learning-paths-table-${env}`,
    });

    new cdk.CfnOutput(this, 'TemplatesTableName', {
      value: this.templatesTable.tableName,
      description: 'Templates table name',
      exportName: `codelearn-templates-table-${env}`,
    });

    new cdk.CfnOutput(this, 'JobsTableName', {
      value: this.jobsTable.tableName,
      description: 'Jobs table name',
      exportName: `codelearn-jobs-table-${env}`,
    });

    new cdk.CfnOutput(this, 'IntegrationsTableName', {
      value: this.integrationsTable.tableName,
      description: 'Integrations table name',
      exportName: `codelearn-integrations-table-${env}`,
    });
  }
}
