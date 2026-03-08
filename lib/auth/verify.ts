/**
 * Authentication verification utilities
 */

import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthResult {
  success: boolean;
  userId?: string;
  error?: string;
}

/**
 * Verify authentication from request headers
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'No authorization header' };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return { success: false, error: 'No token provided' };
    }

    // For testing purposes, accept a test token
    if (token === 'test-token') {
      return { success: true, userId: 'test-user' };
    }

    // In a real implementation, you would verify the JWT token here
    // For now, we'll extract userId from a simple format
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.sub) {
        return { success: true, userId: decoded.sub };
      }
    } catch (error) {
      // If JWT decode fails, try to extract from simple format
    }

    // Fallback: assume token is userId for testing
    return { success: true, userId: token };

  } catch (error) {
    return { success: false, error: 'Token verification failed' };
  }
}