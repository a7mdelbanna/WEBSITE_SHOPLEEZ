'use client';

/**
 * Address Service
 *
 * React Query hooks for address management matching Flutter app flow:
 * - Get cities list
 * - Get areas by city
 * - Create address (by area)
 * - Confirm address location (with lat/lng)
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/provider';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { buildUrl } from '@/lib/api/client';

// ============== Types ==============

export interface City {
  id: number;
  name: string;
  nameEn?: string;
  nameAr?: string;
}

export interface Area {
  id: number;
  name: string;
  nameEn?: string;
  nameAr?: string;
  cityId?: number;
}

export interface AddAddressRequest {
  addressName: string;
  cityId: string;
  areaId: string;
  street: string;
  detailedAddress: string;
  building?: string;
  floor?: string;
  apartment?: string;
  isForMe: boolean;
  deliveryNotes?: string;
  name?: string;
  lastName?: string;
  phone?: string;
}

export interface ConfirmLocationRequest {
  addressId: number;
  locationLat: string;
  locationLong: string;
  address?: string;
}

export interface Address {
  id: number;
  addressName: string;
  cityId: number;
  cityName?: string;
  areaId: number;
  areaName?: string;
  street?: string;
  detailedAddress?: string;
  building?: string;
  floor?: string;
  apartment?: string;
  locationLat?: string;
  locationLong?: string;
  isConfirmed?: boolean;
}

// ============== Hooks ==============

/**
 * Get all cities
 */
export function useCities() {
  const { apiClient, storeId } = useApiClient();

  return useQuery({
    queryKey: ['cities', storeId],
    queryFn: async (): Promise<City[]> => {
      const url = buildUrl(API_ENDPOINTS.location.getCities, storeId);
      const response = await apiClient.get(url);
      console.log('[Address] Cities response:', response.data);
      // Handle both wrapped and unwrapped response
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
}

/**
 * Get areas by city ID
 */
export function useAreas(cityId: number | null) {
  const { apiClient, storeId } = useApiClient();

  return useQuery({
    queryKey: ['areas', storeId, cityId],
    queryFn: async (): Promise<Area[]> => {
      const baseUrl = buildUrl(API_ENDPOINTS.location.getAreas, storeId);
      const url = cityId ? `${baseUrl}?placeId=${cityId}` : baseUrl;
      const response = await apiClient.get(url);
      console.log('[Address] Areas response:', response.data);
      // Handle both wrapped and unwrapped response
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    },
    enabled: !!cityId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Get all user addresses
 */
export function useMyAddresses() {
  const { apiClient, storeId } = useApiClient();

  return useQuery({
    queryKey: ['addresses', storeId],
    queryFn: async (): Promise<Address[]> => {
      const url = buildUrl(API_ENDPOINTS.addresses.getAll, storeId);
      const response = await apiClient.get(url);
      console.log('[Address] My addresses response:', response.data);
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get valid address ID (for creating new address)
 */
export function useGetValidAddressId() {
  const { apiClient, storeId } = useApiClient();

  return useMutation({
    mutationFn: async (): Promise<number> => {
      const url = buildUrl(API_ENDPOINTS.addresses.getValidId, storeId);
      const response = await apiClient.get(url);
      console.log('[Address] Valid ID response:', response.data);
      return Number(response.data?.data || response.data);
    },
  });
}

/**
 * Create customer address by area
 */
export function useCreateAddress() {
  const { apiClient, storeId } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddAddressRequest): Promise<{ addressId: number; message?: string }> => {
      const url = buildUrl(API_ENDPOINTS.addresses.createByArea, storeId);
      console.log('[Address] Creating address:', data);
      const response = await apiClient.post(url, data);
      console.log('[Address] Create response:', response.data);

      // Extract addressId from response
      const responseData = response.data?.data || response.data;
      const addressId = responseData?.addressId || responseData?.id || responseData;

      return {
        addressId: Number(addressId),
        message: response.data?.result?.message,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

/**
 * Confirm address location with lat/lng
 */
export function useConfirmLocation() {
  const { apiClient, storeId } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ConfirmLocationRequest): Promise<{ success: boolean; message?: string }> => {
      const url = buildUrl(API_ENDPOINTS.addresses.confirmLocation, storeId);
      console.log('[Address] Confirming location:', data);
      const response = await apiClient.post(url, data);
      console.log('[Address] Confirm response:', response.data);

      return {
        success: true,
        message: response.data?.result?.message || 'Location confirmed',
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

/**
 * Delete an address
 */
export function useDeleteAddress() {
  const { apiClient, storeId } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressId: number): Promise<{ success: boolean }> => {
      const url = buildUrl(API_ENDPOINTS.addresses.delete, storeId).replace('{addressId}', String(addressId));
      const response = await apiClient.delete(url);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}
