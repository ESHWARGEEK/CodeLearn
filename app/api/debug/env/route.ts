// Debug endpoint to check environment variables
// DELETE THIS FILE AFTER DEBUGGING - IT EXPOSES CONFIG

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    env: {
      NEXT_PUBLIC_COGNITO_USER_POOL_ID: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || 'NOT_SET',
      NEXT_PUBLIC_COGNITO_CLIENT_ID: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || 'NOT_SET',
      NEXT_PUBLIC_COGNITO_DOMAIN: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'NOT_SET',
      AWS_REGION: process.env.AWS_REGION || 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NOT_SET',
      // Don't expose secrets, just check if they exist
      HAS_GITHUB_CLIENT_SECRET: !!process.env.GITHUB_CLIENT_SECRET,
      HAS_GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    },
  });
}
