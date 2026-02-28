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

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedTokens = localStorage.getItem('auth-tokens');
        if (storedTokens) {
          const parsedTokens: AuthTokens = JSON.parse(storedTokens);
          setTokens(parsedTokens);

          // Fetch user details
          const response = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${parsedTokens.accessToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('auth-tokens');
            setTokens(null);
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem('auth-tokens');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const logout = useCallback(async () => {
    try {
      if (tokens) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setTokens(null);
      localStorage.removeItem('auth-tokens');
      router.push('/login');
    }
  }, [tokens, router]);

  const refreshToken = useCallback(async () => {
    try {
      // Refresh token is stored in httpOnly cookie, no need to send in body
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include', // Include cookies in request
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      setTokens(data.data.tokens);
      localStorage.setItem('auth-tokens', JSON.stringify(data.data.tokens));
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
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || 'Login failed');
        }

        setUser(data.data.user);
        setTokens(data.data.tokens);
        localStorage.setItem('auth-tokens', JSON.stringify(data.data.tokens));

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
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || 'Signup failed');
        }

        setUser(data.data.user);
        setTokens(data.data.tokens);
        localStorage.setItem('auth-tokens', JSON.stringify(data.data.tokens));

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
