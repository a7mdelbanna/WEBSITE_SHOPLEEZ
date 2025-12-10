'use client';

/**
 * Auth Context
 *
 * Manages authentication state including:
 * - User profile
 * - Auth tokens
 * - Login modal visibility
 * - Login/logout actions
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { getTokens, setTokens, clearTokens, isAuthenticated as checkAuth } from '@/lib/api/client';
import type { UserProfile, AuthTokens } from '@/types/api';

interface AuthContextValue {
  // User state
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Modal control
  loginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;

  // Auth actions
  login: (tokens: AuthTokens, profile?: UserProfile) => void;
  logout: () => void;
  setUser: (user: UserProfile | null) => void;

  // Utility
  requireAuth: (callback?: () => void) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Check for existing auth on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const authenticated = checkAuth();
        if (authenticated) {
          // User is authenticated but we don't have profile yet
          // Profile will be fetched separately via useProfile hook
          // For now, just mark as authenticated
        }
      } catch (error) {
        console.error('Auth init error:', error);
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login - save tokens and set user
  const login = useCallback((tokens: AuthTokens, profile?: UserProfile) => {
    setTokens(tokens);
    if (profile) {
      setUser(profile);
    }
    setLoginModalOpen(false);
  }, []);

  // Logout - clear everything
  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  // Open login modal
  const openLoginModal = useCallback(() => {
    setLoginModalOpen(true);
  }, []);

  // Close login modal
  const closeLoginModal = useCallback(() => {
    setLoginModalOpen(false);
  }, []);

  // Check auth and open modal if not authenticated
  // Returns true if authenticated, false if not
  const requireAuth = useCallback((callback?: () => void): boolean => {
    const authenticated = checkAuth() || user !== null;
    if (!authenticated) {
      openLoginModal();
      return false;
    }
    if (callback) {
      callback();
    }
    return true;
  }, [user, openLoginModal]);

  const value: AuthContextValue = {
    user,
    isAuthenticated: checkAuth() || user !== null,
    isLoading,
    loginModalOpen,
    openLoginModal,
    closeLoginModal,
    login,
    logout,
    setUser,
    requireAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
