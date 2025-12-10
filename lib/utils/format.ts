/**
 * Formatting utilities for prices, dates, etc.
 */

import type { TenantCurrency } from '@/types/tenant';

/**
 * Format a price with currency symbol
 */
export function formatPrice(
  amount: number,
  currency: TenantCurrency,
  locale: 'en' | 'ar' = 'en'
): string {
  // Use configured decimal places (default to 0 for whole number prices)
  const decimalPlaces = currency.decimalPlaces ?? 0;

  // Round to integer for 0 decimal places, otherwise use proper rounding
  let formattedAmount: string;
  if (decimalPlaces === 0) {
    // For whole numbers, use Math.round to ensure clean integer
    formattedAmount = String(Math.round(amount));
  } else {
    // For decimal places, use proper rounding and toFixed
    const roundedAmount = Math.round(amount * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
    formattedAmount = roundedAmount.toFixed(decimalPlaces);
  }

  const symbol = locale === 'ar' ? currency.symbol : currency.symbolEn;

  if (currency.position === 'before') {
    return `${symbol} ${formattedAmount}`;
  }

  return `${formattedAmount} ${symbol}`;
}

/**
 * Format a number with locale-specific separators
 */
export function formatNumber(
  num: number,
  locale: 'en' | 'ar' = 'en'
): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US').format(num);
}

/**
 * Format a date
 */
export function formatDate(
  date: string | Date,
  locale: 'en' | 'ar' = 'en',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(
    locale === 'ar' ? 'ar-EG' : 'en-US',
    options
  ).format(d);
}

/**
 * Format a date with time
 */
export function formatDateTime(
  date: string | Date,
  locale: 'en' | 'ar' = 'en'
): string {
  return formatDate(date, locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: string | Date,
  locale: 'en' | 'ar' = 'en'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    numeric: 'auto',
  });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return rtf.format(-diffInMinutes, 'minute');
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return rtf.format(-diffInHours, 'hour');
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return rtf.format(-diffInDays, 'day');
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return rtf.format(-diffInWeeks, 'week');
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return rtf.format(-diffInMonths, 'month');
}

/**
 * Format phone number for display
 */
export function formatPhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Egyptian format: +20 XXX XXX XXXX
  if (digits.startsWith('20') && digits.length === 12) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }

  // If starts with 0, assume local Egyptian
  if (digits.startsWith('0') && digits.length === 11) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }

  return phone;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Get text based on locale
 */
export function getLocalizedText(
  textEn: string,
  textAr: string,
  locale: 'en' | 'ar'
): string {
  return locale === 'ar' ? textAr : textEn;
}
