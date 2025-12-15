# Multi-Tenant Platform - Quick Start Guide

## 📋 Table of Contents
1. [Asset Creation Workflow](#asset-creation-workflow)
2. [Development Commands](#development-commands)
3. [Adding a New Store](#adding-a-new-store)
4. [Common Tasks](#common-tasks)

---

## 🎨 Asset Creation Workflow

### Automated (Recommended)

If you have ImageMagick installed:

```bash
# Install ImageMagick (macOS)
brew install imagemagick

# Generate all assets for a store
./scripts/create-store-assets.sh 22 ~/Desktop/logo.svg "#2196F3"

# That's it! All assets are created automatically:
# ✓ PWA Icons (9 sizes)
# ✓ Splash Screens (6 sizes)
# ✓ Preloader
# ✓ Favicon
# ✓ Logo files
```

**Arguments:**
- `22` - Store ID
- `~/Desktop/logo.svg` - Path to your logo file
- `"#2196F3"` - Primary brand color (hex code)

### Manual

1. **Create directories:**
   ```bash
   mkdir -p public/tenants/store22/icons
   mkdir -p public/tenants/store22/splash
   ```

2. **Create assets using Figma/Photoshop:**
   - See detailed guide in `MULTI_TENANT_GUIDE.md`
   - Use [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)

3. **Place files in:**
   ```
   public/tenants/store22/
   ├── icons/icon-72x72.png
   ├── icons/icon-96x96.png
   ├── ... (7 more icon sizes)
   ├── splash/splash-750x1334.png
   ├── ... (5 more splash sizes)
   ├── preloader.png
   ├── logo.svg
   ├── logo-light.svg
   └── favicon.ico
   ```

---

## 💻 Development Commands

### Run Development Server

```bash
# Default store (Store 1)
npm run dev

# Specific store
NEXT_PUBLIC_STORE_ID=22 npm run dev

# Access at http://localhost:3000
```

### Build for Production

```bash
# Build for Store 1
npm run build:store1

# Build for Store 20
npm run build:store20

# Build for Store 22
npm run build:store22

# Build for Store 23
npm run build:store23

# Or use bash script
./scripts/build-store.sh 22
```

### Test Production Build

```bash
# Build
npm run build:store22

# Run production server
npm start

# Access at http://localhost:3000
```

---

## ➕ Adding a New Store

### Step 1: Create Tenant Config

```bash
# Create config file
touch config/tenants/store25.ts
```

**Edit `config/tenants/store25.ts`:**

```typescript
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
    primaryColor: '#E91E63',      // Your brand color
    primaryHover: '#C2185B',
    primaryLight: '#F06292',
    secondaryColor: '#FFC107',
    // ... copy structure from existing store config
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

  currency: { code: 'EGP', symbol: 'ج.م', position: 'after' },
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
  },

  fonts: {
    fontPrimary: 'Inter',
    fontArabic: 'Cairo',
  },
};
```

### Step 2: Register Store

**Edit `config/tenants/index.ts`:**

```typescript
import { store25Config } from './store25';  // Add import

export const TENANTS = {
  store1: store1Config,
  store20: store20Config,
  store22: store22Config,
  store23: store23Config,
  store25: store25Config,  // Add here
} as const;
```

### Step 3: Add Build Script

**Edit `package.json`:**

```json
{
  "scripts": {
    "build:store25": "NEXT_PUBLIC_STORE_ID=25 next build"
  }
}
```

### Step 4: Update PWA Components

**Edit `app/manifest.ts`:**

```typescript
const tenantConfigs: Record<string, {...}> = {
  // ... existing stores
  '25': {
    name: { en: 'Candy World', ar: 'عالم الحلوى' },
    theme: { primaryColor: '#E91E63', backgroundColor: '#FFFFFF' },
    locale: 'ar',
  },
};
```

**Edit `components/splash-screen.tsx`:**

```typescript
const storeConfigs: Record<string, {...}> = {
  // ... existing stores
  '25': { name: 'عالم الحلوى', primaryColor: '#E91E63' },
};
```

### Step 5: Create Assets

```bash
# Use automated script
./scripts/create-store-assets.sh 25 ~/Desktop/logo.svg "#E91E63"
```

### Step 6: Test

```bash
# Test in development
NEXT_PUBLIC_STORE_ID=25 npm run dev

# Build and test production
npm run build:store25
npm start
```

---

## 🔧 Common Tasks

### Check Asset Structure

```bash
# View all store assets
tree public/tenants/

# Check specific store
tree public/tenants/store22/

# Check file sizes
du -sh public/tenants/store22/*
```

### Verify Configuration

```bash
# Check tenant config exports correctly
node -e "console.log(require('./config/tenants').TENANTS.store22)"

# Check manifest works
curl http://localhost:3000/manifest.json | jq
```

### Clear Cache & Rebuild

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules (if needed)
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build:store22
```

### Test PWA Features

```bash
# Build for production (PWA only works in production)
npm run build:store22

# Start production server
npm start

# Test in browser:
# 1. Open DevTools → Application → Manifest
# 2. Check Service Workers tab
# 3. Try "Add to Home Screen"
# 4. Test offline mode (Network tab → Offline)
```

### Optimize Assets

```bash
# Install optimization tools
npm install -g imageoptim-cli

# Optimize all PNGs in a store
imageoptim public/tenants/store22/**/*.png

# Or use online tool: https://tinypng.com/
```

### Deploy to Netlify

```bash
# Create branch for store
git checkout -b store22

# Push to remote
git push origin store22

# In Netlify dashboard:
# 1. New site from Git
# 2. Select branch: store22
# 3. Build command: npm run build:store22
# 4. Environment: NEXT_PUBLIC_STORE_ID=22
# 5. Publish directory: .next
```

---

## 📁 File Locations Quick Reference

```
Important Files:
├── config/tenants/           # Store configurations
├── app/manifest.ts           # PWA manifest generator
├── app/layout.tsx            # Root layout (PWA setup)
├── components/
│   ├── splash-screen.tsx     # Splash screen component
│   ├── preloader.tsx         # Loading indicators
│   └── service-worker-registration.tsx
├── public/
│   ├── sw.js                 # Service worker
│   └── tenants/store{X}/     # Store assets
├── scripts/
│   ├── build-store.sh        # Build script
│   └── create-store-assets.sh # Asset generator
├── middleware.ts             # Domain routing
├── next.config.ts            # Next.js config
└── package.json              # Build scripts
```

---

## 🎯 Asset Checklist for New Store

Before deploying a store, ensure:

- [ ] Tenant config created (`config/tenants/storeX.ts`)
- [ ] Config registered in index (`config/tenants/index.ts`)
- [ ] Build script added (`package.json`)
- [ ] PWA manifest updated (`app/manifest.ts`)
- [ ] Splash screen config updated (`components/splash-screen.tsx`)
- [ ] PWA icons created (9 files in `public/tenants/storeX/icons/`)
- [ ] Splash screens created (6 files in `public/tenants/storeX/splash/`)
- [ ] Preloader created (`public/tenants/storeX/preloader.png`)
- [ ] Logos added (`logo.svg`, `logo-light.svg`)
- [ ] Favicon created (`favicon.ico`)
- [ ] Colors tested (check with DevTools)
- [ ] Build successful (`npm run build:storeX`)
- [ ] PWA works (test in production)
- [ ] Offline mode works (test with airplane mode)

---

## 🆘 Quick Troubleshooting

**Problem:** Icons not showing
```bash
# Check files exist
ls public/tenants/store22/icons/
# Should show 9 PNG files

# Check manifest
curl http://localhost:3000/manifest.json | jq '.icons'
```

**Problem:** Wrong colors
```bash
# Clear cache
rm -rf .next
npm run dev

# Check CSS variables in browser DevTools
# Elements → Computed → filter: --color
```

**Problem:** Build fails
```bash
# Check TypeScript errors
npm run lint

# Verify config exports
node -e "console.log(require('./config/tenants').TENANTS)"
```

**Problem:** Service worker not working
```bash
# Service workers only work in production
npm run build:store22
npm start

# Check in DevTools → Application → Service Workers
```

---

## 📚 Full Documentation

For complete details, see:
- **`MULTI_TENANT_GUIDE.md`** - Complete architecture & step-by-step guide
- **`/Users/ahmed/.claude/plans/goofy-moseying-puzzle.md`** - Implementation plan

---

## 🚀 Next Steps

1. **Create Assets:**
   ```bash
   ./scripts/create-store-assets.sh 22 ~/logo.svg "#2196F3"
   ```

2. **Test Locally:**
   ```bash
   NEXT_PUBLIC_STORE_ID=22 npm run dev
   ```

3. **Build & Deploy:**
   ```bash
   npm run build:store22
   git checkout -b store22
   git push origin store22
   # Configure Netlify
   ```

---

**Happy Building! 🎉**
