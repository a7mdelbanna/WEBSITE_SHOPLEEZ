import { MetadataRoute } from 'next';

// Import tenant configs
const storeId = process.env.NEXT_PUBLIC_STORE_ID || '1';

// Map of tenant configurations
const tenantConfigs: Record<string, {
  name: { en: string; ar: string };
  theme: { primaryColor: string; backgroundColor: string };
  locale: string;
}> = {
  '1': {
    name: { en: 'El-Etihad', ar: 'الاتحاد' },
    theme: { primaryColor: '#f4b324', backgroundColor: '#FFFFFF' },
    locale: 'ar',
  },
  '20': {
    name: { en: 'Galala Plus', ar: 'جلالة بلس' },
    theme: { primaryColor: '#4CAF50', backgroundColor: '#FFFFFF' },
    locale: 'ar',
  },
  '22': {
    name: { en: 'Shakaleta', ar: 'شكاليطه' },
    theme: { primaryColor: '#2196F3', backgroundColor: '#FFFFFF' },
    locale: 'ar',
  },
  '23': {
    name: { en: 'Haveniya', ar: 'هافنيا' },
    theme: { primaryColor: '#9C27B0', backgroundColor: '#FFFFFF' },
    locale: 'ar',
  },
};

export default function manifest(): MetadataRoute.Manifest {
  const tenant = tenantConfigs[storeId];

  if (!tenant) {
    console.warn(`Tenant configuration not found for store ${storeId}, using defaults`);
  }

  const config = tenant || tenantConfigs['1'];
  const storeName = config.name.ar; // Use Arabic name as primary
  const storeNameEn = config.name.en;

  return {
    name: storeName,
    short_name: storeNameEn,
    description: `${storeNameEn} - Online Shopping & Delivery`,
    start_url: '/',
    display: 'standalone',
    background_color: config.theme.backgroundColor,
    theme_color: config.theme.primaryColor,
    orientation: 'portrait',
    lang: config.locale,
    dir: config.locale === 'ar' ? 'rtl' : 'ltr',
    icons: [
      {
        src: `/tenants/store${storeId}/icons/icon-72x72.png`,
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `/tenants/store${storeId}/icons/icon-96x96.png`,
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `/tenants/store${storeId}/icons/icon-128x128.png`,
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `/tenants/store${storeId}/icons/icon-144x144.png`,
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `/tenants/store${storeId}/icons/icon-152x152.png`,
        sizes: '152x152',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `/tenants/store${storeId}/icons/icon-192x192.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `/tenants/store${storeId}/icons/icon-384x384.png`,
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `/tenants/store${storeId}/icons/icon-512x512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `/tenants/store${storeId}/icons/maskable-icon-512x512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: `/tenants/store${storeId}/splash/splash-1242x2688.png`,
        sizes: '1242x2688',
        type: 'image/png',
        form_factor: 'narrow',
      },
      {
        src: `/tenants/store${storeId}/splash/splash-828x1792.png`,
        sizes: '828x1792',
        type: 'image/png',
        form_factor: 'narrow',
      },
    ],
  };
}
