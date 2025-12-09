'use client';

/**
 * useTranslations Hook
 *
 * Provides type-safe translations based on the current locale.
 * Uses the tenant context to determine the active locale.
 */

import { useMemo, useCallback } from 'react';
import { useTenant } from './use-tenant';
import {
  getTranslations,
  getNestedValue,
  type Translations,
  type Locale,
} from '@/lib/translations';

export interface UseTranslationsReturn {
  /** The current locale */
  locale: Locale;
  /** Whether the current locale is RTL */
  isRTL: boolean;
  /** The translations object for direct access */
  translations: Translations;
  /** Translation function - use with dot notation: t('common.login') */
  t: (key: string) => string;
  /**
   * Get localized text - supports two patterns:
   * 1. Object with en/ar properties: localize({ en: 'Hello', ar: 'مرحبا' })
   * 2. Two separate strings: localize('Hello', 'مرحبا')
   */
  localize: {
    <T extends { en?: string; ar?: string }>(obj: T | null | undefined): string;
    (en: string | undefined, ar: string | undefined): string;
  };
  /** Format a number according to locale */
  formatNumber: (num: number) => string;
}

/**
 * Hook to access translations and localization utilities
 */
export function useTranslations(): UseTranslationsReturn {
  const { locale, isRTL } = useTenant();

  // Get translations object for current locale
  const translations = useMemo(() => {
    return getTranslations(locale);
  }, [locale]);

  // Translation function with dot notation support
  const t = useCallback(
    (key: string): string => {
      return getNestedValue(
        translations as unknown as Record<string, unknown>,
        key
      );
    },
    [translations]
  );

  // Localize function - supports both object and two-string patterns
  const localize = useCallback(
    (
      enOrObj: string | { en?: string; ar?: string } | null | undefined,
      ar?: string
    ): string => {
      // Pattern 2: Two separate strings - localize('Hello', 'مرحبا')
      if (typeof enOrObj === 'string' || ar !== undefined) {
        const en = typeof enOrObj === 'string' ? enOrObj : '';
        return locale === 'ar' ? (ar || en || '') : (en || ar || '');
      }

      // Pattern 1: Object with en/ar properties - localize({ en: 'Hello', ar: 'مرحبا' })
      if (!enOrObj) return '';
      return locale === 'ar' ? (enOrObj.ar || enOrObj.en || '') : (enOrObj.en || enOrObj.ar || '');
    },
    [locale]
  ) as UseTranslationsReturn['localize'];

  // Number formatter
  const formatNumber = useCallback(
    (num: number): string => {
      return num.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-EG');
    },
    [locale]
  );

  return {
    locale,
    isRTL,
    translations,
    t,
    localize,
    formatNumber,
  };
}

/**
 * Higher-order hook for scoped translations
 * Example: const t = useScopedTranslations('common') => t('login') instead of t('common.login')
 */
export function useScopedTranslations(scope: keyof Translations) {
  const { locale, isRTL, translations, localize, formatNumber } = useTranslations();

  const scopedT = useCallback(
    (key: string): string => {
      const scopedTranslations = translations[scope];
      if (
        scopedTranslations &&
        typeof scopedTranslations === 'object' &&
        key in scopedTranslations
      ) {
        return (scopedTranslations as Record<string, string>)[key] || key;
      }
      return key;
    },
    [translations, scope]
  );

  return {
    locale,
    isRTL,
    t: scopedT,
    localize,
    formatNumber,
  };
}
