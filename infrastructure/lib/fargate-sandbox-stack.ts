import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';

export class FargateSandboxStack extends cdk.Stack {
  public readonly cluster: ecs.Cluster;
  public readonly taskDefinition: ecs.FargateTaskDefinition;
  public readonly securityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC for Fargate tasks
    const vpc = new ec2.Vpc(this, 'SandboxVpc', {
      vpcName: 'codelearn-sandbox-vpc',
      maxAzs: 2,
      natGateways: 0, // No NAT gateway to save costs (no outbound internet)
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // Create ECS Cluster
    this.cluster = new ecs.Cluster(this, 'SandboxCluster', {
      clusterName: 'codelearn-sandbox-cluster',
      vpc,
      containerInsights: true,
    });

    // Security Group - deny all inbound, allow minimal outbound
    this.securityGroup = new ec2.SecurityGroup(this, 'SandboxSecurityGroup', {
      vpc,
      securityGroupName: 'codelearn-sandbox-sg',
      description: 'Security group for sandbox Fargate tasks',
      allowAllOutbound: false, // Explicitly deny all outbound
    });

    // Task execution role (for ECS to pull images and write logs)
    const executionRole = new iam.Role(this, 'TaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AmazonECSTaskExecutionRolePolicy'
        ),
      ],
    });

    // Task role (for the container itself - minimal permissions)
    const taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    // Deny all network access from task role
    taskRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.DENY,
        actions: ['ec2:*', 's3:*', 'dynamodb:*'],
        resources: ['*'],
      })
    );

    // Create Fargate Task Definition
    this.taskDefinition = new ecs.FargateTaskDefinition(
      this,
      'SandboxTaskDefinition',
      {
        family: 'codelearn-sandbox-executor',
        cpu: 1024, // 1 vCPU
        memoryLimitMiB: 2048, // 2 GB
        executionRole,
        taskRole,
      }
    );

    // CloudWatch Log Group
    const logGroup = new logs.LogGroup(this, 'SandboxLogGroup', {
      logGroupName: '/ecs/codelearn-sandbox',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Add container to task definition
    const container = this.taskDefinition.addContainer('SandboxContainer', {
      containerName: 'sandbox-executor',
      image: ecs.ContainerImage.fromAsset(
        path.join(__dirname, '../fargate/sandbox-executor')
      ),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'sandbox',
        logGroup,
      }),
      environment: {
        NODE_ENV: 'production',
        EXECUTION_TIMEOUT: '1800000', // 30 minutes in ms
      },
      stopTimeout: cdk.Duration.seconds(30),
    });

    // Outputs
    new cdk.CfnOutput(this, 'ClusterArn', {
      value: this.cluster.clusterArn,
      description: 'ARN of the ECS cluster',
      exportName: 'SandboxClusterArn',
    });

    new cdk.CfnOutput(this, 'TaskDefinitionArn', {
      value: this.taskDefinition.taskDefinitionArn,
      description: 'ARN of the Fargate task definition',
      exportName: 'SandboxTaskDefinitionArn',
    });

    new cdk.CfnOutput(this, 'SecurityGroupId', {
      value: this.securityGroup.securityGroupId,
      description: 'Security group ID for sandbox tasks',
      exportName: 'SandboxSecurityGroupId',
    });

    new cdk.CfnOutput(this, 'VpcId', {
      value: vpc.vpcId,
      description: 'VPC ID for sandbox tasks',
      exportName: 'SandboxVpcId',
    });
  }
}
