'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthContextValue } from '@/types';
import { signin as signinApi, signup as signupApi, signout as signoutApi } from '@/lib/api/auth';
import { saveToken, getToken, saveUser, getUser, clearAuthData } from './token';
import { apiClient } from '@/lib/api/client';

/**
 * Auth Context
 * Provides authentication state and actions throughout the app
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /**
   * Load token and user from localStorage on mount
   */
  const loadToken = () => {
    const storedToken = getToken();
    const storedUser = getUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      apiClient.setToken(storedToken);
    }

    setLoading(false);
  };

  /**
   * Sign up a new user
   */
  const signup = async (email: string, password: string) => {
    await signupApi(email, password);
    // Note: signup doesn't return token, user must signin after
  };

  /**
   * Sign in an existing user
   */
  const signin = async (email: string, password: string) => {
    const response = await signinApi(email, password);

    // Save token and user
    saveToken(response.token);
    saveUser(response.user);

    // Update state
    setToken(response.token);
    setUser(response.user);

    // Set token in API client
    apiClient.setToken(response.token);
  };

  /**
   * Sign out the current user
   */
  const signout = () => {
    // Call backend signout (optional)
    signoutApi().catch(() => {
      // Ignore errors
    });

    // Clear local state
    clearAuthData();
    setToken(null);
    setUser(null);
    apiClient.setToken(null);

    // Redirect to signin
    router.push('/signin');
  };

  /**
   * Load token on mount
   */
  useEffect(() => {
    loadToken();
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    loading,
    signin,
    signup,
    signout,
    loadToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
