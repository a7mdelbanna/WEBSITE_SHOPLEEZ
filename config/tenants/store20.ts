/**
 * Store 20 Configuration - Alam El-Gomla (عالم الجملة)
 */

import type { TenantConfig } from '@/types/tenant';

export const store20Config: TenantConfig = {
  // Identity
  id: 'store20',
  storeId: 20,

  // Branding
  name: {
    en: 'Alam El-Gomla',
    ar: 'عالم الجملة',
  },
  tagline: {
    en: 'Wholesale World at Your Fingertips',
    ar: 'عالم الجملة بين يديك',
  },
  logo: '/tenants/store20/logo.svg',
  logoLight: '/tenants/store20/logo-light.svg',
  favicon: '/tenants/store20/favicon.ico',

  // Theme - Blue theme for differentiation
  theme: {
    // Primary colors (Blue)
    primaryColor: '#2563EB',
    primaryHover: '#1D4ED8',
    primaryLight: '#DBEAFE',

    // Secondary colors (Indigo)
    secondaryColor: '#6366F1',
    secondaryHover: '#4F46E5',

    // Accent colors (Amber)
    accentColor: '#F59E0B',
    accentHover: '#D97706',

    // Background colors
    backgroundColor: '#F8FAFC',
    backgroundSecondary: '#FFFFFF',
    cardBackground: '#FFFFFF',

    // Text colors
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    textOnPrimary: '#FFFFFF',

    // Border colors
    borderColor: '#E2E8F0',
    borderColorLight: '#F1F5F9',

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
    'alamelgomla.shopleez.com',
    'store20.shopleez.com',
    'localhost:3002',
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
    phone: '+20123456780',
    whatsapp: '+20123456780',
    email: 'support@alamelgomla.com',
  },

  // Social
  social: {
    facebook: 'https://facebook.com/alamelgomla',
    instagram: 'https://instagram.com/alamelgomla',
  },
};
