'use client';

/**
 * Cart Enrichment Hook
 *
 * Automatically fetches product metadata for cart items that are missing
 * name, image, or unit information. This handles the case where old cart
 * items in localStorage were added before metadata was passed.
 *
 * Usage:
 *   const { isEnriching, enrichedCount } = useEnrichCartItems();
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useLocalCartItems, useCartStore } from '@/lib/stores/cart-store';
import { useApiClient } from '@/lib/api/provider';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { productQueryKeys, type ProductDetailResponse } from '@/lib/services/products';

/**
 * Check if a cart item needs enrichment
 */
function needsEnrichment(item: { name?: string; nameAr?: string; image?: string }): boolean {
  return !item.name || !item.nameAr || !item.image;
}

/**
 * Hook to automatically enrich cart items with missing metadata
 */
export function useEnrichCartItems() {
  const cartItems = useLocalCartItems();
  const enrichItem = useCartStore((state) => state.enrichItem);
  const { apiClient, storeId, buildEndpoint } = useApiClient();

  const [enrichedCount, setEnrichedCount] = useState(0);
  const enrichedItemsRef = useRef<Set<string>>(new Set());

  // Find items that need enrichment
  const itemsNeedingEnrichment = cartItems.filter((item) => {
    const key = `${item.itemId}-${item.selectedUnitId}`;
    // Skip if already enriched in this session
    if (enrichedItemsRef.current.has(key)) return false;
    return needsEnrichment(item);
  });

  // Get unique item IDs that need fetching
  const uniqueItemIds = [...new Set(itemsNeedingEnrichment.map((item) => item.itemId))];

  // Fetch product details for items needing enrichment
  const productQueries = useQueries({
    queries: uniqueItemIds.map((itemId) => ({
      queryKey: productQueryKeys.detail(storeId, itemId),
      queryFn: async () => {
        const url = buildEndpoint(API_ENDPOINTS.products.getById, { itemId });
        const { data } = await apiClient.get(url);
        return (data.data || data) as ProductDetailResponse;
      },
      enabled: itemId > 0,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      gcTime: 15 * 60 * 1000,
    })),
  });

  // Process fetched data and enrich cart items
  const processEnrichment = useCallback(() => {
    let newlyEnriched = 0;

    productQueries.forEach((query, index) => {
      if (!query.data || query.isLoading) return;

      const product = query.data;
      const itemId = uniqueItemIds[index];

      // Find all cart items with this itemId that need enrichment
      const matchingItems = itemsNeedingEnrichment.filter(
        (item) => item.itemId === itemId
      );

      matchingItems.forEach((cartItem) => {
        const key = `${cartItem.itemId}-${cartItem.selectedUnitId}`;

        // Skip if already processed
        if (enrichedItemsRef.current.has(key)) return;

        // Determine the unit info based on selectedUnitId
        const isBigUnit = cartItem.selectedUnitId === product.bigUnit?.id;
        const unitInfo = isBigUnit ? product.bigUnit : product.smallUnit;
        const unitPrice = isBigUnit ? product.bigUnitPrice : product.smallUnitPrice;
        const unitImage = isBigUnit
          ? product.itemImageForBigUnitUrl
          : product.itemImageForSmallUnitUrl;

        // Enrich the cart item
        enrichItem(cartItem.itemId, cartItem.selectedUnitId, {
          name: product.nameEN || product.nameAR,
          nameAr: product.nameAR,
          image: unitImage || product.itemImageForSmallUnitUrl || product.itemImageForBigUnitUrl,
          selectedUnit: unitInfo ? {
            id: unitInfo.id,
            name: unitInfo.nameEN || unitInfo.nameAR,
            nameAr: unitInfo.nameAR,
            price: unitPrice,
          } : undefined,
        });

        enrichedItemsRef.current.add(key);
        newlyEnriched++;
      });
    });

    if (newlyEnriched > 0) {
      setEnrichedCount((prev) => prev + newlyEnriched);
      console.log(`[Cart Enrichment] Enriched ${newlyEnriched} cart items`);
    }
  }, [productQueries, uniqueItemIds, itemsNeedingEnrichment, enrichItem]);

  // Run enrichment when queries complete
  useEffect(() => {
    const allLoaded = productQueries.every((q) => !q.isLoading);
    if (allLoaded && itemsNeedingEnrichment.length > 0) {
      processEnrichment();
    }
  }, [productQueries, itemsNeedingEnrichment.length, processEnrichment]);

  const isEnriching = productQueries.some((q) => q.isLoading);
  const hasErrors = productQueries.some((q) => q.isError);

  return {
    isEnriching,
    enrichedCount,
    hasErrors,
    itemsNeedingEnrichment: itemsNeedingEnrichment.length,
  };
}

/**
 * Convenience hook that returns cart items and auto-enriches them
 */
export function useEnrichedCartItems() {
  const cartItems = useLocalCartItems();
  const { isEnriching, enrichedCount } = useEnrichCartItems();

  return {
    items: cartItems,
    isEnriching,
    enrichedCount,
  };
}
