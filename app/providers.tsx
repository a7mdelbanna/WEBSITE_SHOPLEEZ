'use client';

/**
 * Client-side Providers
 *
 * Wraps the app with all necessary client-side providers:
 * - TanStack Query for server state
 * - Zustand stores are auto-initialized
 */

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TenantProvider } from '@/lib/hooks/use-tenant';
import type { TenantConfig } from '@/types/tenant';

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
        {children}
      </TenantProvider>
    </QueryClientProvider>
  );
}
