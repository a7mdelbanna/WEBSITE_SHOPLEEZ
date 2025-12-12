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
 */
export function useMyOrders(enabled = true) {
  const { apiClient, storeId } = useApiClient();

  return useQuery<OrderSummary[]>({
    queryKey: orderQueryKeys.list(storeId),
    queryFn: async () => {
      const url = buildUrl(API_ENDPOINTS.orders.getMyOrders, storeId);
      const response = await apiClient.get(url);
      console.log('[Order] My orders response:', response.data);
      const data = response.data?.data || response.data;

      if (!Array.isArray(data)) return [];

      return data.map((order: any) => ({
        id: order.id || order.orderId,
        orderNumber: order.orderNumber || order.orderNo || `#${order.id}`,
        status: order.status || order.orderStatus || 'Pending',
        itemCount: order.itemCount || order.totalItems || order.items?.length || 0,
        total: order.total || order.finalAmount || order.totalAmount || 0,
        createdAt: order.createdAt || order.orderDate || order.dateCreated,
        firstItemImage: order.firstItemImage || order.items?.[0]?.image,
      }));
    },
    enabled,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Get order details by ID
 */
export function useOrderDetails(orderId: number | null) {
  const { apiClient, storeId } = useApiClient();

  return useQuery<Order>({
    queryKey: orderQueryKeys.detail(storeId, orderId || 0),
    queryFn: async () => {
      const url = buildUrl(API_ENDPOINTS.orders.getDetails, storeId)
        .replace('{orderId}', String(orderId));
      const response = await apiClient.get(url);
      console.log('[Order] Order details response:', response.data);
      const data = response.data?.data || response.data;

      return {
        id: data.id || data.orderId,
        orderNumber: data.orderNumber || data.orderNo || `#${data.id}`,
        status: data.status || data.orderStatus || 'Pending',
        statusHistory: data.statusHistory || [],
        items: (data.items || data.orderItems || []).map((item: any) => ({
          id: item.id,
          itemId: item.itemId,
          name: item.name || item.nameEn || item.itemName,
          nameAr: item.nameAr || item.itemNameAr,
          image: item.image || item.imageUrl || item.mainImage,
          quantity: item.quantity || item.qty,
          unitPrice: item.unitPrice || item.price,
          totalPrice: item.totalPrice || item.total || (item.unitPrice * item.quantity),
          unitName: item.unitName || item.unitNameEn,
          unitNameAr: item.unitNameAr,
          flavorName: item.flavorName || item.flavourName,
          flavorNameAr: item.flavorNameAr || item.flavourNameAr,
        })),
        itemCount: data.itemCount || data.totalItems || data.items?.length || 0,
        subtotal: data.subtotal || data.subTotal || 0,
        discount: data.discount || 0,
        couponDiscount: data.couponDiscount || data.couponDisVal || 0,
        deliveryFee: data.deliveryFee || 0,
        tip: data.tip || data.orderTipVal || 0,
        total: data.total || data.finalAmount || 0,
        paymentMethod: data.paymentMethod === 3 ? 'CashOnDelivery' : (data.paymentMethodName || 'CashOnDelivery'),
        isPaid: data.isPaid || false,
        address: data.address || {
          id: data.addressId,
          addressTitle: data.addressName || 'Delivery Address',
          fullAddress: data.fullAddress || data.addressDetails,
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
        },
        estimatedDeliveryTime: data.estimatedDeliveryTime,
        actualDeliveryTime: data.actualDeliveryTime,
        note: data.note || data.orderEznMemo,
        rating: data.rating,
        review: data.review,
        createdAt: data.createdAt || data.orderDate,
        updatedAt: data.updatedAt || data.lastModified,
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
