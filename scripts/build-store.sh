#!/bin/bash

# Build script for multi-store deployment
# Usage: ./scripts/build-store.sh <storeId>
# Example: ./scripts/build-store.sh 22

set -e  # Exit on error

STORE_ID=$1

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if store ID is provided
if [ -z "$STORE_ID" ]; then
  echo -e "${RED}Error: Store ID required${NC}"
  echo "Usage: ./scripts/build-store.sh <storeId>"
  echo "Available stores: 1, 20, 22, 23"
  exit 1
fi

# Validate store exists
CONFIG_FILE="config/tenants/store${STORE_ID}.ts"
if [ ! -f "$CONFIG_FILE" ]; then
  echo -e "${RED}Error: Store ${STORE_ID} config not found${NC}"
  echo "Expected file: ${CONFIG_FILE}"
  echo "Available stores: 1, 20, 22, 23"
  exit 1
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Building for Store ${STORE_ID}${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Set environment variable and build
echo -e "${YELLOW}Setting NEXT_PUBLIC_STORE_ID=${STORE_ID}${NC}"
export NEXT_PUBLIC_STORE_ID=$STORE_ID

echo -e "${YELLOW}Running npm run build...${NC}"
npm run build

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Build complete for Store ${STORE_ID}${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "To test the build, run:"
echo "  NEXT_PUBLIC_STORE_ID=${STORE_ID} npm start"
