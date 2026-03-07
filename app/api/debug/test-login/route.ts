// Debug endpoint to test Cognito connection
// DELETE THIS FILE AFTER DEBUGGING

import { NextResponse } from 'next/server';
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider';

export async function GET() {
  try {
    const client = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });

    // Try to list users to test connection
    const command = new ListUsersCommand({
      UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      Limit: 1,
    });

    const response = await client.send(command);

    return NextResponse.json({
      success: true,
      message: 'Cognito connection successful',
      userCount: response.Users?.length || 0,
      hasAwsCredentials: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.name,
        hasAwsCredentials: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
      },
      { status: 500 }
    );
  }
}
