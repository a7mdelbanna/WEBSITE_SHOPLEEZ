# Shopleez Design System
## Based on Samokat Reference (Pixel-Perfect Clone)

This design system documents every visual specification extracted from the Samokat reference design.
All measurements, colors, and specifications must be followed exactly.

---

## 1. LAYOUT SYSTEM

### 1.1 Page Structure (3-Column Layout)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              HEADER (72px)                               │
├──────────────┬────────────────────────────────────┬─────────────────────┤
│              │                                    │                     │
│   SIDEBAR    │          MAIN CONTENT              │    RIGHT PANEL      │
│   (260px)    │          (flexible)                │    (320px)          │
│              │                                    │                     │
│              │                                    │                     │
└──────────────┴────────────────────────────────────┴─────────────────────┘
```

| Element | Width | Notes |
|---------|-------|-------|
| Left Sidebar | 260px | Fixed, white background |
| Main Content | calc(100% - 260px - 320px) | Flexible, light gray background |
| Right Panel | 320px | Fixed, contains city selector + map |
| Header | 100% width, 72px height | Fixed top, white background |

### 1.2 Content Area Constraints

```css
/* Main content area */
--content-max-width: 100%;
--content-padding-x: 24px;
--content-padding-y: 24px;

/* Grid gap between cards */
--grid-gap: 16px;
```

---

## 2. COLOR PALETTE

### 2.1 Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-brand` | `#FF4B26` | Logo, primary actions |
| `--color-brand-hover` | `#E63E1C` | Hover state |
| `--color-brand-light` | `#FFF0ED` | Light backgrounds |

### 2.2 Background Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg-page` | `#F5F5F7` | Main page background |
| `--color-bg-card` | `#FFFFFF` | Cards, sidebar, header |
| `--color-bg-input` | `#F5F5F7` | Search input background |
| `--color-bg-promo-banner` | `#FFF9E6` | Top promotional banner (cream/yellow) |

### 2.3 Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-text-primary` | `#1A1A1A` | Main headings, primary text |
| `--color-text-secondary` | `#6B7280` | Secondary text, subtitles |
| `--color-text-muted` | `#9CA3AF` | Muted text, placeholders, light headers |
| `--color-text-on-dark` | `#FFFFFF` | Text on dark backgrounds |
| `--color-text-on-image` | `#FFFFFF` | Text overlaid on images |

### 2.4 UI Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-border` | `#E5E7EB` | Borders, dividers |
| `--color-border-light` | `#F3F4F6` | Subtle borders |
| `--color-success` | `#10B981` | Success states |
| `--color-warning` | `#F59E0B` | Warning states |
| `--color-error` | `#EF4444` | Error states |

### 2.5 Promo Banners

**IMPORTANT: Promo banners are IMAGE-ONLY**

The promo banners in the "Доставка от 15 минут" section are **pure images** with NO HTML text overlay.
Any text visible on the banners (titles, descriptions, prices) is **baked into the banner image itself**.

| Property | Value |
|----------|-------|
| Content | Image only (no HTML text) |
| Text | Pre-rendered in image by designer |
| Badge ("Реклама") | Only UI element allowed (for sponsored content) |
| Aspect Ratio | ~3:4 or ~16:10 depending on layout |

---

## 3. TYPOGRAPHY

### 3.1 Font Family

```css
/* Primary Font (Latin + Cyrillic) */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Arabic Font */
--font-arabic: 'Cairo', 'Noto Sans Arabic', sans-serif;
```

### 3.2 Font Sizes

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `--text-xs` | 12px | 16px | Badges, labels |
| `--text-sm` | 14px | 20px | Small text, category items |
| `--text-base` | 16px | 24px | Body text |
| `--text-lg` | 18px | 28px | Emphasized text |
| `--text-xl` | 20px | 28px | Card titles |
| `--text-2xl` | 24px | 32px | Section headers |
| `--text-3xl` | 30px | 36px | Large section headers |
| `--text-4xl` | 36px | 40px | Page titles |

### 3.3 Font Weights

| Token | Weight | Usage |
|-------|--------|-------|
| `--font-light` | 300 | Light text (e.g., "Доставка") |
| `--font-regular` | 400 | Body text |
| `--font-medium` | 500 | Category items, buttons |
| `--font-semibold` | 600 | Subheadings |
| `--font-bold` | 700 | Headings, emphasis (e.g., "от 15 минут") |

### 3.4 Section Header Pattern

The "Доставка от 15 минут" header uses a specific pattern:

**IMPORTANT: The FIRST word is LIGHT, the rest is BOLD**

```
Доставка от 15 минут
└─light─┘ └──bold black──┘
```

```css
/* "Доставка" - Light gray, light weight (300) */
.header-light {
  color: #9CA3AF; /* --color-text-muted */
  font-weight: 300; /* --font-light */
  font-size: 32px;
}

/* "от 15 минут" - Black, bold weight (700) */
.header-bold {
  color: #1A1A1A; /* --color-text-primary */
  font-weight: 700; /* --font-bold */
  font-size: 32px;
}

/* Spacing below header */
margin-bottom: 28px;
```

---

## 4. SPACING SYSTEM

### 4.1 Base Unit

The base unit is **4px**. All spacing should be multiples of 4px.

### 4.2 Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-0` | 0px | No spacing |
| `--space-1` | 4px | Tight spacing |
| `--space-2` | 8px | Small gaps |
| `--space-3` | 12px | Category item gaps |
| `--space-4` | 16px | Card gaps, standard padding |
| `--space-5` | 20px | Card internal padding |
| `--space-6` | 24px | Section padding |
| `--space-8` | 32px | Section gaps |
| `--space-10` | 40px | Large section gaps |
| `--space-12` | 48px | Extra large gaps |

### 4.3 Component-Specific Spacing

```css
/* Header */
--header-height: 72px;
--header-padding-x: 24px;

/* Sidebar */
--sidebar-width: 260px;
--sidebar-padding: 16px;
--sidebar-item-gap: 8px;
--sidebar-icon-size: 40px;

/* Main Content */
--content-padding: 24px;
--section-gap: 32px;

/* Right Panel */
--right-panel-width: 320px;
--right-panel-padding: 24px;

/* Promo Cards */
--promo-card-gap: 16px;
--promo-card-padding: 20px;
--promo-card-text-max-width: 200px;
```

---

## 5. BORDER RADIUS

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | 0px | No radius |
| `--radius-sm` | 4px | Small elements |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Small cards, modals |
| `--radius-xl` | 16px | Medium cards |
| `--radius-2xl` | 20px | Large promo cards |
| `--radius-3xl` | 24px | Extra large cards |
| `--radius-full` | 9999px | Pills, circular buttons, badges |

### Specific Component Radii

| Component | Radius |
|-----------|--------|
| Promo Cards (Large) | 20px |
| Action Cards (Small) | 16px |
| Category Icons | 50% (circular) |
| Search Input | 12px |
| Buttons | 8px |
| "Реклама" Badge | 9999px (pill) |
| Map Preview | 12px |

---

## 6. SHADOWS

Samokat uses **minimal shadows**. Most cards have no shadow.

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-none` | none | Default for cards |
| `--shadow-sm` | 0 1px 2px rgba(0,0,0,0.05) | Subtle hover |
| `--shadow-md` | 0 4px 6px rgba(0,0,0,0.07) | Dropdowns |
| `--shadow-lg` | 0 10px 15px rgba(0,0,0,0.1) | Modals |

---

## 7. COMPONENT SPECIFICATIONS

### 7.1 Header

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [●] самокат       [🔍 Искать в Самокате          ]      [👤 Войти] [💬]│
└─────────────────────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Height | 72px |
| Background | #FFFFFF |
| Padding X | 24px |
| Logo Circle | 32px diameter, #FF4B26 |
| Logo Text | 20px, medium weight, #FF4B26 |
| Search Bar Width | ~400px flexible |
| Search Bar Height | 44px |
| Search Bar Background | #F5F5F7 |
| Search Bar Border Radius | 12px |
| Search Placeholder Color | #9CA3AF |
| Login Button | Text + icon, medium weight |
| Chat Icon | 24px, outlined style |

### 7.2 Left Sidebar

```
┌──────────────────────┐
│  [🍽️] Собрали для вас  │
│  [🥩] От Самоката     │
│  [🍕] Готовая еда     │
│  [🥬] Овощи и фрукты  │
│  [🥛] Молоко, яйца... │
│  [🍞] Хлеб и выпечка  │
│  ...                 │
└──────────────────────┘
```

| Property | Value |
|----------|-------|
| Width | 260px |
| Background | #FFFFFF |
| Padding | 16px |
| Item Height | 48px |
| Item Gap | 8px |
| Icon Size | 40px |
| Icon Shape | Circular (border-radius: 50%) |
| Icon Border | None |
| Text Size | 14px |
| Text Weight | 500 (medium) |
| Text Color | #1A1A1A |
| Hover Background | #F5F5F7 |
| Active Background | #FFF0ED |
| Active Text Color | #FF4B26 |

### 7.3 Promo Banner (Top)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ✂️ Скидка 25% на товары из подборки. Действует до 14:00 ▶            [×]│
└─────────────────────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | #FFF9E6 (cream/yellow) |
| Height | Auto (padding-based) |
| Padding | 12px 24px |
| Text Size | 14px |
| Text Color | #1A1A1A |
| Icon | Scissors emoji or custom |
| Close Button | 24px, X icon |
| Border Radius | 0 (full width) |

### 7.4 Promo Banners Section ("Доставка от 15 минут")

#### Section Header

```
Доставка от 15 минут
└──gray──┘ └──bold black──┘
```

| Property | Value |
|----------|-------|
| "Доставка" Color | #9CA3AF |
| "Доставка" Weight | 300 (light) |
| "от 15 минут" Color | #1A1A1A |
| "от 15 минут" Weight | 700 (bold) |
| Font Size | 30px |
| Margin Bottom | 24px |

#### Promo Banner Grid

**CRITICAL: BANNERS ARE IMAGE-ONLY**

```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ [IMAGE]  │ │ [IMAGE]  │ │ [IMAGE]  │ │ [IMAGE]  │
│          │ │          │ │          │ │          │
│          │ │          │ │          │ │       →  │
│          │ │ Реклама  │ │          │ │ Реклама  │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

**Banner Rules:**
- Banners are **PURE IMAGES** - no HTML text overlay
- Any text (titles, descriptions, prices) is **pre-rendered in the image by the designer**
- The ONLY allowed HTML overlay is the "Реклама" badge for sponsored content
- Navigation arrows appear externally (outside cards) if carousel mode is enabled

#### Banner Grid Properties

| Property | Value |
|----------|-------|
| Layout | CSS Grid, 3-4 columns |
| Grid Gap | 16px |
| Banner Aspect Ratio | ~3:4 (portrait) or ~16:10 (landscape) |
| Banner Min Height | 200-280px |
| Banner Border Radius | 20px |
| Banner Overflow | hidden |

#### Individual Banner

| Property | Value |
|----------|-------|
| Border Radius | 20px |
| Content | **IMAGE ONLY** - no HTML text |
| Image Fit | object-fit: cover |
| Image Position | center |
| Hover Effect | scale(1.02) |
| Cursor | pointer |

#### "Реклама" Badge

| Property | Value |
|----------|-------|
| Position | Bottom-left, 16px from edges |
| Background | rgba(255,255,255,0.8) |
| Padding | 6px 12px |
| Border Radius | 9999px (pill) |
| Font Size | 12px |
| Font Weight | 400 |
| Color | #6B7280 |
| Icon | ⓘ (info circle) |
| Icon Size | 14px |

#### Arrow Button (Card 4 only)

| Property | Value |
|----------|-------|
| Position | Right side, vertically centered |
| Size | 40px diameter |
| Background | #FFFFFF |
| Border Radius | 50% |
| Icon | → (arrow right) |
| Icon Color | #1A1A1A |
| Icon Size | 20px |

### 7.5 Actions Section ("Акции")

#### Section Header

| Property | Value |
|----------|-------|
| Text | "Акции" |
| Font Size | 24px |
| Font Weight | 700 |
| Color | #1A1A1A |
| Margin Bottom | 20px |

#### Action Cards Grid

```
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Small  │ │ Small  │ │ Small  │ │ Small  │ │ More → │
│ Card   │ │ Card   │ │ Card   │ │ Card   │ │        │
└────────┘ └────────┘ └────────┘ └────────┘ └────────┘
```

| Property | Value |
|----------|-------|
| Layout | CSS Grid, 5 columns |
| Grid Gap | 16px |
| Card Aspect Ratio | ~1:1.2 (near square, slightly tall) |
| Card Min Height | 180px |
| Card Border Radius | 16px |

#### Action Card Variants

**Image Card:**
| Property | Value |
|----------|-------|
| Background | Image |
| Text Position | Bottom-left or top-left |
| Text Color | #1A1A1A or #FFFFFF |
| Padding | 16px |

**Colored Background Card:**
| Property | Value |
|----------|-------|
| Background | Solid color (pink, green, blue, etc.) |
| Text Color | #1A1A1A or brand color |
| May contain | Emoji, illustrations |

**"More" Card:**
| Property | Value |
|----------|-------|
| Background | #FFFFFF |
| Text | "Больше" |
| Arrow | → in circle |
| Border | 1px solid #E5E7EB |

### 7.6 Right Panel

#### City Selector Card

```
┌─────────────────────────┐
│ Ваш город Москва?       │
│ Товары и акции зависят  │
│ от адреса               │
│                         │
│ [Да, верно] [Нет, другой]│
└─────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | #FFFFFF |
| Padding | 20px |
| Border Radius | 16px |
| Title Font Size | 18px |
| Title Font Weight | 600 |
| Title Color | #1A1A1A |
| Subtitle Font Size | 14px |
| Subtitle Color | #6B7280 |
| Button Gap | 12px |

#### City Buttons

**"Да, верно" Button:**
| Property | Value |
|----------|-------|
| Background | #FF4B26 |
| Color | #FFFFFF |
| Padding | 12px 20px |
| Border Radius | 8px |
| Font Weight | 500 |
| Font Size | 14px |

**"Нет, другой" Button:**
| Property | Value |
|----------|-------|
| Background | #FFFFFF |
| Color | #1A1A1A |
| Border | 1px solid #E5E7EB |
| Padding | 12px 20px |
| Border Radius | 8px |
| Font Weight | 500 |
| Font Size | 14px |

#### Map Preview

| Property | Value |
|----------|-------|
| Margin Top | 16px |
| Border Radius | 12px |
| Height | 200-250px |
| Overflow | hidden |
| Display | Static image or embedded map |

---

## 8. HOVER & INTERACTION STATES

### 8.1 Promo Cards

| State | Effect |
|-------|--------|
| Default | No shadow, no transform |
| Hover | Subtle scale(1.02), transition 200ms |
| Active | scale(0.98) |

### 8.2 Buttons

| State | Primary Button | Secondary Button |
|-------|----------------|------------------|
| Default | bg: #FF4B26 | bg: #FFFFFF, border: #E5E7EB |
| Hover | bg: #E63E1C | bg: #F5F5F7 |
| Active | bg: #CC3518 | bg: #E5E7EB |
| Disabled | bg: #FCA5A5, opacity: 0.6 | bg: #F5F5F7, opacity: 0.6 |

### 8.3 Sidebar Items

| State | Effect |
|-------|--------|
| Default | bg: transparent |
| Hover | bg: #F5F5F7 |
| Active | bg: #FFF0ED, color: #FF4B26 |

---

## 9. TRANSITIONS & ANIMATIONS

### 9.1 Timing

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `--duration-fast` | 150ms | ease-out | Micro-interactions |
| `--duration-normal` | 200ms | ease-out | Standard transitions |
| `--duration-slow` | 300ms | ease-in-out | Page transitions |

### 9.2 Standard Transitions

```css
/* Button transition */
transition: background-color 150ms ease-out, transform 150ms ease-out;

/* Card hover transition */
transition: transform 200ms ease-out;

/* Sidebar item transition */
transition: background-color 150ms ease-out;
```

---

## 10. RESPONSIVE BREAKPOINTS

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Desktop XL | ≥1440px | Full 3-column layout |
| Desktop | 1280-1439px | Full 3-column layout |
| Desktop SM | 1024-1279px | Right panel may collapse |
| Tablet | 768-1023px | Sidebar becomes overlay |
| Mobile | <768px | Single column, bottom nav |

### 10.1 Desktop Layout (≥1024px)

- Full 3-column layout
- Left sidebar: 260px fixed
- Right panel: 320px fixed
- Main content: flexible

### 10.2 Tablet Layout (768-1023px)

- 2-column layout
- Sidebar: Collapsible/overlay
- Right panel: Below main content or hidden
- Promo cards: 2 per row

### 10.3 Mobile Layout (<768px)

- Single column
- Bottom navigation
- Full-width cards
- Promo cards: 1-2 per row with horizontal scroll

---

## 11. Z-INDEX SCALE

| Token | Value | Usage |
|-------|-------|-------|
| `--z-base` | 0 | Default layer |
| `--z-dropdown` | 100 | Dropdowns, tooltips |
| `--z-sticky` | 200 | Sticky header |
| `--z-sidebar` | 300 | Sidebar overlay |
| `--z-modal` | 400 | Modals |
| `--z-toast` | 500 | Toast notifications |
| `--z-max` | 9999 | Maximum priority |

---

## 12. ICONOGRAPHY

### 12.1 Icon Sizes

| Size | Dimension | Usage |
|------|-----------|-------|
| xs | 16px | Inline icons |
| sm | 20px | Small buttons |
| md | 24px | Standard icons |
| lg | 32px | Featured icons |
| xl | 40px | Category icons |

### 12.2 Icon Style

- **Style**: Outlined (not filled)
- **Stroke Width**: 1.5-2px
- **Corner Radius**: Rounded caps
- **Color**: Inherits from text color

---

## 13. CSS CUSTOM PROPERTIES REFERENCE

```css
:root {
  /* === COLORS === */
  /* Brand */
  --color-brand: #FF4B26;
  --color-brand-hover: #E63E1C;
  --color-brand-light: #FFF0ED;

  /* Backgrounds */
  --color-bg-page: #F5F5F7;
  --color-bg-card: #FFFFFF;
  --color-bg-input: #F5F5F7;
  --color-bg-promo-banner: #FFF9E6;

  /* Text */
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #6B7280;
  --color-text-muted: #9CA3AF;
  --color-text-on-dark: #FFFFFF;

  /* UI */
  --color-border: #E5E7EB;
  --color-border-light: #F3F4F6;

  /* Status */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;

  /* === TYPOGRAPHY === */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-arabic: 'Cairo', 'Noto Sans Arabic', sans-serif;

  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 30px;
  --text-4xl: 36px;

  --font-light: 300;
  --font-regular: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* === SPACING === */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* === BORDER RADIUS === */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 20px;
  --radius-3xl: 24px;
  --radius-full: 9999px;

  /* === SHADOWS === */
  --shadow-none: none;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);

  /* === LAYOUT === */
  --header-height: 72px;
  --sidebar-width: 260px;
  --right-panel-width: 320px;

  /* === TRANSITIONS === */
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;

  /* === Z-INDEX === */
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-sidebar: 300;
  --z-modal: 400;
  --z-toast: 500;
}
```

---

## 14. PROMO CARDS - DETAILED SPECIFICATION

This is the most critical component. Here are the EXACT specifications:

### 14.1 Container

```css
.promo-section {
  padding: 24px;
}

.promo-header {
  margin-bottom: 24px;
}

.promo-header-light {
  color: #9CA3AF;
  font-weight: 300;
  font-size: 30px;
}

.promo-header-bold {
  color: #1A1A1A;
  font-weight: 700;
  font-size: 30px;
}
```

### 14.2 Grid Layout

```css
.promo-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
```

### 14.3 Individual Card

```css
.promo-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  aspect-ratio: 3/4;
  min-height: 280px;
  background-size: cover;
  background-position: center;
}

.promo-card-content {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  z-index: 1;
}

.promo-card-title {
  color: #FFFFFF;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
  max-width: 200px;
  /* NO text shadow unless image is very light */
}

.promo-badge {
  position: absolute;
  bottom: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.85);
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 12px;
  color: #6B7280;
}

.promo-arrow-button {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 14.4 Card Variations

**Card 1 - Chef Promo:**
- Background: Warm food photography
- Text: White, top-left
- No badge

**Card 2 - Holiday Promo:**
- Background: Christmas/holiday imagery
- Text: White, top-left
- No badge

**Card 3 - Pet Food (Sponsored):**
- Background: Light/neutral product shot
- Text: Dark (#1A1A1A) if background is light
- "Реклама" badge: Bottom-left

**Card 4 - Promo Code (Sponsored):**
- Background: Solid dark gray (#374151)
- Text: White, top-left
- "Реклама" badge: Bottom-left
- Arrow button: Right side, centered

---

## 15. DO's AND DON'Ts

### DO:
- Use the exact color values specified
- Maintain the 4-column grid for promo cards
- Keep text positioning consistent (top-left)
- Use the specified border radius values
- Maintain proper spacing between elements

### DON'T:
- Add carousels or sliders to the promo section
- Add shadows to promo cards
- Add dark overlays to images
- Center text on cards
- Change the grid to horizontal scroll
- Modify the 3-column page layout
- Add animations that weren't in the original

---

## 16. IMPLEMENTATION CHECKLIST

- [ ] Update globals.css with new CSS variables
- [ ] Implement 3-column layout (sidebar, main, right panel)
- [ ] Create Header component with exact specifications
- [ ] Create Sidebar with category items
- [ ] Create PromoSection with static 4-column grid
- [ ] Create PromoCard component with all variants
- [ ] Create "Реклама" badge component
- [ ] Create ActionSection with smaller cards
- [ ] Create RightPanel with city selector
- [ ] Create MapPreview component
- [ ] Test responsive behavior
