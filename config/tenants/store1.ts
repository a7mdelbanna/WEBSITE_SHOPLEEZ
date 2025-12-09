/**
 * Store 1 Configuration - El-Etihad (الاتحاد)
 *
 * This is the default/primary store configuration.
 * Colors and fonts can be overridden from backend in the future.
 */

import type { TenantConfig } from '@/types/tenant';

export const store1Config: TenantConfig = {
  // Identity
  id: 'store1',
  storeId: 1,

  // Branding
  name: {
    en: 'El-Etihad',
    ar: 'الاتحاد',
  },
  tagline: {
    en: 'Your Trusted Wholesale Partner',
    ar: 'شريكك الموثوق في الجملة',
  },
  logo: '/tenants/store1/logo.svg',
  logoLight: '/tenants/store1/logo-light.svg',
  favicon: '/tenants/store1/favicon.ico',

  // Theme - Primary coral/salmon like Samokat
  theme: {
    // Primary colors (Coral/Salmon)
    primaryColor: '#FF6B6B',
    primaryHover: '#FF5252',
    primaryLight: '#FFE5E5',

    // Secondary colors (Teal)
    secondaryColor: '#4ECDC4',
    secondaryHover: '#3DBDB5',

    // Accent colors (Orange)
    accentColor: '#FF9F43',
    accentHover: '#FF8C29',

    // Background colors
    backgroundColor: '#F8F9FA',
    backgroundSecondary: '#FFFFFF',
    cardBackground: '#FFFFFF',

    // Text colors
    textPrimary: '#212529',
    textSecondary: '#6C757D',
    textMuted: '#ADB5BD',
    textOnPrimary: '#FFFFFF',

    // Border colors
    borderColor: '#DEE2E6',
    borderColorLight: '#E9ECEF',

    // Status colors
    successColor: '#28A745',
    warningColor: '#FFC107',
    errorColor: '#DC3545',
    infoColor: '#17A2B8',
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
    'ettihad.shopleez.com',
    'store1.shopleez.com',
    'localhost:3000',
    'localhost:3001',
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
    appMode: 'Both',
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

  // Location Settings
  defaultCity: 'Cairo',
  defaultCityAr: 'القاهرة',

  // Contact
  contact: {
    phone: '+20123456789',
    whatsapp: '+20123456789',
    email: 'support@ettihad.com',
  },

  // Social
  social: {
    facebook: 'https://facebook.com/ettihad',
    instagram: 'https://instagram.com/ettihad',
  },
};
