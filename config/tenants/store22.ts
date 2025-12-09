/**
 * Store 22 Configuration - Shakaleta (شكاليطة)
 */

import type { TenantConfig } from '@/types/tenant';

export const store22Config: TenantConfig = {
  // Identity
  id: 'store22',
  storeId: 22,

  // Branding
  name: {
    en: 'Shakaleta',
    ar: 'شكاليطة',
  },
  tagline: {
    en: 'Sweet Deals, Sweet Life',
    ar: 'حلاوة الحياة',
  },
  logo: '/tenants/store22/logo.svg',
  logoLight: '/tenants/store22/logo-light.svg',
  favicon: '/tenants/store22/favicon.ico',

  // Theme - Purple/Pink theme for sweets store
  theme: {
    // Primary colors (Purple)
    primaryColor: '#9333EA',
    primaryHover: '#7C3AED',
    primaryLight: '#F3E8FF',

    // Secondary colors (Pink)
    secondaryColor: '#EC4899',
    secondaryHover: '#DB2777',

    // Accent colors (Yellow)
    accentColor: '#FBBF24',
    accentHover: '#F59E0B',

    // Background colors
    backgroundColor: '#FAF5FF',
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
    successColor: '#10B981',
    warningColor: '#F59E0B',
    errorColor: '#EF4444',
    infoColor: '#6366F1',
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
    'shakaleta.shopleez.com',
    'store22.shopleez.com',
    'localhost:3003',
  ],

  // Feature Flags
  features: {
    enableChat: true,
    enableChatbot: false,
    enableLoyaltyPoints: true,
    enableReferrals: true,
    enableDeliveryTips: true,
    enableOTPAuth: true,
    enablePasswordAuth: false,
    showCompanyFilter: true,
    showSubcategoryFilter: true,
    enableWallet: false,
    enableNotifications: true,
    enableBarcodeScan: true,
    appMode: 'Retail',
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
    phone: '+20123456782',
    whatsapp: '+20123456782',
    email: 'support@shakaleta.com',
  },

  // Social
  social: {
    facebook: 'https://facebook.com/shakaleta',
    instagram: 'https://instagram.com/shakaleta',
  },
};
