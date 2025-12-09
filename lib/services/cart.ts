'use client';

/**
 * Cart Service
 *
 * React Query hooks for shopping cart operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/provider';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  Cart,
  AddToCartRequest,
  UpdateCartItemRequest,
  BulkAddRequest,
  CouponValidationResult,
} from '@/types/cart';

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
 * Fetch cart data
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
      return data;
    },
    staleTime: 30 * 1000, // 30 seconds - cart can change frequently
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Add item to cart
 */
export function useAddToCart() {
  const { apiClient, storeId, buildEndpoint } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: AddToCartRequest) => {
      const url = buildEndpoint(API_ENDPOINTS.cart.addItem);
      const { data } = await apiClient.post(url, request);
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
      const { data } = await apiClient.put(url, request);
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
      const { data } = await apiClient.put(url, request);
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
 */
export function useRemoveFromCart() {
  const { apiClient, storeId, buildEndpoint } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: number) => {
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
