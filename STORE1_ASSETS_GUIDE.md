# Store 1 (El-Etihad) - Assets Setup Guide

## ✅ What's Already Set Up

### Logos & Preloader
```
/public/tenants/store1/
├── logo.png                  ✅ Full color logo (yellow circle)
├── preloader.png            ✅ B&W animated loader
├── logo.svg                 ✅ (existing)
├── logo-light.svg           ✅ (existing)
└── favicon.ico              ✅ (existing)
```

### Enhanced Preloader Component
✅ Updated with beautiful animations:
- Dual rotating rings (slow + reverse)
- Pulsing logo in center
- Bouncing loading dots
- Smooth fade-in effects

**Animation Features:**
- Outer ring rotates slowly (3s)
- Inner ring rotates in reverse (2s)
- Logo pulses subtly (2s)
- Loading dots bounce with staggered timing

---

## ⚠️ PWA Assets Still Needed

You need to generate these assets for full PWA support:

### 1. PWA Icons (9 files needed)

**Required Sizes:**
```
/public/tenants/store1/icons/
├── icon-72x72.png           ⬜ TODO
├── icon-96x96.png           ⬜ TODO
├── icon-128x128.png         ⬜ TODO
├── icon-144x144.png         ⬜ TODO
├── icon-152x152.png         ⬜ TODO
├── icon-192x192.png         ⬜ TODO
├── icon-384x384.png         ⬜ TODO
├── icon-512x512.png         ⬜ TODO
└── maskable-icon-512x512.png ⬜ TODO
```

### 2. Splash Screens (6 files needed)

**Required Sizes:**
```
/public/tenants/store1/splash/
├── splash-640x1136.png      ⬜ TODO
├── splash-750x1334.png      ⬜ TODO
├── splash-828x1792.png      ⬜ TODO
├── splash-1125x2436.png     ⬜ TODO
├── splash-1242x2208.png     ⬜ TODO
└── splash-1242x2688.png     ⬜ TODO
```

---

## 🎨 How to Generate PWA Assets

### Option 1: Online Tool (Easiest - Recommended)

#### Step 1: Use PWA Asset Generator
1. Go to: https://www.pwabuilder.com/imageGenerator
2. Upload `logo.png` from `/public/tenants/store1/logo.png`
3. Select "Generate" for all platforms
4. Download the ZIP file

#### Step 2: Organize Files
```bash
# Extract downloaded files
cd ~/Downloads
unzip pwa-assets.zip

# Copy icons (adjust paths to match downloaded structure)
cp icons-*.png /Users/ahmed/Documents/Website_Shopleez/web/public/tenants/store1/icons/

# Rename to our naming convention if needed
cd /Users/ahmed/Documents/Website_Shopleez/web/public/tenants/store1/icons/
mv icon-ios-192.png icon-192x192.png  # Example - adjust as needed
```

### Option 2: Using Figma (Best Quality)

#### For PWA Icons:

1. **Create Icon Frame**
   - Create 512x512px frame in Figma
   - Import `logo.png`
   - Resize to fit (leave 10% padding)

2. **Export All Sizes**
   - Select frame
   - Add export settings:
     - 72w, 96w, 128w, 144w, 152w, 192w, 384w, 512w
   - Format: PNG
   - Export all

3. **Create Maskable Icon**
   - Duplicate 512x512 frame
   - Add **20% extra padding** (important for iOS)
   - Export as `maskable-icon-512x512.png`

#### For Splash Screens:

**Design Guidelines:**
- Background: Golden Yellow (#f4b324) to match logo
- Logo: Centered, white or black version
- Text: "الاتحاد" below logo
- Safe area: Keep content in center 60%

**Sizes to Create:**
1. Create frames with these exact sizes:
   ```
   640x1136   (iPhone SE)
   750x1334   (iPhone 8)
   828x1792   (iPhone 11)
   1125x2436  (iPhone X)
   1242x2208  (iPhone 8 Plus)
   1242x2688  (iPhone 11 Pro Max)
   ```

2. **For each frame:**
   - Fill background: `#f4b324` (golden yellow from logo)
   - Add logo centered (approx 300px)
   - Add "الاتحاد" text below (48pt, Cairo font)
   - Export as PNG

### Option 3: Using ImageMagick (Command Line)

If you install ImageMagick:

```bash
# Install ImageMagick
brew install imagemagick

# Then run the automated script
cd /Users/ahmed/Documents/Website_Shopleez/web
./scripts/create-store-assets.sh 1 public/tenants/store1/logo.png "#f4b324"
```

### Option 4: Use Existing Assets from Flutter

If you have the Flutter app assets:

```bash
# Copy from Flutter project
FLUTTER_ASSETS="/path/to/flutter/assets/icons/store1"

cp $FLUTTER_ASSETS/ic_launcher*.png \
   /Users/ahmed/Documents/Website_Shopleez/web/public/tenants/store1/icons/

# Rename to web naming convention
cd /Users/ahmed/Documents/Website_Shopleez/web/public/tenants/store1/icons/
# ... rename files as needed
```

---

## 🧪 Testing After Adding Assets

### 1. Local Development Test

```bash
cd /Users/ahmed/Documents/Website_Shopleez/web

# Run with Store 1
NEXT_PUBLIC_STORE_ID=1 npm run dev

# Or use default (Store 1)
npm run dev

# Open http://localhost:3000
```

**Verify:**
- ✅ Splash screen appears with animated B&W logo
- ✅ Preloader shows with rotating rings
- ✅ Full color logo in header
- ✅ Favicon in browser tab

### 2. Check Manifest

Visit: http://localhost:3000/manifest.json

**Should show:**
```json
{
  "name": "الاتحاد",
  "short_name": "El-Etihad",
  "theme_color": "#FF6B6B",
  "icons": [
    {
      "src": "/tenants/store1/icons/icon-72x72.png",
      "sizes": "72x72"
    },
    // ... all icon sizes
  ]
}
```

### 3. Test Preloader Animation

**Create a test page:**

```typescript
// app/test-loader/page.tsx
import { Preloader, PageLoader } from '@/components/preloader';

export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-8">Preloader Test</h1>

      <div className="space-y-8">
        <div>
          <h2>Small</h2>
          <Preloader size="sm" />
        </div>

        <div>
          <h2>Medium</h2>
          <Preloader size="md" message="Loading..." />
        </div>

        <div>
          <h2>Large</h2>
          <Preloader size="lg" message="Please wait..." />
        </div>
      </div>
    </div>
  );
}
```

Visit: http://localhost:3000/test-loader

### 4. Production Build Test

```bash
# Build for Store 1
npm run build:store1

# Run production server
npm start

# Test at http://localhost:3000
```

**PWA Features (production only):**
- Open Chrome DevTools → Application
- Check Manifest tab (all icons should load)
- Check Service Workers tab (should register)
- Try "Add to Home Screen"

---

## 📱 What You'll See

### Splash Screen (Initial Load)
```
┌─────────────────────────┐
│                         │
│    [Dual Rotating       │
│     Rings with          │
│     B&W Logo]           │
│                         │
│    الاتحاد              │
│                         │
│    ● ● ●                │
│   (bouncing dots)       │
│                         │
└─────────────────────────┘
```

**Animation Details:**
- Outer ring: Slow clockwise rotation (3s)
- Inner ring: Fast counter-clockwise (2s)
- Logo: Gentle pulse effect
- Dots: Staggered bounce

### Preloader (Loading States)

Used throughout the app for loading states:

```typescript
// In any component
import { Preloader } from '@/components/preloader';

<Preloader size="md" message="Loading products..." />
```

---

## 🎯 Quick Reference

### Asset Locations

| Asset Type | Path | Status |
|------------|------|--------|
| Color Logo | `/public/tenants/store1/logo.png` | ✅ Done |
| B&W Preloader | `/public/tenants/store1/preloader.png` | ✅ Done |
| PWA Icons | `/public/tenants/store1/icons/*.png` | ⬜ TODO |
| Splash Screens | `/public/tenants/store1/splash/*.png` | ⬜ TODO |

### Commands

```bash
# Development
npm run dev                              # Store 1 (default)
NEXT_PUBLIC_STORE_ID=1 npm run dev      # Explicit Store 1

# Build
npm run build:store1                     # Build for Store 1
npm start                                # Run production

# Test
open http://localhost:3000               # View app
open http://localhost:3000/manifest.json # Check manifest
open http://localhost:3000/test-loader   # Test animations
```

### Colors (Store 1)

```css
Primary: #f4b324 (golden yellow - matches logo circle)
Primary Hover: #d49a1e (darker gold)
Primary Light: #fef5e0 (light gold for backgrounds)
Secondary: #2C3E50 (dark blue-gray)
Secondary Hover: #1a252f (darker blue-gray)
Accent: #FF6B35 (warm orange)
Background: #FFFFFF (white)
```

---

## 🚀 Next Steps

### Immediate (Required for PWA):
1. ⬜ Generate 9 PWA icons (use Option 1 above - online tool)
2. ⬜ Generate 6 splash screens (use Figma - Option 2)
3. ⬜ Test manifest at /manifest.json
4. ⬜ Test "Add to Home Screen" on mobile

### Optional (Enhanced UX):
1. ⬜ Create light version of logo (logo-light.svg)
2. ⬜ Optimize PNG file sizes (use TinyPNG)
3. ⬜ Create additional splash screen sizes for tablets
4. ⬜ Test offline mode (service worker)

### Deployment:
1. ⬜ Create `store1` git branch
2. ⬜ Push to remote
3. ⬜ Configure Netlify deployment
4. ⬜ Set custom domain

---

## 📚 Documentation

For more details, see:
- **MULTI_TENANT_GUIDE.md** - Complete architecture guide
- **QUICK_START.md** - Quick commands reference
- **Plan file** - `/Users/ahmed/.claude/plans/goofy-moseying-puzzle.md`

---

## ✨ Preview

Your animated preloader will look like this:

```
        🔄 Slow rotating outer ring
          🔄 Fast reverse inner ring
            ✨ Pulsing logo
               ● ● ●
           (bouncing dots)
```

**Smooth, professional, and matches your brand!** 🎉

---

**Status:** Logos and animation ✅ | PWA assets ⬜ (15 files to generate)

**Estimated Time:** 30-60 minutes using online tools or Figma
