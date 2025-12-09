'use client';

/**
 * API Client Provider
 *
 * Provides a configured Axios instance to the application.
 * Uses tenant configuration for base URL and store ID.
 */

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import type { AxiosInstance } from 'axios';
import { createApiClient, buildUrl } from './client';
import { useTenant } from '@/lib/hooks/use-tenant';
import type { Locale } from '@/lib/translations';

// Context type
interface ApiClientContextValue {
  apiClient: AxiosInstance;
  storeId: number;
  baseUrl: string;
  locale: Locale;
  /** Build URL with storeId and optional params */
  buildEndpoint: (template: string, params?: Record<string, string | number>) => string;
}

// Create context
const ApiClientContext = createContext<ApiClientContextValue | undefined>(undefined);

// Provider props
interface ApiClientProviderProps {
  children: ReactNode;
}

/**
 * ApiClientProvider - Provides configured API client to the app
 */
export function ApiClientProvider({ children }: ApiClientProviderProps) {
  const { tenant, locale } = useTenant();

  // Create memoized API client
  const apiClient = useMemo(() => {
    return createApiClient(tenant.apiBaseUrl, tenant.storeId, locale);
  }, [tenant.apiBaseUrl, tenant.storeId, locale]);

  // Memoized URL builder
  const buildEndpoint = useMemo(() => {
    return (template: string, params?: Record<string, string | number>) => {
      return buildUrl(template, tenant.storeId, params);
    };
  }, [tenant.storeId]);

  const value = useMemo(
    () => ({
      apiClient,
      storeId: tenant.storeId,
      baseUrl: tenant.apiBaseUrl,
      locale,
      buildEndpoint,
    }),
    [apiClient, tenant.storeId, tenant.apiBaseUrl, locale, buildEndpoint]
  );

  return (
    <ApiClientContext.Provider value={value}>
      {children}
    </ApiClientContext.Provider>
  );
}

/**
 * Hook to access the API client
 */
export function useApiClient(): ApiClientContextValue {
  const context = useContext(ApiClientContext);

  if (context === undefined) {
    throw new Error('useApiClient must be used within an ApiClientProvider');
  }

  return context;
}

/**
 * Hook to get just the axios instance (shorthand)
 */
export function useAxios(): AxiosInstance {
  const { apiClient } = useApiClient();
  return apiClient;
}
