import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

interface ComputeStackProps extends cdk.StackProps {
  aiJobsQueue: sqs.Queue;
  aiJobsDlq: sqs.Queue;
}

export class ComputeStack extends cdk.Stack {
  public readonly cluster: ecs.Cluster;
  public readonly aiWorkerTaskDefinition: ecs.FargateTaskDefinition;
  public readonly aiWorkerService: ecs.FargateService;

  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    const env = this.node.tryGetContext('env') || 'dev';

    // Create VPC for ECS cluster
    const vpc = new ec2.Vpc(this, 'CodeLearnVpc', {
      vpcName: `codelearn-vpc-${env}`,
      maxAzs: 2,
      natGateways: 1, // Cost optimization - single NAT gateway
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    // ECS Cluster
    this.cluster = new ecs.Cluster(this, 'AiWorkerCluster', {
      clusterName: `codelearn-ai-workers-${env}`,
      vpc,
      containerInsights: true,
    });

    // CloudWatch Log Group for AI Worker tasks
    const logGroup = new logs.LogGroup(this, 'AiWorkerLogGroup', {
      logGroupName: `/ecs/codelearn-ai-worker-${env}`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Task Execution Role
    const taskExecutionRole = new iam.Role(this, 'AiWorkerTaskExecutionRole', {
      roleName: `codelearn-ai-worker-execution-role-${env}`,
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    // Task Role (for application permissions)
    const taskRole = new iam.Role(this, 'AiWorkerTaskRole', {
      roleName: `codelearn-ai-worker-task-role-${env}`,
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    // Grant permissions to access SQS queues
    props.aiJobsQueue.grantConsumeMessages(taskRole);
    props.aiJobsDlq.grantSendMessages(taskRole);

    // Grant permissions to access DynamoDB tables
    taskRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:Query',
        'dynamodb:Scan',
      ],
      resources: [
        `arn:aws:dynamodb:${this.region}:${this.account}:table/codelearn-*-${env}`,
        `arn:aws:dynamodb:${this.region}:${this.account}:table/codelearn-*-${env}/index/*`,
      ],
    }));

    // Grant permissions to access S3 buckets
    taskRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:GetObject',
        's3:PutObject',
        's3:DeleteObject',
      ],
      resources: [
        `arn:aws:s3:::codelearn-*-${env}/*`,
      ],
    }));

    // Grant permissions to access Bedrock for AI models
    taskRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeModelWithResponseStream',
      ],
      resources: [
        `arn:aws:bedrock:${this.region}::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0`,
        `arn:aws:bedrock:${this.region}::foundation-model/meta.llama3-1-70b-instruct-v1:0`,
      ],
    }));

    // Fargate Task Definition
    this.aiWorkerTaskDefinition = new ecs.FargateTaskDefinition(this, 'AiWorkerTaskDefinition', {
      family: `codelearn-ai-worker-${env}`,
      cpu: 1024, // 1 vCPU
      memoryLimitMiB: 2048, // 2 GB RAM
      executionRole: taskExecutionRole,
      taskRole: taskRole,
    });

    // Container Definition
    const aiWorkerContainer = this.aiWorkerTaskDefinition.addContainer('AiWorkerContainer', {
      containerName: 'ai-worker',
      image: ecs.ContainerImage.fromRegistry('node:18-alpine'), // Placeholder - will be replaced with actual image
      essential: true,
      logging: ecs.LogDrivers.awsLogs({
        logGroup,
        streamPrefix: 'ai-worker',
      }),
      environment: {
        NODE_ENV: 'production',
        AWS_REGION: this.region,
        SQS_QUEUE_URL: props.aiJobsQueue.queueUrl,
        SQS_DLQ_URL: props.aiJobsDlq.queueUrl,
        ENVIRONMENT: env,
      },
      secrets: {
        // These will be populated from AWS Systems Manager Parameter Store
        OPENAI_API_KEY: ecs.Secret.fromSsmParameter(
          ssm.StringParameter.fromStringParameterName(
            this,
            'OpenAiApiKey',
            `/codelearn/${env}/openai-api-key`
          )
        ),
      },
      healthCheck: {
        command: ['CMD-SHELL', 'node --version || exit 1'],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
        startPeriod: cdk.Duration.seconds(60),
      },
    });

    // Security Group for AI Worker tasks
    const aiWorkerSecurityGroup = new ec2.SecurityGroup(this, 'AiWorkerSecurityGroup', {
      securityGroupName: `codelearn-ai-worker-sg-${env}`,
      vpc,
      description: 'Security group for AI Worker ECS tasks',
      allowAllOutbound: true, // Required for API calls to external services
    });

    // Fargate Service
    this.aiWorkerService = new ecs.FargateService(this, 'AiWorkerService', {
      serviceName: `codelearn-ai-worker-${env}`,
      cluster: this.cluster,
      taskDefinition: this.aiWorkerTaskDefinition,
      desiredCount: 1, // Start with 1 instance, can be scaled based on queue depth
      minHealthyPercent: 0, // Allow stopping all tasks during deployment
      maxHealthyPercent: 200, // Allow double capacity during deployment
      securityGroups: [aiWorkerSecurityGroup],
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      enableLogging: true,
      enableExecuteCommand: true, // For debugging
    });

    // Auto Scaling based on SQS queue depth
    const scaling = this.aiWorkerService.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 10,
    });

    // Scale up when queue has more than 5 messages
    scaling.scaleOnMetric('QueueDepthScaling', {
      metric: props.aiJobsQueue.metricApproximateNumberOfMessagesVisible(),
      scalingSteps: [
        { upper: 5, change: 0 },
        { lower: 5, change: +1 },
        { lower: 20, change: +2 },
        { lower: 50, change: +3 },
      ],
      adjustmentType: cdk.aws_applicationautoscaling.AdjustmentType.CHANGE_IN_CAPACITY,
      cooldown: cdk.Duration.minutes(5),
    });

    // Outputs
    new cdk.CfnOutput(this, 'ClusterName', {
      value: this.cluster.clusterName,
      description: 'ECS Cluster name',
      exportName: `codelearn-cluster-name-${env}`,
    });

    new cdk.CfnOutput(this, 'ClusterArn', {
      value: this.cluster.clusterArn,
      description: 'ECS Cluster ARN',
      exportName: `codelearn-cluster-arn-${env}`,
    });

    new cdk.CfnOutput(this, 'TaskDefinitionArn', {
      value: this.aiWorkerTaskDefinition.taskDefinitionArn,
      description: 'AI Worker task definition ARN',
      exportName: `codelearn-ai-worker-task-def-arn-${env}`,
    });

    new cdk.CfnOutput(this, 'ServiceName', {
      value: this.aiWorkerService.serviceName,
      description: 'AI Worker service name',
      exportName: `codelearn-ai-worker-service-name-${env}`,
    });

    new cdk.CfnOutput(this, 'ServiceArn', {
      value: this.aiWorkerService.serviceArn,
      description: 'AI Worker service ARN',
      exportName: `codelearn-ai-worker-service-arn-${env}`,
    });

    new cdk.CfnOutput(this, 'VpcId', {
      value: vpc.vpcId,
      description: 'VPC ID',
      exportName: `codelearn-vpc-id-${env}`,
    });
  }
}