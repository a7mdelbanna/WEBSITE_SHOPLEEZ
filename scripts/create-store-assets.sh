#!/bin/bash

# ============================================================================
# Store Asset Generator Script
# ============================================================================
# This script helps create all required PWA assets for a store
# Usage: ./scripts/create-store-assets.sh <storeId> <logo-source> <primary-color>
# Example: ./scripts/create-store-assets.sh 22 ~/Desktop/logo.svg "#2196F3"
# ============================================================================

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================================================
# Configuration
# ============================================================================

STORE_ID=$1
LOGO_SOURCE=$2
PRIMARY_COLOR=${3:-"#2196F3"}  # Default to blue if not provided

# Validate inputs
if [ -z "$STORE_ID" ]; then
  echo -e "${RED}Error: Store ID required${NC}"
  echo "Usage: ./scripts/create-store-assets.sh <storeId> <logo-source> <primary-color>"
  echo "Example: ./scripts/create-store-assets.sh 22 ~/Desktop/logo.svg \"#2196F3\""
  exit 1
fi

if [ -z "$LOGO_SOURCE" ]; then
  echo -e "${RED}Error: Logo source file required${NC}"
  echo "Usage: ./scripts/create-store-assets.sh <storeId> <logo-source> <primary-color>"
  echo "Example: ./scripts/create-store-assets.sh 22 ~/Desktop/logo.svg \"#2196F3\""
  exit 1
fi

if [ ! -f "$LOGO_SOURCE" ]; then
  echo -e "${RED}Error: Logo source file not found: $LOGO_SOURCE${NC}"
  exit 1
fi

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
  echo -e "${RED}Error: ImageMagick not installed${NC}"
  echo "Install with: brew install imagemagick"
  exit 1
fi

# ============================================================================
# Setup
# ============================================================================

OUTPUT_DIR="public/tenants/store${STORE_ID}"
ICONS_DIR="$OUTPUT_DIR/icons"
SPLASH_DIR="$OUTPUT_DIR/splash"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Store Asset Generator${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${YELLOW}Store ID:${NC} $STORE_ID"
echo -e "${YELLOW}Logo Source:${NC} $LOGO_SOURCE"
echo -e "${YELLOW}Primary Color:${NC} $PRIMARY_COLOR"
echo -e "${YELLOW}Output Directory:${NC} $OUTPUT_DIR"
echo ""

# Create directories
echo -e "${GREEN}Creating directories...${NC}"
mkdir -p "$ICONS_DIR"
mkdir -p "$SPLASH_DIR"

# ============================================================================
# Generate PWA Icons
# ============================================================================

echo ""
echo -e "${GREEN}Generating PWA icons...${NC}"

# Array of icon sizes
ICON_SIZES=(72 96 128 144 152 192 384 512)

for size in "${ICON_SIZES[@]}"; do
  echo -e "${YELLOW}  → Generating ${size}x${size}...${NC}"
  convert "$LOGO_SOURCE" \
    -background "$PRIMARY_COLOR" \
    -alpha remove \
    -resize ${size}x${size} \
    "$ICONS_DIR/icon-${size}x${size}.png"
done

# Generate maskable icon (with extra padding for iOS safe area)
echo -e "${YELLOW}  → Generating maskable icon (512x512 with padding)...${NC}"
convert "$LOGO_SOURCE" \
  -background "$PRIMARY_COLOR" \
  -alpha remove \
  -resize 400x400 \
  -gravity center \
  -extent 512x512 \
  "$ICONS_DIR/maskable-icon-512x512.png"

echo -e "${GREEN}✓ PWA icons generated (9 files)${NC}"

# ============================================================================
# Generate Splash Screens
# ============================================================================

echo ""
echo -e "${GREEN}Generating splash screens...${NC}"

# Splash screen sizes for different iPhone models
declare -A SPLASH_SIZES=(
  ["640x1136"]="iPhone SE (legacy)"
  ["750x1334"]="iPhone 8, 7, 6s"
  ["828x1792"]="iPhone 11, XR"
  ["1125x2436"]="iPhone 11 Pro, X, XS"
  ["1242x2208"]="iPhone 8 Plus, 7 Plus"
  ["1242x2688"]="iPhone 11 Pro Max, XS Max"
)

for size in "${!SPLASH_SIZES[@]}"; do
  device="${SPLASH_SIZES[$size]}"
  width=$(echo $size | cut -d'x' -f1)
  height=$(echo $size | cut -d'x' -f2)

  echo -e "${YELLOW}  → Generating ${size} (${device})...${NC}"

  # Create splash screen with logo centered on primary color background
  convert -size ${width}x${height} \
    "xc:${PRIMARY_COLOR}" \
    \( "$LOGO_SOURCE" -resize 300x300 -background none -gravity center \) \
    -gravity center \
    -composite \
    "$SPLASH_DIR/splash-${size}.png"
done

echo -e "${GREEN}✓ Splash screens generated (6 files)${NC}"

# ============================================================================
# Generate Preloader
# ============================================================================

echo ""
echo -e "${GREEN}Generating preloader...${NC}"
convert "$LOGO_SOURCE" \
  -background none \
  -alpha set \
  -resize 200x200 \
  "$OUTPUT_DIR/preloader.png"
echo -e "${GREEN}✓ Preloader generated${NC}"

# ============================================================================
# Generate Favicon
# ============================================================================

echo ""
echo -e "${GREEN}Generating favicon...${NC}"
convert "$LOGO_SOURCE" \
  -background none \
  -alpha set \
  -resize 32x32 \
  "$OUTPUT_DIR/favicon.ico"
echo -e "${GREEN}✓ Favicon generated${NC}"

# ============================================================================
# Copy Logo Files
# ============================================================================

echo ""
echo -e "${GREEN}Copying logo files...${NC}"

# Copy original logo
cp "$LOGO_SOURCE" "$OUTPUT_DIR/logo.svg"
echo -e "${YELLOW}  → Copied logo.svg${NC}"

# Create light version (same as original for now - user can replace)
cp "$LOGO_SOURCE" "$OUTPUT_DIR/logo-light.svg"
echo -e "${YELLOW}  → Copied logo-light.svg (replace with actual light version)${NC}"

# ============================================================================
# Summary
# ============================================================================

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}✓ Asset generation complete!${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${YELLOW}Generated Files:${NC}"
echo "  - PWA Icons: $ICONS_DIR/ (9 files)"
echo "  - Splash Screens: $SPLASH_DIR/ (6 files)"
echo "  - Preloader: $OUTPUT_DIR/preloader.png"
echo "  - Favicon: $OUTPUT_DIR/favicon.ico"
echo "  - Logos: $OUTPUT_DIR/logo.svg, logo-light.svg"
echo ""
echo -e "${YELLOW}File Sizes:${NC}"
du -sh "$ICONS_DIR"/* | awk '{print "  - " $2 ": " $1}'
du -sh "$SPLASH_DIR"/* | awk '{print "  - " $2 ": " $1}'
echo ""
echo -e "${YELLOW}Total Size:${NC}"
du -sh "$OUTPUT_DIR" | awk '{print "  " $1}'
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Review generated assets in: $OUTPUT_DIR"
echo "  2. Replace logo-light.svg with actual light version if needed"
echo "  3. Optimize images if file sizes are too large (use TinyPNG)"
echo "  4. Test with: NEXT_PUBLIC_STORE_ID=$STORE_ID npm run dev"
echo "  5. Build with: npm run build:store$STORE_ID"
echo ""
echo -e "${GREEN}Done!${NC}"
