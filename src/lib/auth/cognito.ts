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