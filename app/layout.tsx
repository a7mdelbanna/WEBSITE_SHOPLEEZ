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
 */

import type { Metadata, Viewport } from 'next';
import { headers, cookies } from 'next/headers';
import { Inter, Cairo } from 'next/font/google';
import { getTenantById, getDefaultTenant } from '@/config/tenants';
import { Providers } from './providers';
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
    icons: {
      icon: tenant.favicon,
    },
  };
}

// Viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FF6B6B', // Will be dynamic per tenant in the future
};

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

  return (
    <html
      lang={locale}
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`${inter.variable} ${cairo.variable}`}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      </head>
      <body className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] antialiased">
        <Providers tenant={tenant} locale={locale}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
