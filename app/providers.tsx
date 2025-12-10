'use client';

/**
 * Client-side Providers
 *
 * Wraps the app with all necessary client-side providers:
 * - TanStack Query for server state
 * - Tenant context for multi-store support
 * - API client for backend communication
 * - Auth context for user authentication
 * - Zustand stores are auto-initialized
 */

import { useState, useEffect, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TenantProvider } from '@/lib/hooks/use-tenant';
import { ApiClientProvider } from '@/lib/api/provider';
import { AuthProvider, useAuth } from '@/lib/contexts/auth-context';
import { useProfile } from '@/lib/services/auth';
import { LoginModal } from '@/components/auth/login-modal';
import type { TenantConfig } from '@/types/tenant';

/**
 * Component that automatically fetches user profile when authenticated
 * This ensures the header shows the user's name after login
 */
function AuthProfileFetcher() {
  const { isAuthenticated, setUser } = useAuth();
  const { data: profile, isSuccess } = useProfile(isAuthenticated);

  useEffect(() => {
    if (isSuccess && profile) {
      console.log('[AuthProfileFetcher] Setting user profile:', profile);
      setUser(profile);
    }
  }, [isSuccess, profile, setUser]);

  return null; // This component doesn't render anything
}

interface ProvidersProps {
  children: ReactNode;
  tenant: TenantConfig;
  locale: 'en' | 'ar';
}

export function Providers({ children, tenant, locale }: ProvidersProps) {
  // Create QueryClient instance (only once per component lifecycle)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Don't refetch on window focus in development
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
            // Retry failed requests up to 2 times
            retry: 2,
            // Consider data stale after 30 seconds
            staleTime: 30 * 1000,
            // Keep unused data in cache for 5 minutes
            gcTime: 5 * 60 * 1000,
          },
          mutations: {
            // Retry mutations once on failure
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TenantProvider tenant={tenant} locale={locale}>
        <ApiClientProvider>
          <AuthProvider>
            {/* Auto-fetch profile when authenticated */}
            <AuthProfileFetcher />
            {children}
            {/* Global Login Modal - available throughout the app */}
            <LoginModal />
          </AuthProvider>
        </ApiClientProvider>
      </TenantProvider>
    </QueryClientProvider>
  );
}
