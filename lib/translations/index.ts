/**
 * Translation System
 *
 * Type-safe translation loader for Arabic/English localization.
 * Uses JSON files for translation keys.
 */

import arTranslations from './ar.json';
import enTranslations from './en.json';

// Type inference from the English translation file (source of truth)
export type Translations = typeof enTranslations;

// Translation keys type - flattened for easy access
export type TranslationKey = keyof Translations;

// Available locales
export type Locale = 'en' | 'ar';

// Translation map
const translations: Record<Locale, Translations> = {
  en: enTranslations,
  ar: arTranslations,
};

/**
 * Get translations for a specific locale
 */
export function getTranslations(locale: Locale): Translations {
  return translations[locale] || translations.en;
}

/**
 * Get a nested translation value by dot notation path
 * Example: getNestedValue(translations, 'common.login') => 'Login'
 */
export function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let result: unknown = obj;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      // Return the path as fallback if key not found
      console.warn(`Translation key not found: ${path}`);
      return path;
    }
  }

  if (typeof result === 'string') {
    return result;
  }

  // Return path if result is not a string
  console.warn(`Translation value is not a string: ${path}`);
  return path;
}

/**
 * Create a translation function for a specific locale
 */
export function createTranslator(locale: Locale) {
  const t = getTranslations(locale);

  return function translate(key: string): string {
    return getNestedValue(t as unknown as Record<string, unknown>, key);
  };
}

// Re-export for convenience
export { arTranslations, enTranslations };
