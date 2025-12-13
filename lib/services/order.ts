'use client';

/**
 * Order Service
 *
 * React Query hooks for order management matching Flutter app flow:
 * - Get valid order ID
 * - Checkout (create order from cart)
 * - Get checkout info (pre-populate totals)
 * - Get my orders (order history)
 * - Get order details
 * - Leave tip
 * - Rate order
 * - Cancel order
 * - Get delivery fee by address
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/provider';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { buildUrl } from '@/lib/api/client';
import { cartQueryKeys } from './cart';
import type {
  Order,
  OrderSummary,
  CheckoutRequest,
} from '@/types/order';

// ============== Types ==============

export interface CheckoutInfo {
  subtotal: number;
  discount: number;
  couponDiscount: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

export interface DeliveryFeeResponse {
  deliveryFee: number;
  freeDeliveryMinimum?: number;
  isFreeDelivery?: boolean;
}

export interface RateOrderRequest {
  orderId: number;
  rating: number;
  review?: string;
}

export interface LeaveTipRequest {
  orderId: number;
  tipAmount: number;
}

// ============== Query Keys ==============

export const orderQueryKeys = {
  all: ['orders'] as const,
  list: (storeId: number) => [...orderQueryKeys.all, 'list', storeId] as const,
  detail: (storeId: number, orderId: number) =>
    [...orderQueryKeys.all, 'detail', storeId, orderId] as const,
  checkoutInfo: (storeId: number) =>
    [...orderQueryKeys.all, 'checkout-info', storeId] as const,
  deliveryFee: (storeId: number, addressId: number) =>
    [...orderQueryKeys.all, 'delivery-fee', storeId, addressId] as const,
  validId: (storeId: number) =>
    [...orderQueryKeys.all, 'valid-id', storeId] as const,
};

// ============== Hooks ==============

/**
 * Get valid order ID for checkout
 * Must be called before CheckoutOrder
 */
export function useGetValidOrderId() {
  const { apiClient, storeId } = useApiClient();

  return useMutation({
    mutationFn: async (): Promise<number> => {
      const url = buildUrl(API_ENDPOINTS.orders.getValidId, storeId);
      const response = await apiClient.get(url);
      console.log('[Order] Valid ID response:', response.data);
      // Handle wrapped response
      const data = response.data?.data || response.data;
      return Number(data);
    },
  });
}

/**
 * Get checkout info (pre-populated totals before checkout)
 */
export function useCheckoutInfo(enabled = true) {
  const { apiClient, storeId } = useApiClient();

  return useQuery<CheckoutInfo>({
    queryKey: orderQueryKeys.checkoutInfo(storeId),
    queryFn: async () => {
      const url = buildUrl(API_ENDPOINTS.orders.getCheckoutInfo, storeId);
      const response = await apiClient.get(url);
      console.log('[Order] Checkout info response:', response.data);
      const data = response.data?.data || response.data;
      return {
        subtotal: data.subtotal || data.subTotal || 0,
        discount: data.discount || 0,
        couponDiscount: data.couponDiscount || data.couponDisVal || 0,
        deliveryFee: data.deliveryFee || 0,
        total: data.total || data.finalAmount || 0,
        itemCount: data.itemCount || data.totalItems || 0,
      };
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Get delivery fee by address ID
 */
export function useDeliveryFee(addressId: number | null) {
  const { apiClient, storeId } = useApiClient();

  return useQuery<DeliveryFeeResponse>({
    queryKey: orderQueryKeys.deliveryFee(storeId, addressId || 0),
    queryFn: async () => {
      const url = buildUrl(API_ENDPOINTS.addresses.getDeliveryFee, storeId)
        .replace('{addressId}', String(addressId));
      const response = await apiClient.get(url);
      console.log('[Order] Delivery fee response:', response.data);
      const data = response.data?.data || response.data;
      return {
        deliveryFee: data.deliveryFee || data.fee || 0,
        freeDeliveryMinimum: data.freeDeliveryMinimum,
        isFreeDelivery: data.isFreeDelivery || false,
      };
    },
    enabled: !!addressId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

/**
 * Checkout - Create order from cart
 */
export function useCheckout() {
  const { apiClient, storeId } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CheckoutRequest): Promise<{ orderId: number; orderNumber?: string }> => {
      const url = buildUrl(API_ENDPOINTS.orders.checkout, storeId);
      console.log('[Order] Checkout request:', request);
      const response = await apiClient.post(url, request);
      console.log('[Order] Checkout response:', response.data);

      const data = response.data?.data || response.data;
      return {
        orderId: data.orderId || data.id || request.id,
        orderNumber: data.orderNumber || data.orderNo,
      };
    },
    onSuccess: () => {
      // Invalidate cart (it should be empty now) and orders list
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.all });
    },
  });
}

/**
 * Get my orders (order history)
 *
 * API Response Structure (from Profile Module Documentation):
 * - orderEznNo: Order number
 * - orderStatus: Order status (Pending, Confirmed, Processing, etc.)
 * - orderEznDate: Order date
 * - orderEznTime: Order time
 * - orderEznNetValue: Total amount
 * - itemDetails: Array of order items
 */
export function useMyOrders(enabled = true) {
  const { apiClient, storeId } = useApiClient();

  return useQuery<OrderSummary[]>({
    queryKey: orderQueryKeys.list(storeId),
    queryFn: async () => {
      const url = buildUrl(API_ENDPOINTS.orders.getMyOrders, storeId);
      const response = await apiClient.get(url);
      console.log('[Order] My orders raw response:', response.data);

      // API returns { result, data } structure
      const data = response.data?.data || response.data;
      console.log('[Order] Extracted data:', data);

      if (!Array.isArray(data)) {
        console.warn('[Order] Response data is not an array:', data);
        return [];
      }

      // Map API response to OrderSummary format
      const orders = data.map((order: any) => {
        // Get first item image from itemDetails array
        const firstItemImage = order.itemDetails?.[0]?.itemImageUrl || null;

        // Count items
        const itemCount = order.itemDetails?.length || 0;

        // Parse date and time from API
        // CRITICAL: API returns 24-hour time with Arabic AM/PM characters
        // orderEznDate: "2025-12-13"
        // orderEznTime: "17:37 م" (already 24-hour! م is decorative)
        // orderEznTime: "09:20 ص" (already 24-hour! ص is decorative)
        let createdAt = new Date().toISOString();

        if (order.orderEznDate) {
          try {
            // Parse ISO date format (2025-12-13)
            const dateObj = new Date(order.orderEznDate);

            if (!isNaN(dateObj.getTime())) {
              const dateStr = dateObj.toISOString().split('T')[0];

              // Parse time if provided
              if (order.orderEznTime) {
                // Remove Arabic AM/PM characters (they're decorative, time is already 24-hour)
                // "17:37 م" → "17:37"
                // "09:20 ص" → "09:20"
                const timeOnly = order.orderEznTime
                  .replace(/\s*[مص]\s*$/i, '')  // Remove م or ص
                  .trim();

                // Split time parts
                const timeParts = timeOnly.split(':');
                if (timeParts.length >= 2) {
                  const hours = timeParts[0].padStart(2, '0');
                  const minutes = timeParts[1].padStart(2, '0');
                  const seconds = timeParts[2] || '00';

                  // Add 'Z' suffix to make it a valid ISO 8601 UTC string
                  createdAt = `${dateStr}T${hours}:${minutes}:${seconds}Z`;
                } else {
                  // Fallback to just the date
                  createdAt = dateObj.toISOString();
                }
              } else {
                createdAt = dateObj.toISOString();
              }
            }
          } catch (error) {
            console.warn('[Order] Failed to parse date:', order.orderEznDate, order.orderEznTime, error);
          }
        }

        return {
          id: order.id || 0,
          orderNumber: order.orderEznNo ? `#${order.orderEznNo}` : `#${order.id}`,
          status: order.orderStatus || 'Pending',
          itemCount,
          total: order.orderEznNetValue || 0,
          createdAt,
          firstItemImage,
        };
      });

      console.log('[Order] Mapped orders:', orders);
      return orders;
    },
    enabled,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Get order details by ID
 *
 * API Response Structure (from Profile Module Documentation):
 * - orderEznNo: Order number
 * - orderStatus: Order status
 * - orderEznDate, orderEznTime: Date and time
 * - itemDetails: Array of items
 * - orderEznNetValue: Total amount
 * - orderEznTotal, orderEznTotalVatValue, orderEznTotalTaxValue: Price breakdown
 * - couponDisVal: Coupon discount
 * - deliveryFee: Delivery fee
 * - orderTipVal: Tip amount
 */
export function useOrderDetails(orderId: number | null) {
  const { apiClient, storeId } = useApiClient();

  return useQuery<Order>({
    queryKey: orderQueryKeys.detail(storeId, orderId || 0),
    queryFn: async () => {
      const url = buildUrl(API_ENDPOINTS.orders.getDetails, storeId)
        .replace('{orderId}', String(orderId));
      const response = await apiClient.get(url);
      console.log('[Order] Order details raw response:', response.data);

      // API returns { result, data } structure
      const data = response.data?.data || response.data;
      console.log('[Order] Extracted order details:', data);

      // Map itemDetails array
      // IMPORTANT: API uses different field names than documentation:
      // - eznItemName (not itemNameEN/itemNameAR)
      // - imageURL (not itemImageUrl)
      // - eznItemAmount (not orderDetQty)
      // - eznItemPrice (not unitPrice)
      // - eznItemTotal (not orderDetTotal)
      const items = (data.itemDetails || []).map((item: any) => {
        // Determine best image to use (prefer imageURL, fallback to unit-specific images)
        const image = item.imageURL || item.itemImageForBigUnitUrl || item.itemImageForSmallUnitUrl || '';

        return {
          id: item.id || 0,
          itemId: item.itemId || 0,
          name: item.eznItemName || 'Item',
          nameAr: item.eznItemName || 'منتج',
          image,
          quantity: item.eznItemAmount || 1,
          unitPrice: item.eznItemPrice || 0,
          totalPrice: item.eznItemTotal || 0,
          unitName: item.itemUnit?.nameEN || '',
          unitNameAr: item.itemUnit?.nameAR || '',
          flavorName: undefined,
          flavorNameAr: undefined,
        };
      });

      // Combine date and time
      // API returns time in 24-hour format with Arabic decorative characters
      // orderEznDate: "2025-12-13"
      // orderEznTime: "17:37 م" (already 24-hour! م is decorative)
      let createdAt = new Date().toISOString();

      if (data.orderEznDate) {
        try {
          const dateObj = new Date(data.orderEznDate);
          if (!isNaN(dateObj.getTime())) {
            const dateStr = dateObj.toISOString().split('T')[0];

            if (data.orderEznTime) {
              // Remove Arabic AM/PM characters (decorative, time is already 24-hour)
              const timeOnly = data.orderEznTime.replace(/\s*[مص]\s*$/i, '').trim();
              const timeParts = timeOnly.split(':');

              if (timeParts.length >= 2) {
                const hours = timeParts[0].padStart(2, '0');
                const minutes = timeParts[1].padStart(2, '0');
                const seconds = timeParts[2] || '00';
                createdAt = `${dateStr}T${hours}:${minutes}:${seconds}Z`;
              } else {
                createdAt = dateObj.toISOString();
              }
            } else {
              createdAt = dateObj.toISOString();
            }
          }
        } catch (error) {
          console.warn('[Order] Failed to parse date:', data.orderEznDate, data.orderEznTime, error);
        }
      }

      return {
        id: data.id || 0,
        orderNumber: data.orderEznNo ? `#${data.orderEznNo}` : `#${data.id}`,
        status: data.orderStatus || 'Pending',
        statusHistory: [], // Not provided in current API
        items,
        itemCount: items.length,
        subtotal: data.orderEznTotal || 0,
        discount: data.orderEznTotalOfferDisValue || 0,
        couponDiscount: data.couponDisVal || 0,
        deliveryFee: data.deliveryFeeInfo?.deliveryFee || data.deliveryFee || 0,
        tip: data.orderTipVal || 0,
        total: data.orderEznNetValue || 0,
        paymentMethod: data.paymentMethod || 'CashOnDelivery',
        isPaid: data.paymentStatus === 'Paid',
        address: data.address ? {
          id: data.address.id || 0,
          addressTitle: data.address.addressName || 'Delivery Address',
          fullAddress: [
            data.address.street,
            data.address.apartment ? `Apt ${data.address.apartment}` : null,
            data.address.buildingNo ? `Building ${data.address.buildingNo}` : null,
            data.address.floorNo ? `Floor ${data.address.floorNo}` : null,
            data.address.areaName,
            data.address.cityName,
          ].filter(Boolean).join(', '),
          city: data.address.cityName,
          governorate: data.address.cityName,
          latitude: parseFloat(data.address.locationLat || '0'),
          longitude: parseFloat(data.address.locationLong || '0'),
          buildingNumber: data.address.buildingNo,
          floorNumber: data.address.floorNo,
          apartmentNumber: data.address.apartment,
          landmark: data.address.famousSign || data.address.deliveryNotes,
        } : undefined,
        estimatedDeliveryTime: data.remainingTimeInMinutes ? `${data.remainingTimeInMinutes} minutes` : undefined,
        actualDeliveryTime: undefined,
        note: data.orderEznMemo || '',
        rating: data.orderRating,
        review: undefined,
        createdAt,
        updatedAt: createdAt,
        deliveryBoyName: data.deliveryBoyName,
      };
    },
    enabled: !!orderId,
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Leave tip after order
 */
export function useLeaveTip() {
  const { apiClient, storeId } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: LeaveTipRequest): Promise<{ success: boolean }> => {
      const url = buildUrl(API_ENDPOINTS.orders.leaveTip, storeId);
      console.log('[Order] Leave tip request:', request);
      const response = await apiClient.post(url, {
        orderId: request.orderId,
        tip: request.tipAmount,
      });
      console.log('[Order] Leave tip response:', response.data);
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: orderQueryKeys.detail(storeId, variables.orderId),
      });
    },
  });
}

/**
 * Rate order
 */
export function useRateOrder() {
  const { apiClient, storeId } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: RateOrderRequest): Promise<{ success: boolean }> => {
      const url = buildUrl(API_ENDPOINTS.orders.rate, storeId);
      console.log('[Order] Rate order request:', request);
      const response = await apiClient.post(url, request);
      console.log('[Order] Rate order response:', response.data);
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: orderQueryKeys.detail(storeId, variables.orderId),
      });
    },
  });
}

/**
 * Cancel order
 */
export function useCancelOrder() {
  const { apiClient, storeId } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: number): Promise<{ success: boolean }> => {
      const url = buildUrl(API_ENDPOINTS.orders.cancel, storeId)
        .replace('{orderId}', String(orderId));
      console.log('[Order] Cancel order:', orderId);
      const response = await apiClient.post(url, {});
      console.log('[Order] Cancel response:', response.data);
      return { success: true };
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.all });
    },
  });
}

/**
 * Get replacement items for an order
 */
export function useReplacementItems(orderId: number | null) {
  const { apiClient, storeId } = useApiClient();

  return useQuery({
    queryKey: [...orderQueryKeys.detail(storeId, orderId || 0), 'replacements'],
    queryFn: async () => {
      const url = buildUrl(API_ENDPOINTS.orders.getReplacementItems, storeId)
        .replace('{orderId}', String(orderId));
      const response = await apiClient.get(url);
      console.log('[Order] Replacement items response:', response.data);
      return response.data?.data || response.data || [];
    },
    enabled: !!orderId,
    staleTime: 60 * 1000,
  });
}

/**
 * Replace item in order
 */
export function useReplaceItem() {
  const { apiClient, storeId } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: {
      orderId: number;
      oldItemId: number;
      newItemId: number;
      quantity: number;
    }): Promise<{ success: boolean }> => {
      const url = buildUrl(API_ENDPOINTS.orders.replaceItem, storeId)
        .replace('{orderId}', String(request.orderId));
      console.log('[Order] Replace item request:', request);
      const response = await apiClient.post(url, request);
      console.log('[Order] Replace item response:', response.data);
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: orderQueryKeys.detail(storeId, variables.orderId),
      });
    },
  });
}

/**
 * Remove item from order
 */
export function useRemoveOrderItem() {
  const { apiClient, storeId } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: {
      orderId: number;
      itemId: number;
    }): Promise<{ success: boolean }> => {
      const url = buildUrl(API_ENDPOINTS.orders.removeItem, storeId)
        .replace('{orderId}', String(request.orderId));
      console.log('[Order] Remove item request:', request);
      const response = await apiClient.post(url, { itemId: request.itemId });
      console.log('[Order] Remove item response:', response.data);
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: orderQueryKeys.detail(storeId, variables.orderId),
      });
    },
  });
}
