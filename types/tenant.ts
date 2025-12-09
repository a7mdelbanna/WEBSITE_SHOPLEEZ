/**
 * Tenant Configuration Types
 *
 * These types define the configuration structure for each store/tenant.
 * Colors and settings can come from backend in the future.
 */

export interface TenantTheme {
  // Primary brand colors
  primaryColor: string;
  primaryHover: string;
  primaryLight: string;

  // Secondary colors
  secondaryColor: string;
  secondaryHover: string;

  // Accent colors
  accentColor: string;
  accentHover: string;

  // Background colors
  backgroundColor: string;
  backgroundSecondary: string;
  cardBackground: string;

  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnPrimary: string;

  // Border colors
  borderColor: string;
  borderColorLight: string;

  // Status colors
  successColor: string;
  warningColor: string;
  errorColor: string;
  infoColor: string;
}

export interface TenantFonts {
  // Font families
  fontPrimary: string;       // Main font (Latin)
  fontArabic: string;        // Arabic font

  // Font sizes (can be customized per tenant)
  fontSizeBase: string;
  fontSizeSmall: string;
  fontSizeLarge: string;
}

export interface TenantCurrency {
  code: string;              // "EGP", "SAR", etc.
  symbol: string;            // "ج.م", "ر.س", etc.
  symbolEn: string;          // "EGP", "SAR" for English
  position: 'before' | 'after';
  decimalPlaces: number;
}

export interface TenantFeatures {
  enableChat: boolean;
  enableChatbot: boolean;
  enableLoyaltyPoints: boolean;
  enableReferrals: boolean;
  enableDeliveryTips: boolean;
  enableOTPAuth: boolean;
  enablePasswordAuth: boolean;
  showCompanyFilter: boolean;
  showSubcategoryFilter: boolean;
  enableWallet: boolean;
  enableNotifications: boolean;
  enableBarcodeScan: boolean;
  appMode: 'WholeSale' | 'Retail' | 'Both';
}

export interface TenantContact {
  phone?: string;
  whatsapp?: string;
  email?: string;
}

export interface TenantSocial {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
}

export interface TenantConfig {
  // Identity
  id: string;                    // "store1", "store20", etc.
  storeId: number;               // 1, 20, 22, 23 (for API calls)

  // Branding
  name: {
    en: string;
    ar: string;
  };
  tagline?: {
    en: string;
    ar: string;
  };
  logo: string;                  // Path to logo asset
  logoLight?: string;            // Light version for dark backgrounds
  favicon: string;

  // Theme (can be overridden from backend)
  theme: TenantTheme;
  fonts: TenantFonts;

  // API Configuration
  apiBaseUrl: string;

  // Domains (for resolution)
  domains: string[];

  // Feature Flags
  features: TenantFeatures;

  // Locale Settings
  defaultLocale: 'en' | 'ar';
  supportedLocales: ('en' | 'ar')[];
  currency: TenantCurrency;

  // Location Settings
  defaultCity?: string;
  defaultCityAr?: string;

  // Contact & Social
  contact?: TenantContact;
  social?: TenantSocial;
}

// Type for theme that can be loaded from backend
export interface BackendThemeResponse {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  // Add more fields as backend API is defined
}

// Merged config type (tenant defaults + backend overrides)
export type ResolvedTenantConfig = TenantConfig & {
  themeOverrides?: Partial<TenantTheme>;
};
