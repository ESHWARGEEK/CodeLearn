// Authentication Types for CodeLearn Platform
// Task 3.1: Define TypeScript interfaces for authentication

export interface User {
  userId: string;
  email: string;
  name?: string;
  avatar?: string;
  tier: 'free' | 'pro' | 'team';
  createdAt: string;
  updatedAt: string;
  onboardingComplete: boolean;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name?: string;
  acceptTerms: boolean;
}

export interface OAuthProvider {
  provider: 'github' | 'google';
  code?: string;
  state?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    tokens: AuthTokens;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  email: string;
  code: string;
  newPassword: string;
}
