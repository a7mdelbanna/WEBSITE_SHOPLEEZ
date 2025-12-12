'use client';

/**
 * Cart Service
 *
 * React Query hooks for shopping cart operations.
 *
 * CRITICAL CONCEPTS (from Flutter Order Flow Documentation):
 * 1. Three-Field Matching: Items match on itemId + unitId + flavorId
 * 2. Discount Splitting: Items split when quantity exceeds discount limits
 * 3. Local-First: Updates happen locally first, sync on checkout
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/provider';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { isAuthenticated } from '@/lib/api/client';
import type {
  Cart,
  CartItem,
  CartSummary,
  AddToCartRequest,
  UpdateCartItemRequest,
  BulkAddRequest,
  CouponValidationResult,
} from '@/types/cart';

// ============================================================================
// THREE-FIELD MATCHING HELPERS
// ============================================================================

/**
 * Match cart items using 3-field key: itemId + unitId + flavorId
 * This is CRITICAL for proper cart behavior - same product with different
 * units or flavors should be separate cart entries.
 */
export function matchCartItem(
  cartItem: CartItem,
  itemId: number,
  unitId?: number,
  flavorId?: number
): boolean {
  return (
    cartItem.itemId === itemId &&
    cartItem.selectedUnitId === unitId &&
    (cartItem.selectedFlavorId || undefined) === (flavorId || undefined)
  );
}

/**
 * Find a cart item by 3-field key
 */
export function findCartItem(
  items: CartItem[],
  itemId: number,
  unitId?: number,
  flavorId?: number
): CartItem | undefined {
  return items.find((item) => matchCartItem(item, itemId, unitId, flavorId));
}

/**
 * Get unique key for cart item (used for grouping and deduplication)
 */
export function getCartItemKey(
  itemId: number,
  unitId?: number,
  flavorId?: number
): string {
  return `${itemId}-${unitId || 0}-${flavorId || 0}`;
}

// ============================================================================
// DISCOUNT SPLITTING LOGIC
// ============================================================================

/**
 * Result of splitting an item by discount quantity limits
 */
export interface SplitResult {
  discountedItem?: Partial<CartItem>;  // Within discount limits (gets special price)
  regularItem?: Partial<CartItem>;     // Exceeds limits (gets regular price)
}

/**
 * Split an item into discounted and regular portions based on quantity limits.
 *
 * From Flutter documentation - 4 cases:
 * 1. No limits → use special price for all if available
 * 2. Below min → regular price only (no discount)
 * 3. Exceeds max → split into 2 entries (discounted + regular)
 * 4. Within range → special price for all
 *
 * @param request The add-to-cart request with all discount info
 * @param totalQuantity Total quantity being added
 * @returns Split result with discounted and/or regular items
 */
export function splitItemByDiscountQuantity(
  request: AddToCartRequest,
  totalQuantity: number
): SplitResult {
  // Determine which unit we're dealing with
  const isBigUnit = request.itemUnitId === request.bigUnitId;

  // Get the appropriate min/max for this unit
  const minQty = isBigUnit
    ? request.bigUnitDiscountMinQuantity
    : request.smallUnitDiscountMinQuantity;
  const maxQty = isBigUnit
    ? request.bigUnitDiscountMaxQuantity
    : request.smallUnitDiscountMaxQuantity;

  const regularPrice = request.normalPrice || 0;
  const specialPrice = request.itemPriceAfterDiscount || request.discountedPrice;

  // Helper to create cart item partial
  const createItemPartial = (
    quantity: number,
    price: number,
    isDiscounted: boolean
  ): Partial<CartItem> => ({
    itemId: request.itemId,
    quantity,
    unitPrice: regularPrice,
    discountedUnitPrice: isDiscounted ? price : undefined,
    totalPrice: price * quantity,
    selectedUnitId: request.itemUnitId || request.customerUnitId,
    selectedFlavorId: request.flavourId,
    bigUnitId: request.bigUnitId,
    smallUnitId: request.smallUnitId,
    bigUnitDiscountMinQuantity: request.bigUnitDiscountMinQuantity,
    bigUnitDiscountMaxQuantity: request.bigUnitDiscountMaxQuantity,
    smallUnitDiscountMinQuantity: request.smallUnitDiscountMinQuantity,
    smallUnitDiscountMaxQuantity: request.smallUnitDiscountMaxQuantity,
    isMaximumAmountForUser: request.isMaximumAmountForUser,
    maximumAmountForUser: request.maximumAmountForUser,
    isAvailable: true,
  });

  // Case 1: No limits defined - use special price if available
  if (!minQty && !maxQty) {
    const effectivePrice = specialPrice || regularPrice;
    return {
      discountedItem: createItemPartial(totalQuantity, effectivePrice, !!specialPrice),
    };
  }

  // Case 2: Below minimum - no discount applies
  if (minQty && totalQuantity < minQty) {
    return {
      regularItem: createItemPartial(totalQuantity, regularPrice, false),
    };
  }

  // Case 3: Exceeds maximum - split into two entries
  if (maxQty && totalQuantity > maxQty) {
    const discountedQty = maxQty;
    const regularQty = totalQuantity - maxQty;
    const effectiveSpecialPrice = specialPrice || regularPrice;

    return {
      discountedItem: createItemPartial(discountedQty, effectiveSpecialPrice, true),
      regularItem: createItemPartial(regularQty, regularPrice, false),
    };
  }

  // Case 4: Within range - apply discount to all
  const effectivePrice = specialPrice || regularPrice;
  return {
    discountedItem: createItemPartial(totalQuantity, effectivePrice, !!specialPrice),
  };
}

/**
 * Get discount message for an item based on current quantity and limits
 * Returns a message explaining the discount status
 */
export function getDiscountMessage(
  quantity: number,
  unitId: number,
  bigUnitId?: number,
  bigUnitDiscountMin?: number,
  bigUnitDiscountMax?: number,
  smallUnitDiscountMin?: number,
  smallUnitDiscountMax?: number
): string | null {
  const isBigUnit = unitId === bigUnitId;
  const minQty = isBigUnit ? bigUnitDiscountMin : smallUnitDiscountMin;
  const maxQty = isBigUnit ? bigUnitDiscountMax : smallUnitDiscountMax;

  if (!minQty && !maxQty) return null;

  if (minQty && quantity < minQty) {
    const remaining = minQty - quantity;
    return `Add ${remaining} more to get special price`;
  }

  if (maxQty && quantity >= maxQty) {
    return `Maximum discount quantity (${maxQty}) reached`;
  }

  if (maxQty) {
    const remaining = maxQty - quantity;
    return `${remaining} more items eligible for special price`;
  }

  return null;
}

/**
 * Query keys for cart
 */
export const cartQueryKeys = {
  all: ['cart'] as const,
  cart: (storeId: number, addressId?: number) =>
    [...cartQueryKeys.all, storeId, addressId] as const,
  suggestions: (storeId: number) => [...cartQueryKeys.all, 'suggestions', storeId] as const,
  coupon: (storeId: number, code: string) =>
    [...cartQueryKeys.all, 'coupon', storeId, code] as const,
};

/**
 * Normalize API cart response to our Cart type
 *
 * Backend CartInfoDto structure:
 * - totalItems: number of items
 * - items: CartItemDto[] (each has item, itemUnit, flavour, itemQuantity, itemPrice, itemOfferDisVal)
 * - subTotal, totalTax, totalVat, totalPayment
 * - couponDisVal, inviteeDisVal, deliveryFee, finalAmount
 * - appliedCoupons: string[]
 */
function normalizeCartResponse(apiData: Record<string, unknown>): Cart {
  // Handle empty cart or missing data
  if (!apiData) {
    return {
      items: [],
      summary: {
        subtotal: 0,
        discount: 0,
        couponDiscount: 0,
        deliveryFee: 0,
        tip: 0,
        total: 0,
        inviteeDiscount: 0,
        itemCount: 0,
        totalQuantity: 0,
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  // Normalize items
  const apiItems = (apiData.items as Array<Record<string, unknown>>) || [];
  const items: CartItem[] = apiItems.map((apiItem) => {
    const item = apiItem.item as Record<string, unknown> | null;
    const itemUnit = apiItem.itemUnit as Record<string, unknown> | null;
    const flavour = apiItem.flavour as Record<string, unknown> | null;

    const itemQuantity = (apiItem.itemQuantity as number) || 1;
    const itemPrice = (apiItem.itemPrice as number) || 0;
    const itemOfferDisVal = (apiItem.itemOfferDisVal as number) || 0;
    const discountedPrice = itemOfferDisVal > 0 ? itemPrice - itemOfferDisVal : itemPrice;

    // Extract discount limits and max quantity from item if available
    const bigUnitId = (item?.bigUnitId as number) || undefined;
    const smallUnitId = (item?.smallUnitId as number) || undefined;
    const bigUnitDiscountMinQuantity = (item?.bigUnitDiscountMinQuantity as number) || undefined;
    const bigUnitDiscountMaxQuantity = (item?.bigUnitDiscountMaxQuantity as number) || undefined;
    const smallUnitDiscountMinQuantity = (item?.smallUnitDiscountMinQuantity as number) || undefined;
    const smallUnitDiscountMaxQuantity = (item?.smallUnitDiscountMaxQuantity as number) || undefined;
    const isMaximumAmountForUser = (item?.isMaximumAmountForUser as boolean) || false;
    const maximumAmountForUser = (item?.maximumAmountForUser as number) || undefined;
    const itemAmount = (item?.itemAmount as number) || (item?.amount as number) || undefined;

    return {
      id: (item?.id as number) || 0,
      itemId: (item?.id as number) || 0,
      name: (item?.nameEn as string) || (item?.name as string) || '',
      nameAr: (item?.nameAr as string) || (item?.name as string) || '',
      image: (item?.mainImageUrl as string) || (item?.imageUrl as string) || '',
      quantity: itemQuantity,
      unitPrice: itemPrice,
      discountedUnitPrice: discountedPrice,
      totalPrice: discountedPrice * itemQuantity,
      selectedUnitId: itemUnit?.id as number | undefined,
      selectedUnit: itemUnit ? {
        id: (itemUnit.id as number) || 0,
        name: (itemUnit.name as string) || '',
        nameAr: (itemUnit.nameAr as string) || '',
        price: itemPrice,
      } : undefined,
      selectedFlavorId: flavour?.id as number | undefined,
      selectedFlavorName: (flavour?.name as string) || undefined,
      // Unit identification for 3-field matching
      bigUnitId,
      smallUnitId,
      // Discount quantity limits (for splitting logic)
      bigUnitDiscountMinQuantity,
      bigUnitDiscountMaxQuantity,
      smallUnitDiscountMinQuantity,
      smallUnitDiscountMaxQuantity,
      // Maximum quantity per user
      isMaximumAmountForUser,
      maximumAmountForUser,
      // Stock status
      isAvailable: itemAmount === undefined || itemAmount > 0,
      itemAmount,
    };
  });

  // Calculate totals
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = (apiData.subTotal as number) || 0;
  const totalPayment = (apiData.totalPayment as number) || subtotal;
  const couponDiscount = (apiData.couponDisVal as number) || 0;
  const inviteeDiscount = (apiData.inviteeDisVal as number) || 0;
  const deliveryFee = (apiData.deliveryFee as number) || 0;
  const finalAmount = (apiData.finalAmount as number) || totalPayment;

  // Calculate item discount (total - subtotal - taxes)
  const itemDiscount = subtotal - items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  return {
    items,
    summary: {
      subtotal,
      discount: Math.abs(itemDiscount),
      couponDiscount,
      deliveryFee,
      tip: 0,
      total: finalAmount,
      inviteeDiscount,
      itemCount: items.length,
      totalQuantity,
      appliedCouponCode: (apiData.appliedCoupons as string[])?.[0],
    },
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Fetch cart data
 * Only fetches when user is authenticated to avoid 401 errors
 */
export function useCart(addressId?: number) {
  const { apiClient, storeId, buildEndpoint } = useApiClient();

  return useQuery<Cart>({
    queryKey: cartQueryKeys.cart(storeId, addressId),
    queryFn: async () => {
      const url = buildEndpoint(API_ENDPOINTS.cart.get);
      const { data } = await apiClient.get(url, {
        params: addressId ? { addressId } : undefined,
      });

      console.log('[Cart] Raw API response:', data);

      // Normalize the API response to match our Cart type
      const normalizedCart = normalizeCartResponse(data as Record<string, unknown>);
      console.log('[Cart] Normalized cart:', normalizedCart);

      return normalizedCart;
    },
    // Only fetch when authenticated
    enabled: isAuthenticated(),
    staleTime: 30 * 1000, // 30 seconds - cart can change frequently
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Add item to cart
 *
 * Based on backend CartItemForCreateDto.cs, the API expects (camelCase due to ASP.NET Core JSON serialization):
 * - itemId (long) - Required
 * - itemQuantity (int) - Required
 * - itemUnitId (long) - Required
 * - itemPrice (double) - Required
 * - flavourId (long?) - Optional
 */
export function useAddToCart() {
  const { apiClient, storeId, buildEndpoint } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: AddToCartRequest) => {
      const url = buildEndpoint(API_ENDPOINTS.cart.addItem);

      // Build request matching backend CartItemForCreateDto
      // C# property names are converted to camelCase by ASP.NET Core JSON serialization
      const cartRequest: Record<string, unknown> = {
        itemId: request.itemId,
        itemQuantity: request.quantity,
        itemUnitId: request.customerUnitId || 0,
        itemPrice: request.normalPrice || 0,
      };

      // Add flavourId if provided (optional field)
      if (request.flavourId !== undefined && request.flavourId > 0) {
        cartRequest.flavourId = request.flavourId;
      }

      console.log('[Cart] Sending add-to-cart request (camelCase for ASP.NET Core):', cartRequest);
      const { data } = await apiClient.post(url, cartRequest);
      console.log('[Cart] Add-to-cart response:', data);
      return data;
    },
    onSuccess: () => {
      // Invalidate cart queries to refetch
      queryClient.invalidateQueries({
        queryKey: cartQueryKeys.all,
      });
    },
  });
}

/**
 * Update cart item quantity
 */
export function useUpdateCartItem() {
  const { apiClient, storeId, buildEndpoint } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UpdateCartItemRequest) => {
      const url = buildEndpoint(API_ENDPOINTS.cart.updateQuantity);
      // API expects { itemId, newItemQuantity } - see Order Flow Documentation
      const apiRequest = {
        itemId: request.itemId,
        newItemQuantity: request.quantity,
      };
      console.log('[Cart] Update quantity request:', apiRequest);
      const { data } = await apiClient.put(url, apiRequest);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cartQueryKeys.all,
      });
    },
  });
}

/**
 * Update cart item flavor
 */
export function useUpdateCartItemFlavor() {
  const { apiClient, storeId, buildEndpoint } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: { itemId: number; flavourId: number }) => {
      const url = buildEndpoint(API_ENDPOINTS.cart.updateFlavor);
      // API expects { itemId, newFlavourId } - see Order Flow Documentation
      const apiRequest = {
        itemId: request.itemId,
        newFlavourId: request.flavourId,
      };
      console.log('[Cart] Update flavor request:', apiRequest);
      const { data } = await apiClient.put(url, apiRequest);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cartQueryKeys.all,
      });
    },
  });
}

/**
 * Remove item from cart
 *
 * Note: API currently only supports removal by itemId.
 * The unitId and flavorId parameters are for future API support
 * and for local cart operations.
 */
export interface RemoveFromCartRequest {
  itemId: number;
  unitId?: number;     // For 3-field matching (future API support)
  flavorId?: number;   // For 3-field matching (future API support)
}

export function useRemoveFromCart() {
  const { apiClient, storeId, buildEndpoint } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: RemoveFromCartRequest | number) => {
      // Support both old (just itemId) and new (object with 3 fields) format
      const itemId = typeof request === 'number' ? request : request.itemId;
      const url = buildEndpoint(API_ENDPOINTS.cart.removeItem, { itemId });
      const { data } = await apiClient.delete(url);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cartQueryKeys.all,
      });
    },
  });
}

/**
 * Clear cart
 */
export function useClearCart() {
  const { apiClient, storeId, buildEndpoint } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressId?: number) => {
      const url = buildEndpoint(API_ENDPOINTS.cart.clear);
      const { data } = await apiClient.delete(url, {
        params: addressId ? { addressId } : undefined,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cartQueryKeys.all,
      });
    },
  });
}

/**
 * Bulk add items to cart
 */
export function useBulkAddToCart() {
  const { apiClient, storeId, buildEndpoint } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: BulkAddRequest) => {
      const url = buildEndpoint(API_ENDPOINTS.cart.bulkAdd);
      const { data } = await apiClient.post(url, request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cartQueryKeys.all,
      });
    },
  });
}

/**
 * Bulk update cart items
 */
export function useBulkUpdateCart() {
  const { apiClient, storeId, buildEndpoint } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: BulkAddRequest) => {
      const url = buildEndpoint(API_ENDPOINTS.cart.bulkUpdate);
      const { data } = await apiClient.post(url, request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cartQueryKeys.all,
      });
    },
  });
}

/**
 * Fetch cart suggestions
 */
export function useCartSuggestions(enabled = true) {
  const { apiClient, storeId, buildEndpoint } = useApiClient();

  return useQuery({
    queryKey: cartQueryKeys.suggestions(storeId),
    queryFn: async () => {
      const url = buildEndpoint(API_ENDPOINTS.cart.getSuggestions);
      const { data } = await apiClient.get(url);
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

/**
 * Validate coupon code
 */
export function useValidateCoupon(couponCode: string, enabled = true) {
  const { apiClient, storeId, buildEndpoint } = useApiClient();

  return useQuery<CouponValidationResult>({
    queryKey: cartQueryKeys.coupon(storeId, couponCode),
    queryFn: async () => {
      const url = buildEndpoint(API_ENDPOINTS.coupons.validate, { couponCode });
      const { data } = await apiClient.get(url);
      return data;
    },
    enabled: enabled && couponCode.length > 0,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Apply coupon to cart
 */
export function useApplyCoupon() {
  const { apiClient, storeId, buildEndpoint } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (couponCode: string) => {
      const url = buildEndpoint(API_ENDPOINTS.coupons.apply);
      const { data } = await apiClient.post(url, { couponCode });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cartQueryKeys.all,
      });
    },
  });
}

// ============================================================================
// PRE-CHECKOUT CART SYNC
// ============================================================================

/**
 * Group cart items by 3-field key (itemId + unitId + flavorId)
 * This merges split items back together for server sync
 */
export function groupCartItemsFor3FieldKey(items: CartItem[]): Map<string, CartItem[]> {
  const grouped = new Map<string, CartItem[]>();

  for (const item of items) {
    const key = getCartItemKey(item.itemId, item.selectedUnitId, item.selectedFlavorId);
    const existing = grouped.get(key) || [];
    existing.push(item);
    grouped.set(key, existing);
  }

  return grouped;
}

/**
 * Merge grouped cart items into AddToCartRequest format
 * This combines split items (discounted + regular) back to single entry for API
 */
export function mergeGroupedItemsForSync(groupedItems: Map<string, CartItem[]>): AddToCartRequest[] {
  const requests: AddToCartRequest[] = [];

  for (const [, items] of groupedItems) {
    if (items.length === 0) continue;

    // Sum up total quantity from all split items
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const firstItem = items[0];

    // Use the regular price (not discounted) for sync - backend will recalculate discounts
    const normalPrice = firstItem.unitPrice;

    requests.push({
      itemId: firstItem.itemId,
      quantity: totalQuantity,
      customerUnitId: firstItem.selectedUnitId,
      normalPrice,
      flavourId: firstItem.selectedFlavorId,
      // Pass discount info so backend can verify
      bigUnitId: firstItem.bigUnitId,
      smallUnitId: firstItem.smallUnitId,
      bigUnitDiscountMinQuantity: firstItem.bigUnitDiscountMinQuantity,
      bigUnitDiscountMaxQuantity: firstItem.bigUnitDiscountMaxQuantity,
      smallUnitDiscountMinQuantity: firstItem.smallUnitDiscountMinQuantity,
      smallUnitDiscountMaxQuantity: firstItem.smallUnitDiscountMaxQuantity,
    });
  }

  return requests;
}

/**
 * Sync local cart with server before checkout
 *
 * CRITICAL: This must be called before placing an order!
 *
 * Algorithm (from Flutter documentation):
 * 1. Clear server cart
 * 2. Group local items by 3-field key (merge split items)
 * 3. Bulk add to server
 * 4. Fetch updated cart
 */
export function useSyncCartBeforeCheckout() {
  const { apiClient, storeId, buildEndpoint } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (localItems: CartItem[]) => {
      console.log('[Cart Sync] Starting pre-checkout cart sync with', localItems.length, 'items');

      // Step 1: Clear server cart
      console.log('[Cart Sync] Step 1: Clearing server cart');
      const clearUrl = buildEndpoint(API_ENDPOINTS.cart.clear);
      await apiClient.delete(clearUrl);

      // Step 2: Group items by 3-field key
      console.log('[Cart Sync] Step 2: Grouping items by 3-field key');
      const grouped = groupCartItemsFor3FieldKey(localItems);
      const requests = mergeGroupedItemsForSync(grouped);

      console.log('[Cart Sync] Grouped into', requests.length, 'unique items');

      // Step 3: Bulk add to server
      if (requests.length > 0) {
        console.log('[Cart Sync] Step 3: Bulk adding items to server');
        const bulkAddUrl = buildEndpoint(API_ENDPOINTS.cart.bulkAdd);

        // Convert requests to the format expected by API
        const apiRequests = requests.map((req) => ({
          itemId: req.itemId,
          itemQuantity: req.quantity,
          itemUnitId: req.customerUnitId || 0,
          itemPrice: req.normalPrice || 0,
          ...(req.flavourId && req.flavourId > 0 ? { flavourId: req.flavourId } : {}),
        }));

        await apiClient.post(bulkAddUrl, { items: apiRequests });
      }

      // Step 4: Fetch updated cart
      console.log('[Cart Sync] Step 4: Fetching updated cart');
      const cartUrl = buildEndpoint(API_ENDPOINTS.cart.get);
      const { data } = await apiClient.get(cartUrl);

      const normalizedCart = normalizeCartResponse(data as Record<string, unknown>);
      console.log('[Cart Sync] Sync complete. Server cart:', normalizedCart);

      return normalizedCart;
    },
    onSuccess: (syncedCart) => {
      // Update the cart in React Query cache
      queryClient.setQueryData(cartQueryKeys.all, syncedCart);
      queryClient.invalidateQueries({
        queryKey: cartQueryKeys.all,
      });
    },
    onError: (error) => {
      console.error('[Cart Sync] Failed to sync cart:', error);
    },
  });
}

/**
 * Get total quantity for an item across all split entries
 */
export function getTotalQuantityForItem(
  items: CartItem[],
  itemId: number,
  unitId?: number,
  flavorId?: number
): number {
  return items
    .filter((item) => matchCartItem(item, itemId, unitId, flavorId))
    .reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Check if adding more items would exceed maximum quantity limit
 */
export function wouldExceedMaxQuantity(
  currentTotal: number,
  addQuantity: number,
  isMaximumAmountForUser?: boolean,
  maximumAmountForUser?: number
): boolean {
  if (!isMaximumAmountForUser || !maximumAmountForUser) {
    return false;
  }
  return currentTotal + addQuantity > maximumAmountForUser;
}
