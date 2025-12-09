/**
 * Store 23 Configuration - Ezzat Wholesale (عزت للمستوردات)
 */

import type { TenantConfig } from '@/types/tenant';

export const store23Config: TenantConfig = {
  // Identity
  id: 'store23',
  storeId: 23,

  // Branding
  name: {
    en: 'Ezzat Wholesale',
    ar: 'عزت للمستوردات',
  },
  tagline: {
    en: 'Quality Imports, Best Prices',
    ar: 'أجود المستوردات بأفضل الأسعار',
  },
  logo: '/tenants/store23/logo.svg',
  logoLight: '/tenants/store23/logo-light.svg',
  favicon: '/tenants/store23/favicon.ico',

  // Theme - Green theme for fresh/quality focus
  theme: {
    // Primary colors (Green)
    primaryColor: '#059669',
    primaryHover: '#047857',
    primaryLight: '#D1FAE5',

    // Secondary colors (Teal)
    secondaryColor: '#0D9488',
    secondaryHover: '#0F766E',

    // Accent colors (Orange)
    accentColor: '#F97316',
    accentHover: '#EA580C',

    // Background colors
    backgroundColor: '#F0FDF4',
    backgroundSecondary: '#FFFFFF',
    cardBackground: '#FFFFFF',

    // Text colors
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    textOnPrimary: '#FFFFFF',

    // Border colors
    borderColor: '#E5E7EB',
    borderColorLight: '#F3F4F6',

    // Status colors
    successColor: '#22C55E',
    warningColor: '#EAB308',
    errorColor: '#EF4444',
    infoColor: '#0EA5E9',
  },

  // Fonts
  fonts: {
    fontPrimary: 'Inter, system-ui, sans-serif',
    fontArabic: 'Cairo, Noto Sans Arabic, sans-serif',
    fontSizeBase: '16px',
    fontSizeSmall: '14px',
    fontSizeLarge: '18px',
  },

  // API Configuration
  apiBaseUrl: 'https://modytest-002-site3.atempurl.com',

  // Domains
  domains: [
    'ezzat.shopleez.com',
    'store23.shopleez.com',
    'localhost:3004',
  ],

  // Feature Flags
  features: {
    enableChat: true,
    enableChatbot: true,
    enableLoyaltyPoints: true,
    enableReferrals: true,
    enableDeliveryTips: true,
    enableOTPAuth: true,
    enablePasswordAuth: true,
    showCompanyFilter: true,
    showSubcategoryFilter: true,
    enableWallet: true,
    enableNotifications: true,
    enableBarcodeScan: true,
    appMode: 'WholeSale',
  },

  // Locale Settings
  defaultLocale: 'ar',
  supportedLocales: ['ar', 'en'],
  currency: {
    code: 'EGP',
    symbol: 'ج.م',
    symbolEn: 'EGP',
    position: 'after',
    decimalPlaces: 2,
  },

  // Contact
  contact: {
    phone: '+20123456783',
    whatsapp: '+20123456783',
    email: 'support@ezzat.com',
  },

  // Social
  social: {
    facebook: 'https://facebook.com/ezzatwholesale',
    instagram: 'https://instagram.com/ezzatwholesale',
  },
};
