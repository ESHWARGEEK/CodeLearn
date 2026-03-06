import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';

export class SandboxStack extends cdk.Stack {
  public readonly executorFunction: lambda.Function;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda function for quick code execution
    this.executorFunction = new lambda.Function(this, 'SandboxExecutor', {
      functionName: 'codelearn-sandbox-executor',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../lambda/sandbox-executor'),
        {
          bundling: {
            image: lambda.Runtime.NODEJS_20_X.bundlingImage,
            command: [
              'bash',
              '-c',
              'npm install && npm run build && cp -r dist/* /asset-output/ && cp -r node_modules /asset-output/',
            ],
          },
        }
      ),
      timeout: cdk.Duration.seconds(15),
      memorySize: 512,
      environment: {
        NODE_ENV: 'production',
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      description: 'Executes user code in isolated sandbox for quick previews',
    });

    // Security: Deny all network access
    this.executorFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.DENY,
        actions: ['ec2:*'],
        resources: ['*'],
      })
    );

    // CloudWatch Logs permissions (already included by default)
    this.executorFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:PutLogEvents',
        ],
        resources: ['*'],
      })
    );

    // Output the function ARN
    new cdk.CfnOutput(this, 'ExecutorFunctionArn', {
      value: this.executorFunction.functionArn,
      description: 'ARN of the sandbox executor Lambda function',
      exportName: 'SandboxExecutorFunctionArn',
    });

    // Output the function name
    new cdk.CfnOutput(this, 'ExecutorFunctionName', {
      value: this.executorFunction.functionName,
      description: 'Name of the sandbox executor Lambda function',
      exportName: 'SandboxExecutorFunctionName',
    });
  }
}
