/**
 * Theme Configuration
 *
 * Centralized theme colors and design tokens.
 * This file can be extended later to support:
 * - Per-store custom themes
 * - Custom splash screens
 * - Dynamic color palettes from API
 */

export const theme = {
  colors: {
    // Brand colors
    primary: 'var(--color-primary)',
    primaryHover: 'var(--color-primary-hover)',
    primaryLight: 'var(--color-primary-light)',

    // Background colors
    background: 'var(--color-bg-page)',
    backgroundCard: 'var(--color-bg-card)',
    backgroundInput: 'var(--color-bg-input)',

    // Text colors
    textPrimary: 'var(--color-text-primary)',
    textSecondary: 'var(--color-text-secondary)',
    textMuted: 'var(--color-text-muted)',
    textOnPrimary: 'var(--color-text-on-primary)',

    // Border colors
    border: 'var(--color-border)',
    borderLight: 'var(--color-border-light)',

    // Status colors
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    error: 'var(--color-error)',
    info: 'var(--color-info)',
  },

  // Spacing tokens
  spacing: {
    xs: 'var(--space-1)',
    sm: 'var(--space-2)',
    md: 'var(--space-3)',
    lg: 'var(--space-4)',
    xl: 'var(--space-5)',
    '2xl': 'var(--space-6)',
  },

  // Border radius tokens
  radius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    full: '9999px',
  },

  // Typography
  fonts: {
    primary: 'var(--font-primary)',
    arabic: 'var(--font-arabic)',
  },
} as const;

// Type-safe color accessor
export type ThemeColors = keyof typeof theme.colors;

// Export individual color values for easy access
export const colors = theme.colors;
