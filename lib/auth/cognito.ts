// AWS Cognito Integration for CodeLearn Platform
// Task 3.1: Cognito SDK integration with JWT verification

import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  RespondToAuthChallengeCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  GetUserCommand,
  GlobalSignOutCommand,
  AdminGetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import * as crypto from 'crypto';
import type { AuthTokens, User } from '@/types/auth';

// Shared AWS region constant with fallback
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!;
const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET;

// JWKS endpoint for token verification
const JWKS_URI = `https://cognito-idp.${AWS_REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`;
const JWKS = createRemoteJWKSet(new URL(JWKS_URI));

/**
 * Compute SecretHash for Cognito operations
 * Required when CLIENT_SECRET is configured
 */
function computeSecretHash(username: string): string | undefined {
  if (!CLIENT_SECRET) {
    return undefined;
  }

  const message = username + CLIENT_ID;
  const hmac = crypto.createHmac('sha256', CLIENT_SECRET);
  hmac.update(message);
  return hmac.digest('base64');
}

/**
 * Build Basic Authorization header for OAuth token exchange
 */
function buildAuthHeader(): string | undefined {
  if (!CLIENT_SECRET) {
    return undefined;
  }

  const credentials = `${CLIENT_ID}:${CLIENT_SECRET}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

/**
 * Sign up a new user with email and password
 */
export async function signUpUser(
  email: string,
  password: string,
  name?: string
): Promise<{ userId: string; userConfirmed: boolean }> {
  try {
    const secretHash = computeSecretHash(email);

    const command = new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
      SecretHash: secretHash,
      UserAttributes: [
        { Name: 'email', Value: email },
        ...(name ? [{ Name: 'name', Value: name }] : []),
      ],
    });

    const response = await cognitoClient.send(command);

    return {
      userId: response.UserSub!,
      userConfirmed: response.UserConfirmed || false,
    };
  } catch (error: any) {
    console.error('Cognito signup error:', error);
    throw new Error(error.message || 'Failed to sign up user');
  }
}

/**
 * Confirm user signup with verification code
 */
export async function confirmSignUp(email: string, code: string): Promise<void> {
  try {
    const secretHash = computeSecretHash(email);

    const command = new ConfirmSignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      SecretHash: secretHash,
    });

    await cognitoClient.send(command);
  } catch (error: any) {
    console.error('Cognito confirm signup error:', error);
    throw new Error(error.message || 'Failed to confirm signup');
  }
}

/**
 * Sign in user with email and password
 */
export async function signInUser(email: string, password: string): Promise<AuthTokens> {
  try {
    const secretHash = computeSecretHash(email);

    const authParameters: Record<string, string> = {
      USERNAME: email,
      PASSWORD: password,
    };

    if (secretHash) {
      authParameters.SECRET_HASH = secretHash;
    }

    const command = new InitiateAuthCommand({
      ClientId: CLIENT_ID,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: authParameters,
    });

    const response = await cognitoClient.send(command);

    if (!response.AuthenticationResult) {
      throw new Error('Authentication failed');
    }

    return {
      accessToken: response.AuthenticationResult.AccessToken!,
      refreshToken: response.AuthenticationResult.RefreshToken!,
      idToken: response.AuthenticationResult.IdToken!,
      expiresIn: response.AuthenticationResult.ExpiresIn || 3600,
    };
  } catch (error: any) {
    console.error('Cognito signin error:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
  try {
    const authParameters: Record<string, string> = {
      REFRESH_TOKEN: refreshToken,
    };

    // Note: SECRET_HASH is not required for REFRESH_TOKEN_AUTH flow
    // as the refresh token itself authenticates the request

    const command = new InitiateAuthCommand({
      ClientId: CLIENT_ID,
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      AuthParameters: authParameters,
    });

    const response = await cognitoClient.send(command);

    if (!response.AuthenticationResult) {
      throw new Error('Token refresh failed');
    }

    return {
      accessToken: response.AuthenticationResult.AccessToken!,
      refreshToken: refreshToken, // Refresh token doesn't change
      idToken: response.AuthenticationResult.IdToken!,
      expiresIn: response.AuthenticationResult.ExpiresIn || 3600,
    };
  } catch (error: any) {
    console.error('Cognito token refresh error:', error);
    throw new Error(error.message || 'Failed to refresh token');
  }
}

/**
 * Verify JWT token and extract payload
 */
export async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://cognito-idp.${AWS_REGION}.amazonaws.com/${USER_POOL_ID}`,
      audience: CLIENT_ID,
    });

    return payload;
  } catch (error: any) {
    console.error('JWT verification error:', error);
    throw new Error('Invalid or expired token');
  }
}

/**
 * Get user details from access token
 */
export async function getUserFromToken(accessToken: string): Promise<User> {
  try {
    const command = new GetUserCommand({
      AccessToken: accessToken,
    });

    const response = await cognitoClient.send(command);

    const attributes = response.UserAttributes || [];
    const getAttributeValue = (name: string) =>
      attributes.find((attr) => attr.Name === name)?.Value;

    return {
      userId: response.Username!,
      email: getAttributeValue('email') || '',
      name: getAttributeValue('name'),
      avatar: getAttributeValue('picture'),
      tier: (getAttributeValue('custom:tier') as any) || 'free',
      createdAt: getAttributeValue('custom:createdAt') || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      onboardingComplete: getAttributeValue('custom:onboardingComplete') === 'true',
    };
  } catch (error: any) {
    console.error('Get user error:', error);
    throw new Error(error.message || 'Failed to get user details');
  }
}

/**
 * Sign out user globally (invalidate all tokens)
 */
export async function signOutUser(accessToken: string): Promise<void> {
  try {
    const command = new GlobalSignOutCommand({
      AccessToken: accessToken,
    });

    await cognitoClient.send(command);
  } catch (error: any) {
    console.error('Cognito signout error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
}

/**
 * Initiate password reset flow
 */
export async function forgotPassword(email: string): Promise<void> {
  try {
    const secretHash = computeSecretHash(email);

    const command = new ForgotPasswordCommand({
      ClientId: CLIENT_ID,
      Username: email,
      SecretHash: secretHash,
    });

    await cognitoClient.send(command);
  } catch (error: any) {
    console.error('Forgot password error:', error);
    throw new Error(error.message || 'Failed to initiate password reset');
  }
}

/**
 * Confirm password reset with code
 */
export async function confirmPasswordReset(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  try {
    const secretHash = computeSecretHash(email);

    const command = new ConfirmForgotPasswordCommand({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
      SecretHash: secretHash,
    });

    await cognitoClient.send(command);
  } catch (error: any) {
    console.error('Confirm password reset error:', error);
    throw new Error(error.message || 'Failed to reset password');
  }
}

/**
 * Exchange OAuth authorization code for tokens
 */
export async function exchangeOAuthCode(
  code: string,
  provider: 'github' | 'google'
): Promise<AuthTokens> {
  try {
    const cognitoDomain = `https://${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}`;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/${provider}`;

    const authHeader = buildAuthHeader();
    const headers: HeadersInit = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    // Add Basic Auth header if CLIENT_SECRET is configured
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const bodyParams: Record<string, string> = {
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      code: code,
      redirect_uri: redirectUri,
    };

    // Include client_secret in body if not using Basic Auth
    // (Cognito accepts both methods)
    if (CLIENT_SECRET && !authHeader) {
      bodyParams.client_secret = CLIENT_SECRET;
    }

    const response = await fetch(`${cognitoDomain}/oauth2/token`, {
      method: 'POST',
      headers,
      body: new URLSearchParams(bodyParams),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OAuth token exchange failed:', errorText);
      throw new Error('OAuth token exchange failed');
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      idToken: data.id_token,
      expiresIn: data.expires_in,
    };
  } catch (error: any) {
    console.error('OAuth code exchange error:', error);
    throw new Error(error.message || 'Failed to exchange OAuth code');
  }
}
