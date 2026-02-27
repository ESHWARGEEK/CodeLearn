import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';

export class StorageStack extends cdk.Stack {
  public readonly userProjectsBucket: s3.Bucket;
  public readonly templatesBucket: s3.Bucket;
  public readonly assetsBucket: s3.Bucket;
  public readonly assetsDistribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const env = this.node.tryGetContext('env') || 'dev';

    // User Projects Bucket
    // Stores user project code with versioning enabled
    this.userProjectsBucket = new s3.Bucket(this, 'UserProjectsBucket', {
      bucketName: `codelearn-user-projects-${env}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.DELETE,
          ],
          allowedOrigins: ['*'], // TODO: Restrict to actual domain in production
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
    });

    // Templates Bucket
    // Stores extracted code templates with lifecycle policies
    this.templatesBucket = new s3.Bucket(this, 'TemplatesBucket', {
      bucketName: `codelearn-templates-${env}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      lifecycleRules: [
        {
          id: 'DeleteOldVersions',
          enabled: true,
          noncurrentVersionExpiration: cdk.Duration.days(90),
        },
        {
          id: 'TransitionToIA',
          enabled: true,
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(30),
            },
          ],
        },
      ],
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
          allowedOrigins: ['*'], // TODO: Restrict to actual domain in production
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
    });

    // Assets Bucket
    // Stores static assets (images, avatars, previews) with CloudFront CDN
    this.assetsBucket = new s3.Bucket(this, 'AssetsBucket', {
      bucketName: `codelearn-assets-${env}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
          allowedOrigins: ['*'], // TODO: Restrict to actual domain in production
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
    });

    // CloudFront Distribution for Assets Bucket
    this.assetsDistribution = new cloudfront.Distribution(this, 'AssetsDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(this.assetsBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // Use only North America and Europe
      comment: `CodeLearn Assets CDN - ${env}`,
    });

    // Output bucket names and CDN URL for environment variables
    new cdk.CfnOutput(this, 'UserProjectsBucketName', {
      value: this.userProjectsBucket.bucketName,
      description: 'User projects bucket name',
      exportName: `codelearn-user-projects-bucket-${env}`,
    });

    new cdk.CfnOutput(this, 'TemplatesBucketName', {
      value: this.templatesBucket.bucketName,
      description: 'Templates bucket name',
      exportName: `codelearn-templates-bucket-${env}`,
    });

    new cdk.CfnOutput(this, 'AssetsBucketName', {
      value: this.assetsBucket.bucketName,
      description: 'Assets bucket name',
      exportName: `codelearn-assets-bucket-${env}`,
    });

    new cdk.CfnOutput(this, 'AssetsCdnUrl', {
      value: `https://${this.assetsDistribution.distributionDomainName}`,
      description: 'CloudFront CDN URL for assets',
      exportName: `codelearn-assets-cdn-url-${env}`,
    });
  }
}
