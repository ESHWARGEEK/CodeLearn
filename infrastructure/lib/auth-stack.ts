import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly identityPool: cognito.CfnIdentityPool;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const env = this.node.tryGetContext('env') || 'dev';

    // Cognito User Pool
    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: `codelearn-users-${env}`,
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // User Pool Client
    this.userPoolClient = this.userPool.addClient('UserPoolClient', {
      userPoolClientName: `codelearn-client-${env}`,
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: [
          'http://localhost:3000/api/auth/callback',
          // TODO: Add production callback URLs
        ],
        logoutUrls: [
          'http://localhost:3000',
          // TODO: Add production logout URLs
        ],
      },
      accessTokenValidity: cdk.Duration.hours(1),
      refreshTokenValidity: cdk.Duration.days(30),
      idTokenValidity: cdk.Duration.hours(1),
    });

    // GitHub OAuth Provider
    const githubProvider = new cognito.UserPoolIdentityProviderOidc(this, 'GitHubProvider', {
      name: 'GitHub',
      userPool: this.userPool,
      clientId: process.env.GITHUB_CLIENT_ID || 'placeholder-github-client-id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'placeholder-github-client-secret',
      issuerUrl: 'https://github.com',
      attributeMapping: {
        email: cognito.ProviderAttribute.other('email'),
        preferredUsername: cognito.ProviderAttribute.other('login'),
        profilePicture: cognito.ProviderAttribute.other('avatar_url'),
      },
      scopes: ['user:email', 'read:user'],
    });

    // Google OAuth Provider
    const googleProvider = new cognito.UserPoolIdentityProviderGoogle(this, 'GoogleProvider', {
      userPool: this.userPool,
      clientId: process.env.GOOGLE_CLIENT_ID || 'placeholder-google-client-id',
      clientSecretValue: cdk.SecretValue.unsafePlainText(
        process.env.GOOGLE_CLIENT_SECRET || 'placeholder-google-client-secret'
      ),
      scopes: ['email', 'profile', 'openid'],
      attributeMapping: {
        email: cognito.ProviderAttribute.GOOGLE_EMAIL,
        givenName: cognito.ProviderAttribute.GOOGLE_GIVEN_NAME,
        familyName: cognito.ProviderAttribute.GOOGLE_FAMILY_NAME,
        profilePicture: cognito.ProviderAttribute.GOOGLE_PICTURE,
      },
    });

    // Add dependencies to ensure providers are created before client
    this.userPoolClient.node.addDependency(githubProvider);
    this.userPoolClient.node.addDependency(googleProvider);

    // User Pool Domain
    this.userPool.addDomain('UserPoolDomain', {
      cognitoDomain: {
        domainPrefix: `codelearn-${env}`,
      },
    });

    // Identity Pool for federated identities
    this.identityPool = new cognito.CfnIdentityPool(this, 'IdentityPool', {
      identityPoolName: `codelearn_identity_pool_${env}`,
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [
        {
          clientId: this.userPoolClient.userPoolClientId,
          providerName: this.userPool.userPoolProviderName,
        },
      ],
    });

    // Output Cognito details for environment variables
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: `codelearn-user-pool-id-${env}`,
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: `codelearn-user-pool-client-id-${env}`,
    });

    new cdk.CfnOutput(this, 'IdentityPoolId', {
      value: this.identityPool.ref,
      description: 'Cognito Identity Pool ID',
      exportName: `codelearn-identity-pool-id-${env}`,
    });

    new cdk.CfnOutput(this, 'UserPoolDomain', {
      value: `https://codelearn-${env}.auth.${this.region}.amazoncognito.com`,
      description: 'Cognito User Pool Domain',
      exportName: `codelearn-user-pool-domain-${env}`,
    });
  }
}
