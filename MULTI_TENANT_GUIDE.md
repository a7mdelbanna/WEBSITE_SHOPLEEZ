# Multi-Tenant E-Commerce Platform - Complete Guide

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [How It Works](#how-it-works)
3. [Adding Assets for a Store](#adding-assets-for-a-store)
4. [Adding a New Store](#adding-a-new-store)
5. [Build & Deployment](#build--deployment)
6. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Multi-Tenant Pattern
This application uses a **multi-tenant architecture** inspired by Flutter flavors, where:
- **One codebase** serves **multiple branded stores**
- Each store has its own: branding, colors, logos, PWA assets
- **Build-time selection** optimizes for production deployments
- **Runtime selection** (middleware) enables local development

### Key Components

```
┌─────────────────────────────────────────────────────────────┐
│                   Multi-Tenant Architecture                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────┐
        │     Development (Current Approach)       │
        │  Domain → Middleware → Tenant Config    │
        │  localhost:3000 → Detects store from    │
        │  headers/cookies → Loads config         │
        └─────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────┐
        │    Production (Branch-Based Approach)    │
        │  Build Time → Select Store → Bundle     │
        │  NEXT_PUBLIC_STORE_ID=22 → Builds only  │
        │  Shakaleta config → Deploys to domain   │
        └─────────────────────────────────────────┘
```

### File Structure

```
web/
├── app/
│   ├── layout.tsx              # Root layout with PWA support
│   ├── manifest.ts             # Dynamic PWA manifest
│   └── offline/page.tsx        # Offline fallback page
├── components/
│   ├── splash-screen.tsx       # Initial loading screen
│   ├── preloader.tsx           # Reusable loading indicators
│   └── service-worker-registration.tsx
├── config/
│   └── tenants/
│       ├── index.ts            # Tenant config loader
│       ├── store1.ts           # El-Etihad config
│       ├── store20.ts          # Galala Plus config
│       ├── store22.ts          # Shakaleta config
│       └── store23.ts          # Haveniya config
├── middleware.ts               # Domain-based routing
├── public/
│   ├── sw.js                   # Service worker
│   └── tenants/
│       ├── store1/             # El-Etihad assets
│       │   ├── icons/          # PWA icons (9 sizes)
│       │   ├── splash/         # Splash screens (6 sizes)
│       │   ├── preloader.png   # Loading spinner
│       │   ├── logo.svg        # Main logo
│       │   ├── logo-light.svg  # Light mode logo
│       │   └── favicon.ico     # Favicon
│       ├── store20/            # Galala Plus assets
│       ├── store22/            # Shakaleta assets
│       └── store23/            # Haveniya assets
├── scripts/
│   └── build-store.sh          # Build script for stores
├── next.config.ts              # Next.js config with PWA
└── package.json                # Build scripts
```

---

## How It Works

### 1. Tenant Configuration (`/config/tenants/`)

Each store has a TypeScript configuration file:

```typescript
// config/tenants/store22.ts
import type { TenantConfig } from '@/types/tenant';

export const store22Config: TenantConfig = {
  id: 'store22',
  storeId: 22,
  name: { en: 'Shakaleta', ar: 'شكاليطه' },
  tagline: { en: 'Sweet Delights', ar: 'حلويات لذيذة' },
  defaultLocale: 'ar',

  // Visual Identity
  logo: '/tenants/store22/logo.svg',
  logoLight: '/tenants/store22/logo-light.svg',
  favicon: '/tenants/store22/favicon.ico',

  // Theme Colors (injected as CSS variables)
  theme: {
    primaryColor: '#2196F3',
    primaryHover: '#1976D2',
    primaryLight: '#64B5F6',
    secondaryColor: '#FF9800',
    // ... more colors
  },

  // API Configuration
  apiBaseUrl: 'https://modytest-002-site3.atempurl.com',

  // Feature Flags
  features: {
    enableChat: true,
    enableChatbot: true,
    enableLoyalty: true,
    // ... more features
  },

  // Business Settings
  currency: { code: 'EGP', symbol: 'ج.م', position: 'after' },
  contact: { phone: '+20123456789', email: 'info@shakaleta.com' },
  social: { /* social media links */ },
  fonts: { fontPrimary: 'Inter', fontArabic: 'Cairo' },
};
```

### 2. Middleware Resolution (`/middleware.ts`)

For development (domain-based routing):

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const tenant = getTenantByDomain(hostname);

  const response = NextResponse.next();
  response.headers.set('x-tenant-id', tenant.id);
  response.headers.set('x-store-id', tenant.storeId.toString());

  return response;
}
```

### 3. Layout Integration (`/app/layout.tsx`)

```typescript
// app/layout.tsx
export default async function RootLayout({ children }) {
  // Get tenant from middleware headers
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id') || 'store1';
  const tenant = getTenantById(tenantId);

  // Inject CSS variables from tenant.theme
  const themeStyles = `
    :root {
      --color-primary: ${tenant.theme.primaryColor};
      --color-secondary: ${tenant.theme.secondaryColor};
      // ... all theme colors
    }
  `;

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
        {/* PWA meta tags, splash screens */}
      </head>
      <body>
        <SplashScreen />
        <ServiceWorkerRegistration />
        <Providers tenant={tenant}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### 4. PWA Manifest (`/app/manifest.ts`)

```typescript
// app/manifest.ts
export default function manifest(): MetadataRoute.Manifest {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID || '1';
  const config = tenantConfigs[storeId];

  return {
    name: config.name.ar,
    short_name: config.name.en,
    theme_color: config.theme.primaryColor,
    icons: [
      { src: `/tenants/store${storeId}/icons/icon-192x192.png`, ... },
      // ... all icon sizes
    ],
  };
}
```

### 5. Build System

```bash
# Development (all stores available)
npm run dev

# Production (single store per build)
NEXT_PUBLIC_STORE_ID=22 npm run build  # Builds only Shakaleta
npm run build:store22                   # Same as above (shortcut)
```

---

## Adding Assets for a Store

### Step-by-Step Guide

Let's add assets for **Store 22 (Shakaleta)** as an example.

#### Prerequisites
- Design files (logo, colors, branding)
- Image editor (Figma, Photoshop, or online tools)
- Terminal access

---

### Step 1: Create Asset Directories

```bash
cd /Users/ahmed/Documents/Website_Shopleez/web/public/tenants

# Create directory structure for Store 22
mkdir -p store22/icons
mkdir -p store22/splash

# Verify structure
ls -R store22/
# Should show: icons/ and splash/ directories
```

---

### Step 2: Create PWA Icons (9 sizes)

#### Option A: Using Figma (Recommended)

1. **Open Figma** and create a 512x512px frame
2. **Design your icon:**
   - Use store's primary color (#2196F3 for Shakaleta)
   - Add store logo/symbol in center
   - Keep design simple (looks good when small)
   - Leave 10% padding around edges

3. **Export all sizes:**
   - Select frame → Export
   - Add these export sizes:
     - 72x72, 96x96, 128x128, 144x144, 152x152
     - 192x192, 384x384, 512x512
   - Format: PNG
   - Background: Opaque (use brand color)

4. **Create maskable icon:**
   - Duplicate 512x512 icon
   - Add **20% extra padding** (iOS safe area)
   - Export as `maskable-icon-512x512.png`

#### Option B: Using Online Tools

Use [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator):

1. Upload your logo (SVG or high-res PNG)
2. Set background color: `#2196F3`
3. Select platform: **Android & iOS**
4. Download generated assets
5. Rename files to match our naming:
   ```
   icon-72x72.png
   icon-96x96.png
   icon-128x128.png
   icon-144x144.png
   icon-152x152.png
   icon-192x192.png
   icon-384x384.png
   icon-512x512.png
   maskable-icon-512x512.png
   ```

#### Option C: Using ImageMagick (Command Line)

```bash
# Install ImageMagick (macOS)
brew install imagemagick

# Create all icon sizes from source logo
cd /Users/ahmed/Documents/Website_Shopleez/web/public/tenants/store22/icons

# Assuming you have a source logo at 1024x1024
SOURCE_LOGO="/path/to/shakaleta-logo-1024.png"

# Generate all sizes
convert $SOURCE_LOGO -resize 72x72 icon-72x72.png
convert $SOURCE_LOGO -resize 96x96 icon-96x96.png
convert $SOURCE_LOGO -resize 128x128 icon-128x128.png
convert $SOURCE_LOGO -resize 144x144 icon-144x144.png
convert $SOURCE_LOGO -resize 152x152 icon-152x152.png
convert $SOURCE_LOGO -resize 192x192 icon-192x192.png
convert $SOURCE_LOGO -resize 384x384 icon-384x384.png
convert $SOURCE_LOGO -resize 512x512 icon-512x512.png
convert $SOURCE_LOGO -resize 512x512 maskable-icon-512x512.png

# Verify all icons created
ls -lh
```

---

### Step 3: Create Splash Screens (6 sizes)

Splash screens are full-screen images shown when app launches on iOS.

#### Splash Screen Sizes (iPhone)

| Device | Size | File Name |
|--------|------|-----------|
| iPhone 8, 7, 6s | 750x1334 | splash-750x1334.png |
| iPhone 8 Plus, 7 Plus | 1242x2208 | splash-1242x2208.png |
| iPhone 11, XR | 828x1792 | splash-828x1792.png |
| iPhone 11 Pro, X, XS | 1125x2436 | splash-1125x2436.png |
| iPhone 11 Pro Max, XS Max | 1242x2688 | splash-1242x2688.png |
| iPhone SE (legacy) | 640x1136 | splash-640x1136.png |

#### Design Guidelines:

1. **Background:** Store's primary color (#2196F3)
2. **Logo:** Centered, white or contrasting color
3. **Store Name:** Below logo in Arabic (شكاليطه)
4. **Safe Area:** Keep content in center 60% of screen

#### Using Figma:

1. Create frame with each size (e.g., 1242x2688)
2. Fill background with primary color
3. Add centered logo (approx 200-300px)
4. Add store name in Cairo font (48pt, white)
5. Export as PNG

#### Quick Script (from template):

```bash
cd /Users/ahmed/Documents/Website_Shopleez/web/public/tenants/store22/splash

# If you have a 1242x2688 template splash screen
TEMPLATE="/path/to/splash-template-1242x2688.png"

# Resize to all needed sizes
convert $TEMPLATE -resize 750x1334 splash-750x1334.png
convert $TEMPLATE -resize 1242x2208 splash-1242x2208.png
convert $TEMPLATE -resize 828x1792 splash-828x1792.png
convert $TEMPLATE -resize 1125x2436 splash-1125x2436.png
convert $TEMPLATE -resize 1242x2688 splash-1242x2688.png
convert $TEMPLATE -resize 640x1136 splash-640x1136.png

# Verify
ls -lh
```

---

### Step 4: Create Preloader (Loading Spinner)

The preloader is a small animated icon shown during loading states.

#### Option A: Use Logo

```bash
cd /Users/ahmed/Documents/Website_Shopleez/web/public/tenants/store22

# Copy and resize logo to 200x200
cp logo.svg preloader.png
# Or use ImageMagick to convert SVG to PNG
convert -background none logo.svg -resize 200x200 preloader.png
```

#### Option B: Custom Spinner

Create a simple circular icon (200x200px) with:
- Store color
- Simple geometric shape (will be rotated via CSS)
- Transparent background

---

### Step 5: Add Other Assets

```bash
cd /Users/ahmed/Documents/Website_Shopleez/web/public/tenants/store22

# Copy logo files (if not already there)
cp /path/to/shakaleta-logo.svg logo.svg
cp /path/to/shakaleta-logo-light.svg logo-light.svg

# Create favicon (32x32 or 16x16)
convert logo.svg -resize 32x32 -background none favicon.ico
```

---

### Step 6: Verify Asset Structure

```bash
cd /Users/ahmed/Documents/Website_Shopleez/web/public/tenants/store22

# Check structure
tree
# Should show:
# store22/
# ├── icons/
# │   ├── icon-72x72.png
# │   ├── icon-96x96.png
# │   ├── icon-128x128.png
# │   ├── icon-144x144.png
# │   ├── icon-152x152.png
# │   ├── icon-192x192.png
# │   ├── icon-384x384.png
# │   ├── icon-512x512.png
# │   └── maskable-icon-512x512.png
# ├── splash/
# │   ├── splash-640x1136.png
# │   ├── splash-750x1334.png
# │   ├── splash-828x1792.png
# │   ├── splash-1125x2436.png
# │   ├── splash-1242x2208.png
# │   └── splash-1242x2688.png
# ├── favicon.ico
# ├── logo.svg
# ├── logo-light.svg
# └── preloader.png

# Check file sizes (shouldn't be too large)
du -sh *
# Icons should be: 2-10 KB each
# Splash screens: 50-200 KB each
```

---

### Step 7: Test Assets

```bash
# Build and test for Store 22
NEXT_PUBLIC_STORE_ID=22 npm run dev

# Open browser to http://localhost:3000
# Verify:
# 1. Splash screen shows on page load
# 2. Correct logo in header
# 3. Favicon shows in browser tab
# 4. Visit /manifest.json - check icons array
```

---

## Asset Creation Cheat Sheet

### Quick Commands (ImageMagick)

```bash
#!/bin/bash
# Asset Generator Script for Store 22

STORE_ID=22
STORE_NAME="Shakaleta"
PRIMARY_COLOR="#2196F3"
LOGO_SOURCE="/path/to/source-logo.svg"
OUTPUT_DIR="/Users/ahmed/Documents/Website_Shopleez/web/public/tenants/store${STORE_ID}"

# Create directories
mkdir -p "$OUTPUT_DIR/icons"
mkdir -p "$OUTPUT_DIR/splash"

# Generate PWA Icons
for size in 72 96 128 144 152 192 384 512; do
  convert "$LOGO_SOURCE" \
    -background "$PRIMARY_COLOR" \
    -alpha remove \
    -resize ${size}x${size} \
    "$OUTPUT_DIR/icons/icon-${size}x${size}.png"
done

# Maskable icon (with padding)
convert "$LOGO_SOURCE" \
  -background "$PRIMARY_COLOR" \
  -alpha remove \
  -resize 400x400 \
  -gravity center \
  -extent 512x512 \
  "$OUTPUT_DIR/icons/maskable-icon-512x512.png"

# Create splash screens
# (You'll need a splash template or create manually)

# Preloader
convert "$LOGO_SOURCE" \
  -background none \
  -resize 200x200 \
  "$OUTPUT_DIR/preloader.png"

# Favicon
convert "$LOGO_SOURCE" \
  -background none \
  -resize 32x32 \
  "$OUTPUT_DIR/favicon.ico"

echo "Assets created for $STORE_NAME (Store $STORE_ID)"
```

---

## Adding a New Store

Let's say you want to add **Store 25: "Candy World"**

### Step 1: Create Tenant Config

```bash
cd /Users/ahmed/Documents/Website_Shopleez/web/config/tenants

# Create new config file
touch store25.ts
```

```typescript
// config/tenants/store25.ts
import type { TenantConfig } from '@/types/tenant';

export const store25Config: TenantConfig = {
  id: 'store25',
  storeId: 25,
  name: { en: 'Candy World', ar: 'عالم الحلوى' },
  tagline: { en: 'Sweet Dreams', ar: 'أحلام حلوة' },
  defaultLocale: 'ar',

  logo: '/tenants/store25/logo.svg',
  logoLight: '/tenants/store25/logo-light.svg',
  favicon: '/tenants/store25/favicon.ico',

  theme: {
    primaryColor: '#E91E63',      // Pink
    primaryHover: '#C2185B',
    primaryLight: '#F06292',
    secondaryColor: '#FFC107',    // Amber
    secondaryHover: '#FFA000',
    accentColor: '#00BCD4',       // Cyan
    accentHover: '#0097A7',
    backgroundColor: '#FFFFFF',
    backgroundSecondary: '#F5F5F5',
    cardBackground: '#FFFFFF',
    textPrimary: '#212121',
    textSecondary: '#757575',
    textMuted: '#BDBDBD',
    textOnPrimary: '#FFFFFF',
    borderColor: '#E0E0E0',
    borderColorLight: '#F5F5F5',
    successColor: '#4CAF50',
    warningColor: '#FF9800',
    errorColor: '#F44336',
    infoColor: '#2196F3',
  },

  apiBaseUrl: 'https://modytest-002-site3.atempurl.com',

  features: {
    enableChat: true,
    enableChatbot: true,
    enableLoyalty: true,
    enableReferrals: true,
    enableWallet: true,
    enableCoupons: true,
  },

  currency: {
    code: 'EGP',
    symbol: 'ج.م',
    position: 'after',
    decimalPlaces: 2,
  },

  locale: 'ar',
  timezone: 'Africa/Cairo',

  contact: {
    phone: '+20123456789',
    email: 'info@candyworld.com',
    address: 'Cairo, Egypt',
  },

  social: {
    facebook: 'https://facebook.com/candyworld',
    instagram: 'https://instagram.com/candyworld',
    twitter: 'https://twitter.com/candyworld',
  },

  fonts: {
    fontPrimary: 'Inter',
    fontArabic: 'Cairo',
  },
};
```

### Step 2: Update Tenant Index

```typescript
// config/tenants/index.ts
import { store1Config } from './store1';
import { store20Config } from './store20';
import { store22Config } from './store22';
import { store23Config } from './store23';
import { store25Config } from './store25'; // ✅ Add this

export const TENANTS = {
  store1: store1Config,
  store20: store20Config,
  store22: store22Config,
  store23: store23Config,
  store25: store25Config,  // ✅ Add this
} as const;

// Update TENANT_DOMAINS if needed for development
export const TENANT_DOMAINS: Record<string, TenantConfig> = {
  'localhost': TENANTS.store1,
  'store1.local': TENANTS.store1,
  'store20.local': TENANTS.store20,
  'store22.local': TENANTS.store22,
  'store23.local': TENANTS.store23,
  'store25.local': TENANTS.store25,  // ✅ Add this
};
```

### Step 3: Add Build Script

```json
// package.json
{
  "scripts": {
    "build:store1": "NEXT_PUBLIC_STORE_ID=1 next build",
    "build:store20": "NEXT_PUBLIC_STORE_ID=20 next build",
    "build:store22": "NEXT_PUBLIC_STORE_ID=22 next build",
    "build:store23": "NEXT_PUBLIC_STORE_ID=23 next build",
    "build:store25": "NEXT_PUBLIC_STORE_ID=25 next build"
  }
}
```

### Step 4: Update Manifest & Components

```typescript
// app/manifest.ts - Add store 25 config
const tenantConfigs: Record<string, {...}> = {
  '1': { ... },
  '20': { ... },
  '22': { ... },
  '23': { ... },
  '25': {  // ✅ Add this
    name: { en: 'Candy World', ar: 'عالم الحلوى' },
    theme: { primaryColor: '#E91E63', backgroundColor: '#FFFFFF' },
    locale: 'ar',
  },
};
```

```typescript
// components/splash-screen.tsx - Add store 25 config
const storeConfigs: Record<string, {...}> = {
  '1': { ... },
  '20': { ... },
  '22': { ... },
  '23': { ... },
  '25': { name: 'عالم الحلوى', primaryColor: '#E91E63' },  // ✅ Add
};
```

### Step 5: Create Assets

Follow **[Step-by-Step Asset Guide](#adding-assets-for-a-store)** above for Store 25.

### Step 6: Test

```bash
# Test Store 25
NEXT_PUBLIC_STORE_ID=25 npm run dev

# Build Store 25
npm run build:store25
```

---

## Build & Deployment

### Local Development

```bash
# Run with default store (Store 1)
npm run dev

# Run with specific store
NEXT_PUBLIC_STORE_ID=22 npm run dev

# Access at http://localhost:3000
```

### Production Build

```bash
# Build for Store 22
npm run build:store22

# Or use bash script
./scripts/build-store.sh 22

# Start production server
npm start

# Test at http://localhost:3000
```

### Netlify Deployment (Branch-Based)

#### Setup for Store 22:

1. **Create Git Branch**
   ```bash
   git checkout -b store22
   git push origin store22
   ```

2. **Create Netlify Site**
   - Go to Netlify dashboard
   - Click "New site from Git"
   - Select repository and branch: `store22`

3. **Configure Build Settings**
   - Build command: `npm run build:store22`
   - Publish directory: `.next`
   - Environment variables:
     ```
     NEXT_PUBLIC_STORE_ID=22
     NODE_VERSION=20
     ```

4. **Set Custom Domain**
   - Add domain: `shakaleta.com`
   - Configure DNS

5. **Deploy**
   - Every push to `store22` branch triggers build
   - Merges from `main` branch update store

#### Deployment Workflow:

```bash
# Work on main branch
git checkout main
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Deploy to Store 22
git checkout store22
git merge main
git push origin store22  # Triggers Netlify build

# Repeat for other stores
```

---

## Troubleshooting

### Issue: Icons Not Showing

**Symptoms:**
- PWA icons don't appear in manifest
- Browser shows broken image icon

**Solutions:**
1. Check file paths: `/tenants/store22/icons/icon-192x192.png`
2. Verify files exist: `ls public/tenants/store22/icons/`
3. Check file permissions: `chmod 644 public/tenants/store22/icons/*`
4. Clear browser cache and hard reload (Cmd+Shift+R)
5. Check manifest.json: `http://localhost:3000/manifest.json`

### Issue: Wrong Colors Showing

**Symptoms:**
- App shows wrong brand colors
- Theme doesn't match tenant config

**Solutions:**
1. Verify `NEXT_PUBLIC_STORE_ID` is set correctly
2. Check tenant config file exports correctly
3. Verify CSS variables in browser DevTools (Elements → Computed)
4. Clear Next.js cache: `rm -rf .next && npm run dev`

### Issue: Splash Screen Not Showing

**Symptoms:**
- No splash screen on app load
- Splash screen stuck/doesn't disappear

**Solutions:**
1. Check browser console for errors
2. Verify splash screen component is imported in layout.tsx
3. Check if preloader.png exists (will fallback to logo.svg)
4. Adjust duration prop: `<SplashScreen duration={3000} />`

### Issue: Service Worker Not Registering

**Symptoms:**
- Offline mode doesn't work
- Console shows "Service worker registration failed"

**Solutions:**
1. Service workers only work in production: `npm run build && npm start`
2. Must use HTTPS (or localhost)
3. Check sw.js is in public/ directory
4. Verify sw.js has correct cache name
5. Clear service workers: DevTools → Application → Service Workers → Unregister

### Issue: Build Fails

**Symptoms:**
- `npm run build:store22` fails
- Type errors or missing imports

**Solutions:**
1. Check TypeScript errors: `npm run lint`
2. Verify tenant config exports: `config/tenants/store22.ts`
3. Check all imports in manifest.ts and components
4. Clear node_modules: `rm -rf node_modules && npm install`
5. Check Next.js config syntax: `next.config.ts`

### Issue: Different Store Showing

**Symptoms:**
- Built for Store 22 but shows Store 1
- Environment variable not working

**Solutions:**
1. Verify build command: `NEXT_PUBLIC_STORE_ID=22 next build`
2. Check next.config.ts env configuration
3. Rebuild: `rm -rf .next && npm run build:store22`
4. Check middleware isn't overriding: comment out middleware temporarily

---

## Quick Reference

### File Locations

| Asset Type | Path |
|------------|------|
| Tenant Configs | `/config/tenants/store{X}.ts` |
| PWA Icons | `/public/tenants/store{X}/icons/` |
| Splash Screens | `/public/tenants/store{X}/splash/` |
| Logos | `/public/tenants/store{X}/logo.svg` |
| Preloader | `/public/tenants/store{X}/preloader.png` |
| Service Worker | `/public/sw.js` |
| Manifest Generator | `/app/manifest.ts` |
| Root Layout | `/app/layout.tsx` |

### Commands

```bash
# Development
npm run dev                              # Default store
NEXT_PUBLIC_STORE_ID=22 npm run dev     # Specific store

# Build
npm run build:store22                    # Build Store 22
./scripts/build-store.sh 22              # Alternative

# Deploy
git checkout store22                     # Switch to store branch
git merge main                           # Merge changes
git push origin store22                  # Deploy to Netlify
```

### Asset Sizes

| Asset | Size | Format |
|-------|------|--------|
| Icons | 72x72 to 512x512 | PNG |
| Splash Screens | 640x1136 to 1242x2688 | PNG |
| Preloader | 200x200 | PNG |
| Logo | Scalable | SVG preferred |
| Favicon | 32x32 or 16x16 | ICO |

---

## Best Practices

### 1. Asset Optimization
- Compress PNGs: Use [TinyPNG](https://tinypng.com/) or ImageOptim
- Keep icons under 10 KB each
- Keep splash screens under 200 KB each
- Use SVG for logos when possible

### 2. Color Consistency
- Use exact hex codes from tenant config
- Test on light and dark backgrounds
- Verify contrast ratios (WCAG AA minimum)
- Use ColorZilla or similar to verify colors

### 3. Testing Checklist
Before deploying a store, verify:
- [ ] All icons load (check /manifest.json)
- [ ] Splash screen shows with correct branding
- [ ] Logo appears in header
- [ ] Favicon shows in browser tab
- [ ] Theme colors are correct
- [ ] RTL/LTR direction works
- [ ] Offline page displays correctly
- [ ] Service worker registers (production only)
- [ ] PWA install prompt works (mobile)

### 4. Version Control
- Keep asset files in Git (they're small)
- Use Git LFS for large files if needed
- Tag releases: `git tag store22-v1.0.0`
- Document changes in commit messages

### 5. Performance
- Use WebP for modern browsers (with PNG fallback)
- Lazy load non-critical assets
- Monitor bundle size: `npm run build` shows size
- Use Next.js Image component for optimization

---

## Support

### Documentation
- Next.js: https://nextjs.org/docs
- PWA: https://web.dev/progressive-web-apps/
- Tailwind CSS: https://tailwindcss.com/docs

### Tools
- PWA Asset Generator: https://www.pwabuilder.com/imageGenerator
- Favicon Generator: https://realfavicongenerator.net/
- Image Compression: https://tinypng.com/
- Color Contrast Checker: https://webaim.org/resources/contrastchecker/

### Need Help?
- Check troubleshooting section above
- Review plan file: `/Users/ahmed/.claude/plans/goofy-moseying-puzzle.md`
- GitHub Issues (if repository is public)

---

## Changelog

### v1.0.0 (December 2024)
- ✅ Initial multi-tenant architecture
- ✅ Build-time store selection
- ✅ PWA support (manifest, splash screens, service worker)
- ✅ 4 stores configured (1, 20, 22, 23)
- ✅ Documentation complete

---

**Last Updated:** December 2024
**Author:** Claude Code Implementation
**Project:** Shopleez Multi-Tenant E-Commerce Platform
