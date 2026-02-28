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
import type { AuthTokens, User } from '@/types/auth';

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!;
const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET;

// JWKS endpoint for token verification
const JWKS_URI = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`;
const JWKS = createRemoteJWKSet(new URL(JWKS_URI));

/**
 * Sign up a new user with email and password
 */
export async function signUpUser(
  email: string,
  password: string,
  name?: string
): Promise<{ userId: string; userConfirmed: boolean }> {
  try {
    const command = new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
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
    const command = new ConfirmSignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
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
    const command = new InitiateAuthCommand({
      ClientId: CLIENT_ID,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
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
    const command = new InitiateAuthCommand({
      ClientId: CLIENT_ID,
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
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
      issuer: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${USER_POOL_ID}`,
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
    const command = new ForgotPasswordCommand({
      ClientId: CLIENT_ID,
      Username: email,
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
    const command = new ConfirmForgotPasswordCommand({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
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
    // This would typically call Cognito's token endpoint
    // For now, we'll use the hosted UI flow
    const cognitoDomain = `https://${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}`;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/${provider}`;

    const response = await fetch(`${cognitoDomain}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
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
