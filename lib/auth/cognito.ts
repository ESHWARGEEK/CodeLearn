// Minimal stub for Vercel deployment
import { NextRequest, NextResponse } from 'next/server';

export async function authenticateUser(email: string, password: string) {
  return { success: false, error: 'Authentication not available in minimal deployment' };
}

export async function signUpUser(email: string, password: string) {
  return { success: false, error: 'Sign up not available in minimal deployment' };
}

export async function signOutUser() {
  return { success: true };
}

export async function getCurrentUser(request: NextRequest) {
  return null;
}

export function createAuthResponse(data: any) {
  return NextResponse.json(data);
}

export async function exchangeOAuthCode(code: string, provider: 'github' | 'google') {
  return {
    accessToken: 'stub-token',
    refreshToken: 'stub-refresh',
    expiresIn: 3600
  };
}

export async function getUserFromToken(token: string) {
  return {
    userId: 'stub-user-id',
    email: 'stub@example.com',
    name: 'Stub User',
    onboardingComplete: false
  };
}