'use client';

/**
 * Cart Store with localStorage Persistence
 *
 * Local-first cart management following Flutter Order Flow Documentation:
 * 1. All operations update local state immediately (optimistic)
 * 2. localStorage persistence for offline support
 * 3. Three-field matching (itemId + unitId + flavorId)
 * 4. Discount splitting when quantity exceeds limits
 * 5. Merge logic when combining local + server carts
 *
 * IMPORTANT: Uses skipHydration to prevent React hooks order mismatch
 * during SSR/hydration. Hydration is triggered manually in useEffect.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useState, useEffect } from 'react';
import type { CartItem, AddToCartRequest, Cart } from '@/types/cart';
import {
  matchCartItem,
  findCartItem,
  getCartItemKey,
  splitItemByDiscountQuantity,
  getDiscountMessage,
  SplitResult,
} from '@/lib/services/cart';

// ============================================================================
// TYPES
// ============================================================================

export interface LocalCart {
  items: CartItem[];
  lastUpdated: string;
}

interface CartStoreState {
  // Local cart data
  localCart: LocalCart;

  // Sync state
  isSyncing: boolean;
  lastSyncedAt: string | null;
  hasPendingChanges: boolean;
}

interface CartStoreActions {
  // === Local Operations (instant, no API) ===

  /**
   * Add item to local cart with automatic discount splitting
   */
  addItem: (request: AddToCartRequest) => void;

  /**
   * Update quantity for a specific item (by 3-field key)
   * Returns false if operation blocked (e.g., max quantity exceeded)
   */
  updateQuantity: (
    itemId: number,
    unitId: number | undefined,
    flavorId: number | undefined,
    newQuantity: number
  ) => boolean;

  /**
   * Remove item from local cart (by 3-field key)
   */
  removeItem: (
    itemId: number,
    unitId?: number,
    flavorId?: number
  ) => void;

  /**
   * Clear all items from local cart
   */
  clearCart: () => void;

  // === Cart Sync Operations ===

  /**
   * Merge server cart with local cart
   * Priority: local changes take precedence for items with pending changes
   */
  mergeWithServerCart: (serverCart: Cart) => void;

  /**
   * Replace local cart with server cart (after successful sync)
   */
  setFromServerCart: (serverCart: Cart) => void;

  /**
   * Mark sync as started
   */
  setSyncing: (isSyncing: boolean) => void;

  /**
   * Mark sync as complete
   */
  markSynced: () => void;

  // === Utility ===

  /**
   * Get total quantity for an item across all split entries
   */
  getItemTotalQuantity: (
    itemId: number,
    unitId?: number,
    flavorId?: number
  ) => number;

  /**
   * Check if item can have more quantity added
   */
  canAddMore: (
    itemId: number,
    unitId: number | undefined,
    isMaximumAmountForUser?: boolean,
    maximumAmountForUser?: number
  ) => boolean;

  /**
   * Get discount message for an item
   */
  getItemDiscountMessage: (
    itemId: number,
    unitId?: number,
    flavorId?: number
  ) => string | null;

  /**
   * Enrich cart item with product metadata (name, image, etc.)
   * Used to update old cart items that were added without metadata
   */
  enrichItem: (
    itemId: number,
    unitId: number | undefined,
    metadata: {
      name?: string;
      nameAr?: string;
      image?: string;
      selectedUnit?: {
        id: number;
        name: string;
        nameAr: string;
        price: number;
        discountPrice?: number;
      };
    }
  ) => void;
}

type CartStore = CartStoreState & CartStoreActions;

// ============================================================================
// HELPERS
// ============================================================================

let nextLocalId = 1;
function generateLocalId(): number {
  return -(nextLocalId++); // Negative IDs for local items (won't conflict with server)
}

function createCartItemFromPartial(
  partial: Partial<CartItem>,
  request: AddToCartRequest,
  name: string = '',
  nameAr: string = '',
  image: string = ''
): CartItem {
  return {
    id: generateLocalId(),
    itemId: request.itemId,
    name,
    nameAr,
    image,
    quantity: partial.quantity || 0,
    unitPrice: partial.unitPrice || request.normalPrice || 0,
    discountedUnitPrice: partial.discountedUnitPrice,
    totalPrice: partial.totalPrice || 0,
    selectedUnitId: partial.selectedUnitId || request.itemUnitId || request.customerUnitId,
    selectedFlavorId: partial.selectedFlavorId || request.flavourId,
    bigUnitId: partial.bigUnitId || request.bigUnitId,
    smallUnitId: partial.smallUnitId || request.smallUnitId,
    bigUnitDiscountMinQuantity: partial.bigUnitDiscountMinQuantity || request.bigUnitDiscountMinQuantity,
    bigUnitDiscountMaxQuantity: partial.bigUnitDiscountMaxQuantity || request.bigUnitDiscountMaxQuantity,
    smallUnitDiscountMinQuantity: partial.smallUnitDiscountMinQuantity || request.smallUnitDiscountMinQuantity,
    smallUnitDiscountMaxQuantity: partial.smallUnitDiscountMaxQuantity || request.smallUnitDiscountMaxQuantity,
    isMaximumAmountForUser: partial.isMaximumAmountForUser || request.isMaximumAmountForUser,
    maximumAmountForUser: partial.maximumAmountForUser || request.maximumAmountForUser,
    isAvailable: partial.isAvailable ?? true,
    itemAmount: partial.itemAmount,
  };
}

// ============================================================================
// STORE
// ============================================================================

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      localCart: {
        items: [],
        lastUpdated: new Date().toISOString(),
      },
      isSyncing: false,
      lastSyncedAt: null,
      hasPendingChanges: false,

      // === LOCAL OPERATIONS ===

      addItem: (request: AddToCartRequest) => {
        set((state) => {
          const items = [...state.localCart.items];
          const key = getCartItemKey(
            request.itemId,
            request.itemUnitId || request.customerUnitId,
            request.flavourId
          );

          // Find existing items with same 3-field key
          const existingItems = items.filter((item) =>
            matchCartItem(
              item,
              request.itemId,
              request.itemUnitId || request.customerUnitId,
              request.flavourId
            )
          );

          // Calculate current total quantity for this item
          const currentTotal = existingItems.reduce((sum, item) => sum + item.quantity, 0);
          const newTotal = currentTotal + request.quantity;

          // Check maximum quantity limit
          if (request.isMaximumAmountForUser && request.maximumAmountForUser) {
            if (newTotal > request.maximumAmountForUser) {
              console.warn(
                `[Cart Store] Cannot add: would exceed max quantity ${request.maximumAmountForUser}`
              );
              // Still add but cap at maximum
              const allowedToAdd = request.maximumAmountForUser - currentTotal;
              if (allowedToAdd <= 0) return state; // Can't add anything
              request = { ...request, quantity: allowedToAdd };
            }
          }

          // Remove existing items for this 3-field key (we'll re-add with new total)
          const filteredItems = items.filter(
            (item) =>
              !matchCartItem(
                item,
                request.itemId,
                request.itemUnitId || request.customerUnitId,
                request.flavourId
              )
          );

          // Get metadata from request first, then fall back to existing item (if any)
          const existingMeta = existingItems[0];
          const name = request.name || existingMeta?.name || '';
          const nameAr = request.nameAr || existingMeta?.nameAr || '';
          const image = request.image || existingMeta?.image || '';

          // Calculate new total and apply discount splitting
          const finalTotal = currentTotal + request.quantity;
          const splitResult = splitItemByDiscountQuantity(request, finalTotal);

          // Add split items back
          const newItems: CartItem[] = [...filteredItems];

          if (splitResult.discountedItem) {
            newItems.push(
              createCartItemFromPartial(splitResult.discountedItem, request, name, nameAr, image)
            );
          }

          if (splitResult.regularItem) {
            newItems.push(
              createCartItemFromPartial(splitResult.regularItem, request, name, nameAr, image)
            );
          }

          console.log('[Cart Store] Added item:', {
            itemId: request.itemId,
            unitId: request.itemUnitId || request.customerUnitId,
            flavorId: request.flavourId,
            quantity: request.quantity,
            newTotal: finalTotal,
            splitResult,
          });

          return {
            localCart: {
              items: newItems,
              lastUpdated: new Date().toISOString(),
            },
            hasPendingChanges: true,
          };
        });
      },

      updateQuantity: (itemId, unitId, flavorId, newQuantity) => {
        const state = get();

        // Find existing items with same 3-field key
        const existingItems = state.localCart.items.filter((item) =>
          matchCartItem(item, itemId, unitId, flavorId)
        );

        if (existingItems.length === 0 && newQuantity > 0) {
          console.warn('[Cart Store] Cannot update: item not found in cart');
          return false;
        }

        // Get metadata from first item
        const meta = existingItems[0];

        // Check max quantity limit (only when increasing)
        const currentTotal = existingItems.reduce((sum, item) => sum + item.quantity, 0);
        if (
          newQuantity > currentTotal &&
          meta?.isMaximumAmountForUser &&
          meta?.maximumAmountForUser
        ) {
          if (newQuantity > meta.maximumAmountForUser) {
            console.warn(
              `[Cart Store] Cannot update: would exceed max quantity ${meta.maximumAmountForUser}`
            );
            return false;
          }
        }

        set((state) => {
          // Remove all existing items for this 3-field key
          const filteredItems = state.localCart.items.filter(
            (item) => !matchCartItem(item, itemId, unitId, flavorId)
          );

          // If new quantity is 0, just remove
          if (newQuantity <= 0) {
            console.log('[Cart Store] Removed item:', { itemId, unitId, flavorId });
            return {
              localCart: {
                items: filteredItems,
                lastUpdated: new Date().toISOString(),
              },
              hasPendingChanges: true,
            };
          }

          // Create a request from existing metadata for splitting
          const request: AddToCartRequest = {
            itemId,
            quantity: newQuantity,
            customerUnitId: unitId,
            itemUnitId: unitId,
            flavourId: flavorId,
            normalPrice: meta?.unitPrice,
            itemPriceAfterDiscount: meta?.discountedUnitPrice,
            bigUnitId: meta?.bigUnitId,
            smallUnitId: meta?.smallUnitId,
            bigUnitDiscountMinQuantity: meta?.bigUnitDiscountMinQuantity,
            bigUnitDiscountMaxQuantity: meta?.bigUnitDiscountMaxQuantity,
            smallUnitDiscountMinQuantity: meta?.smallUnitDiscountMinQuantity,
            smallUnitDiscountMaxQuantity: meta?.smallUnitDiscountMaxQuantity,
            isMaximumAmountForUser: meta?.isMaximumAmountForUser,
            maximumAmountForUser: meta?.maximumAmountForUser,
          };

          // Apply discount splitting
          const splitResult = splitItemByDiscountQuantity(request, newQuantity);

          // Add split items back
          const newItems: CartItem[] = [...filteredItems];

          if (splitResult.discountedItem) {
            newItems.push(
              createCartItemFromPartial(
                splitResult.discountedItem,
                request,
                meta?.name || '',
                meta?.nameAr || '',
                meta?.image || ''
              )
            );
          }

          if (splitResult.regularItem) {
            newItems.push(
              createCartItemFromPartial(
                splitResult.regularItem,
                request,
                meta?.name || '',
                meta?.nameAr || '',
                meta?.image || ''
              )
            );
          }

          console.log('[Cart Store] Updated quantity:', {
            itemId,
            unitId,
            flavorId,
            oldTotal: currentTotal,
            newTotal: newQuantity,
          });

          return {
            localCart: {
              items: newItems,
              lastUpdated: new Date().toISOString(),
            },
            hasPendingChanges: true,
          };
        });

        return true;
      },

      removeItem: (itemId, unitId, flavorId) => {
        set((state) => {
          const filteredItems = state.localCart.items.filter(
            (item) => !matchCartItem(item, itemId, unitId, flavorId)
          );

          console.log('[Cart Store] Removed item:', { itemId, unitId, flavorId });

          return {
            localCart: {
              items: filteredItems,
              lastUpdated: new Date().toISOString(),
            },
            hasPendingChanges: true,
          };
        });
      },

      clearCart: () => {
        set({
          localCart: {
            items: [],
            lastUpdated: new Date().toISOString(),
          },
          hasPendingChanges: true,
        });
        console.log('[Cart Store] Cart cleared');
      },

      // === SYNC OPERATIONS ===

      mergeWithServerCart: (serverCart: Cart) => {
        set((state) => {
          // Strategy: Keep local items that have pending changes,
          // add server items that don't exist locally
          const localItems = state.localCart.items;
          const serverItems = serverCart.items;

          // Create a map of local items by 3-field key
          const localMap = new Map<string, CartItem[]>();
          for (const item of localItems) {
            const key = getCartItemKey(item.itemId, item.selectedUnitId, item.selectedFlavorId);
            const existing = localMap.get(key) || [];
            existing.push(item);
            localMap.set(key, existing);
          }

          // Create merged list
          const mergedItems: CartItem[] = [];
          const processedKeys = new Set<string>();

          // First, add all local items (they have priority if pending changes)
          if (state.hasPendingChanges) {
            for (const item of localItems) {
              mergedItems.push(item);
              const key = getCartItemKey(item.itemId, item.selectedUnitId, item.selectedFlavorId);
              processedKeys.add(key);
            }
          }

          // Then, add server items that aren't in local (or if no pending changes, use all server items)
          for (const item of serverItems) {
            const key = getCartItemKey(item.itemId, item.selectedUnitId, item.selectedFlavorId);
            if (!processedKeys.has(key) || !state.hasPendingChanges) {
              if (!processedKeys.has(key)) {
                mergedItems.push(item);
                processedKeys.add(key);
              }
            }
          }

          console.log('[Cart Store] Merged carts:', {
            localCount: localItems.length,
            serverCount: serverItems.length,
            mergedCount: mergedItems.length,
          });

          return {
            localCart: {
              items: state.hasPendingChanges ? mergedItems : serverItems,
              lastUpdated: new Date().toISOString(),
            },
            lastSyncedAt: new Date().toISOString(),
          };
        });
      },

      setFromServerCart: (serverCart: Cart) => {
        set({
          localCart: {
            items: serverCart.items,
            lastUpdated: serverCart.lastUpdated,
          },
          hasPendingChanges: false,
          lastSyncedAt: new Date().toISOString(),
        });
        console.log('[Cart Store] Set from server cart:', serverCart.items.length, 'items');
      },

      setSyncing: (isSyncing: boolean) => {
        set({ isSyncing });
      },

      markSynced: () => {
        set({
          hasPendingChanges: false,
          lastSyncedAt: new Date().toISOString(),
        });
      },

      // === UTILITY ===

      getItemTotalQuantity: (itemId, unitId, flavorId) => {
        const state = get();
        return state.localCart.items
          .filter((item) => matchCartItem(item, itemId, unitId, flavorId))
          .reduce((sum, item) => sum + item.quantity, 0);
      },

      canAddMore: (itemId, unitId, isMaximumAmountForUser, maximumAmountForUser) => {
        if (!isMaximumAmountForUser || !maximumAmountForUser) {
          return true;
        }

        const currentTotal = get().getItemTotalQuantity(itemId, unitId, undefined);
        return currentTotal < maximumAmountForUser;
      },

      getItemDiscountMessage: (itemId, unitId, flavorId) => {
        const state = get();
        const items = state.localCart.items.filter((item) =>
          matchCartItem(item, itemId, unitId, flavorId)
        );

        if (items.length === 0) return null;

        const meta = items[0];
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

        return getDiscountMessage(
          totalQuantity,
          unitId || 0,
          meta.bigUnitId,
          meta.bigUnitDiscountMinQuantity,
          meta.bigUnitDiscountMaxQuantity,
          meta.smallUnitDiscountMinQuantity,
          meta.smallUnitDiscountMaxQuantity
        );
      },

      enrichItem: (itemId, unitId, metadata) => {
        set((state) => {
          const items = state.localCart.items.map((item) => {
            // Match by itemId and unitId (ignore flavorId for enrichment)
            if (item.itemId === itemId && item.selectedUnitId === unitId) {
              return {
                ...item,
                name: metadata.name || item.name,
                nameAr: metadata.nameAr || item.nameAr,
                image: metadata.image || item.image,
                selectedUnit: metadata.selectedUnit || item.selectedUnit,
              };
            }
            return item;
          });

          console.log('[Cart Store] Enriched item:', {
            itemId,
            unitId,
            metadata,
          });

          return {
            localCart: {
              ...state.localCart,
              items,
            },
          };
        });
      },
    }),
    {
      name: 'shopleez-cart', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist the cart data, not sync state
      partialize: (state) => ({
        localCart: state.localCart,
        hasPendingChanges: state.hasPendingChanges,
      }),
      // Skip automatic hydration to prevent React hooks order mismatch
      // Hydration will be triggered manually in convenience hooks
      skipHydration: true,
    }
  )
);

// ============================================================================
// HYDRATION HOOK
// ============================================================================

/**
 * Hook to handle Zustand store hydration
 * Returns true when store is hydrated and ready to use
 */
export function useCartHydration(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Trigger rehydration from localStorage
    const unsubFinishHydration = useCartStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    // Manually trigger rehydration
    useCartStore.persist.rehydrate();

    return () => {
      unsubFinishHydration();
    };
  }, []);

  return hydrated;
}

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * Get cart items from local store
 * Returns empty array during SSR/hydration to ensure consistent hook order
 */
export function useLocalCartItems(): CartItem[] {
  const [hydrated, setHydrated] = useState(false);
  const items = useCartStore((state) => state.localCart.items);

  useEffect(() => {
    // Trigger rehydration from localStorage
    const unsubFinishHydration = useCartStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    // Check if already hydrated
    if (useCartStore.persist.hasHydrated()) {
      setHydrated(true);
    } else {
      // Manually trigger rehydration
      useCartStore.persist.rehydrate();
    }

    return () => {
      unsubFinishHydration();
    };
  }, []);

  // Return empty array during SSR/hydration to prevent mismatch
  return hydrated ? items : [];
}

/**
 * Get total quantity in cart
 */
export function useCartTotalQuantity(): number {
  const [hydrated, setHydrated] = useState(false);
  const quantity = useCartStore((state) =>
    state.localCart.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  useEffect(() => {
    const unsubFinishHydration = useCartStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    if (useCartStore.persist.hasHydrated()) {
      setHydrated(true);
    } else {
      useCartStore.persist.rehydrate();
    }

    return () => {
      unsubFinishHydration();
    };
  }, []);

  return hydrated ? quantity : 0;
}

/**
 * Get cart item count (unique items)
 */
export function useCartItemCount(): number {
  const [hydrated, setHydrated] = useState(false);
  const count = useCartStore((state) => state.localCart.items.length);

  useEffect(() => {
    const unsubFinishHydration = useCartStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    if (useCartStore.persist.hasHydrated()) {
      setHydrated(true);
    } else {
      useCartStore.persist.rehydrate();
    }

    return () => {
      unsubFinishHydration();
    };
  }, []);

  return hydrated ? count : 0;
}

/**
 * Check if cart has items
 */
export function useHasCartItems(): boolean {
  const [hydrated, setHydrated] = useState(false);
  const hasItems = useCartStore((state) => state.localCart.items.length > 0);

  useEffect(() => {
    const unsubFinishHydration = useCartStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    if (useCartStore.persist.hasHydrated()) {
      setHydrated(true);
    } else {
      useCartStore.persist.rehydrate();
    }

    return () => {
      unsubFinishHydration();
    };
  }, []);

  return hydrated ? hasItems : false;
}

/**
 * Get quantity for a specific item (by 3-field key)
 */
export function useItemQuantity(
  itemId: number,
  unitId?: number,
  flavorId?: number
): number {
  const [hydrated, setHydrated] = useState(false);
  const quantity = useCartStore((state) =>
    state.localCart.items
      .filter((item) => matchCartItem(item, itemId, unitId, flavorId))
      .reduce((sum, item) => sum + item.quantity, 0)
  );

  useEffect(() => {
    const unsubFinishHydration = useCartStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    if (useCartStore.persist.hasHydrated()) {
      setHydrated(true);
    } else {
      useCartStore.persist.rehydrate();
    }

    return () => {
      unsubFinishHydration();
    };
  }, []);

  return hydrated ? quantity : 0;
}

/**
 * Calculate cart subtotal
 */
export function useCartSubtotal(): number {
  const [hydrated, setHydrated] = useState(false);
  const subtotal = useCartStore((state) =>
    state.localCart.items.reduce((sum, item) => sum + item.totalPrice, 0)
  );

  useEffect(() => {
    const unsubFinishHydration = useCartStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    if (useCartStore.persist.hasHydrated()) {
      setHydrated(true);
    } else {
      useCartStore.persist.rehydrate();
    }

    return () => {
      unsubFinishHydration();
    };
  }, []);

  return hydrated ? subtotal : 0;
}
