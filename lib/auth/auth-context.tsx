'use client';

// Authentication Context Provider for CodeLearn Platform
// Task 3.1: React Context API for global auth state

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User, AuthTokens } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from server on mount (using httpOnly cookie)
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Fetch user details from server (cookie is sent automatically)
        const response = await fetch('/api/auth/me', {
          credentials: 'include', // Include httpOnly cookies
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.data.user);
          // Note: We don't store tokens in state anymore since they're in httpOnly cookies
          // We only keep minimal token info if needed for UI (like expiry time)
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const logout = useCallback(async () => {
    try {
      // Logout call will clear httpOnly cookies on server
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setTokens(null);
      router.push('/login');
    }
  }, [router]);

  const refreshToken = useCallback(async () => {
    try {
      // Refresh token is stored in httpOnly cookie
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include', // Include cookies in request
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      // Update in-memory token info if needed (ephemeral only)
      setTokens(data.data.tokens);
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout user
      await logout();
    }
  }, [logout]);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!tokens) return;

    const refreshInterval = (tokens.expiresIn - 300) * 1000; // Refresh 5 minutes before expiry
    const timer = setTimeout(() => {
      refreshToken();
    }, refreshInterval);

    return () => clearTimeout(timer);
  }, [tokens, refreshToken]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include', // Include cookies
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || 'Login failed');
        }

        setUser(data.data.user);
        // Store token info in-memory (ephemeral) for auto-refresh logic
        setTokens(data.data.tokens);

        // Redirect to dashboard
        router.push('/dashboard');
      } catch (error: any) {
        console.error('Login error:', error);
        throw error;
      }
    },
    [router]
  );

  const signup = useCallback(
    async (email: string, password: string, name?: string) => {
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, acceptTerms: true }),
          credentials: 'include', // Include cookies
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || 'Signup failed');
        }

        setUser(data.data.user);
        // Store token info in-memory (ephemeral) for auto-refresh logic
        setTokens(data.data.tokens);

        // Redirect to onboarding
        router.push('/onboarding');
      } catch (error: any) {
        console.error('Signup error:', error);
        throw error;
      }
    },
    [router]
  );

  const value: AuthContextType = {
    user,
    tokens,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
