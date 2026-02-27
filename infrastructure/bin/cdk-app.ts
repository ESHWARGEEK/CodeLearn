#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DatabaseStack } from '../lib/database-stack';
import { StorageStack } from '../lib/storage-stack';
import { AuthStack } from '../lib/auth-stack';
import { QueueStack } from '../lib/queue-stack';

const app = new cdk.App();

// Get environment from context or default to 'dev'
const env = app.node.tryGetContext('env') || 'dev';
const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION || 'us-east-1';

// Database Stack - DynamoDB tables
const databaseStack = new DatabaseStack(app, `CodeLearn-Database-${env}`, {
  env: { account, region },
  stackName: `codelearn-database-${env}`,
  description: 'DynamoDB tables for CodeLearn platform',
  tags: {
    Environment: env,
    Project: 'CodeLearn',
    ManagedBy: 'CDK',
  },
});

// Storage Stack - S3 buckets
const storageStack = new StorageStack(app, `CodeLearn-Storage-${env}`, {
  env: { account, region },
  stackName: `codelearn-storage-${env}`,
  description: 'S3 buckets for CodeLearn platform',
  tags: {
    Environment: env,
    Project: 'CodeLearn',
    ManagedBy: 'CDK',
  },
});

// Auth Stack - Cognito User Pools
const authStack = new AuthStack(app, `CodeLearn-Auth-${env}`, {
  env: { account, region },
  stackName: `codelearn-auth-${env}`,
  description: 'Cognito authentication for CodeLearn platform',
  tags: {
    Environment: env,
    Project: 'CodeLearn',
    ManagedBy: 'CDK',
  },
});

// Queue Stack - SQS queues
const queueStack = new QueueStack(app, `CodeLearn-Queue-${env}`, {
  env: { account, region },
  stackName: `codelearn-queue-${env}`,
  description: 'SQS queues for async job processing',
  tags: {
    Environment: env,
    Project: 'CodeLearn',
    ManagedBy: 'CDK',
  },
});

app.synth();
