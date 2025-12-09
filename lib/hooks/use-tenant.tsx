'use client';

/**
 * Tenant Context and Hook
 *
 * Provides tenant configuration to all components in the app.
 * The tenant is resolved by the middleware and passed to the provider.
 */

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import type { TenantConfig } from '@/types/tenant';

// Context type
interface TenantContextValue {
  tenant: TenantConfig;
  locale: 'en' | 'ar';
  isRTL: boolean;
  setLocale: (locale: 'en' | 'ar') => void;
}

// Create context with undefined default
const TenantContext = createContext<TenantContextValue | undefined>(undefined);

// Provider props
interface TenantProviderProps {
  tenant: TenantConfig;
  locale?: 'en' | 'ar';
  children: ReactNode;
}

/**
 * TenantProvider - Wraps the app and provides tenant configuration
 */
export function TenantProvider({
  tenant,
  locale: initialLocale,
  children,
}: TenantProviderProps) {
  // Use tenant's default locale if not specified
  const locale = initialLocale || tenant.defaultLocale;
  const isRTL = locale === 'ar';

  // Locale setter (in a real app, this would persist to localStorage/cookies)
  const setLocale = (newLocale: 'en' | 'ar') => {
    // This would typically update a cookie and refresh
    // For now, we'll handle this with a page reload
    if (typeof window !== 'undefined') {
      document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
      window.location.reload();
    }
  };

  const value = useMemo(
    () => ({
      tenant,
      locale,
      isRTL,
      setLocale,
    }),
    [tenant, locale, isRTL]
  );

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

/**
 * useTenant - Hook to access tenant configuration
 */
export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);

  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }

  return context;
}

/**
 * useTheme - Hook to access tenant theme colors
 */
export function useTheme() {
  const { tenant } = useTenant();
  return tenant.theme;
}

/**
 * useFeatures - Hook to access tenant feature flags
 */
export function useFeatures() {
  const { tenant } = useTenant();
  return tenant.features;
}

/**
 * useCurrency - Hook to access tenant currency settings
 */
export function useCurrency() {
  const { tenant, locale } = useTenant();
  return { ...tenant.currency, locale };
}

/**
 * useLocalization - Hook for localized text helper
 */
export function useLocalization() {
  const { locale, isRTL } = useTenant();

  const t = (textEn: string, textAr: string): string => {
    return locale === 'ar' ? textAr : textEn;
  };

  return { locale, isRTL, t };
}
