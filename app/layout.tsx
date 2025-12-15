/**
 * Root Layout
 *
 * This is the root layout for the entire application.
 * It handles:
 * - Tenant resolution from middleware headers
 * - CSS variable injection for theming
 * - RTL/LTR direction setting
 * - Font loading
 * - Provider wrapping
 * - PWA support (manifest, splash screens, service worker)
 */

import type { Metadata, Viewport } from 'next';
import { headers, cookies } from 'next/headers';
import { Inter, Cairo } from 'next/font/google';
import { getTenantById, getDefaultTenant } from '@/config/tenants';
import { Providers } from './providers';
import { SplashScreen } from '@/components/splash-screen';
import { ServiceWorkerRegistration } from '@/components/service-worker-registration';
import './globals.css';

// Load fonts
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
});

// Dynamic metadata based on tenant
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id') || 'store1';
  const tenant = getTenantById(tenantId) || getDefaultTenant();
  const storeId = tenant.storeId;

  // Get locale from cookies
  const cookieStore = await cookies();
  const locale = (cookieStore.get('locale')?.value as 'en' | 'ar') || tenant.defaultLocale;
  const name = locale === 'ar' ? tenant.name.ar : tenant.name.en;
  const tagline = tenant.tagline
    ? locale === 'ar' ? tenant.tagline.ar : tenant.tagline.en
    : '';

  return {
    title: {
      template: `%s | ${name}`,
      default: `${name} - ${tagline}`,
    },
    description: tagline,
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: name,
    },
    formatDetection: {
      telephone: false,
    },
    icons: {
      icon: [
        { url: `/tenants/store${storeId}/icons/icon-192x192.png`, sizes: '192x192', type: 'image/png' },
        { url: `/tenants/store${storeId}/icons/icon-512x512.png`, sizes: '512x512', type: 'image/png' },
      ],
      apple: [
        { url: `/tenants/store${storeId}/icons/icon-152x152.png`, sizes: '152x152', type: 'image/png' },
      ],
      other: [
        { rel: 'mask-icon', url: tenant.logo, color: tenant.theme.primaryColor },
      ],
    },
  };
}

// Dynamic viewport configuration
export async function generateViewport(): Promise<Viewport> {
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id') || 'store1';
  const tenant = getTenantById(tenantId) || getDefaultTenant();

  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: tenant.theme.primaryColor,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get tenant from middleware headers
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id') || 'store1';
  const tenant = getTenantById(tenantId) || getDefaultTenant();

  // Get locale from cookies (default to tenant's default)
  const cookieStore = await cookies();
  const locale = (cookieStore.get('locale')?.value as 'en' | 'ar') || tenant.defaultLocale;
  const isRTL = locale === 'ar';

  // Generate CSS variables from tenant theme
  const themeStyles = `
    :root {
      /* Primary Colors */
      --color-primary: ${tenant.theme.primaryColor};
      --color-primary-hover: ${tenant.theme.primaryHover};
      --color-primary-light: ${tenant.theme.primaryLight};

      /* Secondary Colors */
      --color-secondary: ${tenant.theme.secondaryColor};
      --color-secondary-hover: ${tenant.theme.secondaryHover};

      /* Accent Colors */
      --color-accent: ${tenant.theme.accentColor};
      --color-accent-hover: ${tenant.theme.accentHover};

      /* Background Colors */
      --color-background: ${tenant.theme.backgroundColor};
      --color-background-secondary: ${tenant.theme.backgroundSecondary};
      --color-card: ${tenant.theme.cardBackground};

      /* Text Colors */
      --color-text-primary: ${tenant.theme.textPrimary};
      --color-text-secondary: ${tenant.theme.textSecondary};
      --color-text-muted: ${tenant.theme.textMuted};
      --color-text-on-primary: ${tenant.theme.textOnPrimary};

      /* Border Colors */
      --color-border: ${tenant.theme.borderColor};
      --color-border-light: ${tenant.theme.borderColorLight};

      /* Status Colors */
      --color-success: ${tenant.theme.successColor};
      --color-warning: ${tenant.theme.warningColor};
      --color-error: ${tenant.theme.errorColor};
      --color-info: ${tenant.theme.infoColor};

      /* Fonts */
      --font-primary: ${isRTL ? tenant.fonts.fontArabic : tenant.fonts.fontPrimary};
      --font-arabic: ${tenant.fonts.fontArabic};
    }
  `;

  const storeId = tenant.storeId;

  return (
    <html
      lang={locale}
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`${inter.variable} ${cairo.variable}`}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />

        {/* Apple Splash Screens */}
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href={`/tenants/store${storeId}/splash/splash-1242x2688.png`}
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href={`/tenants/store${storeId}/splash/splash-1125x2436.png`}
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href={`/tenants/store${storeId}/splash/splash-1242x2688.png`}
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href={`/tenants/store${storeId}/splash/splash-750x1334.png`}
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href={`/tenants/store${storeId}/splash/splash-828x1792.png`}
        />
      </head>
      <body className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] antialiased">
        <SplashScreen />
        <ServiceWorkerRegistration />
        <Providers tenant={tenant} locale={locale}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
