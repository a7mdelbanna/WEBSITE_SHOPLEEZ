'use client';

/**
 * Address Service
 *
 * React Query hooks for address management matching Flutter app flow EXACTLY:
 * - Get cities list
 * - Get areas by city
 * - Create address (4 endpoints based on mode + user type)
 * - Confirm address location (with lat/lng)
 *
 * Modes (from store settings deliveryFeeType):
 * - ByArea: City/Area dropdowns
 * - ByDistance: City/Area text inputs
 *
 * User Types:
 * - Customer: Has building/floor/apartment fields
 * - Shop: Has detailed address only
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/provider';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { buildUrl } from '@/lib/api/client';

// ============== Types ==============

export type AddressMode = 'ByArea' | 'ByDistance';
export type UserType = 'Customer' | 'Shop';

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

/**
 * Request body for creating address
 * Fields are included conditionally based on mode and user type
 */
export interface AddAddressRequest {
  // Required fields
  addressName: string;
  cityId: string;
  areaId: string;
  street: string;
  isForMe: boolean;
  // Optional fields
  detailedAddress?: string;
  deliveryNotes?: string;
  // Customer-only fields (building, floor, apartment)
  building?: string;
  floor?: string;
  apartment?: string;
  // "For Someone Else" recipient fields (when isForMe = false)
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
 * Helper to build request body based on mode
 * ByArea uses: areaId, cityId (numeric IDs from dropdown selection)
 * ByDistance uses: areaName, cityName (can be text strings from text input)
 */
function buildAddressRequestBody(
  data: AddAddressRequest,
  addressId: number,
  mode: AddressMode,
  userType: UserType
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    id: addressId,
    addressName: data.addressName,
    street: data.street,
    detailedAddress: data.detailedAddress || '',
    deliveryNotes: data.deliveryNotes || '',
    isForMe: data.isForMe,
  };

  // City/Area fields differ by mode
  if (mode === 'ByArea') {
    // ByArea mode: parse IDs from stringified numbers (e.g., "45" -> 45)
    base.cityId = parseInt(data.cityId, 10);
    base.areaId = parseInt(data.areaId, 10);
  } else {
    // ByDistance mode: can be either numeric IDs or text strings
    // Check if values are numeric, otherwise send as text
    const cityValue = parseInt(data.cityId, 10);
    const areaValue = parseInt(data.areaId, 10);
    base.cityName = isNaN(cityValue) ? data.cityId : cityValue;
    base.areaName = isNaN(areaValue) ? data.areaId : areaValue;
  }

  // Customer-only fields
  if (userType === 'Customer') {
    base.building = data.building || '';
    base.floor = data.floor || '';
    base.apartment = data.apartment || '';
  }

  // Recipient fields (when not for me)
  if (!data.isForMe) {
    base.name = data.name || '';
    base.lastName = data.lastName || '';
    base.phone = data.phone || '';
  }

  return base;
}

/**
 * Get the correct endpoint based on mode and user type
 */
function getCreateAddressEndpoint(mode: AddressMode, userType: UserType): string {
  if (userType === 'Customer') {
    return mode === 'ByArea'
      ? API_ENDPOINTS.addresses.createByArea
      : API_ENDPOINTS.addresses.createByDistance;
  } else {
    return mode === 'ByArea'
      ? API_ENDPOINTS.addresses.createShopByArea
      : API_ENDPOINTS.addresses.createShopByDistance;
  }
}

/**
 * Create Customer Address by Area
 */
export function useCreateCustomerAddressByArea() {
  const { apiClient, storeId } = useApiClient();
  const queryClient = useQueryClient();
  const getValidId = useGetValidAddressId();

  return useMutation({
    mutationFn: async (data: AddAddressRequest): Promise<{ addressId: number; message?: string }> => {
      // Get valid address ID first
      const addressId = await getValidId.mutateAsync();
      const url = buildUrl(API_ENDPOINTS.addresses.createByArea, storeId);
      const body = buildAddressRequestBody(data, addressId, 'ByArea', 'Customer');

      console.log('[Address] Creating customer address (ByArea):', body);
      const response = await apiClient.post(url, body);
      console.log('[Address] Create response:', response.data);

      return {
        addressId,
        message: response.data?.result?.message,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

/**
 * Create Customer Address by Distance
 */
export function useCreateCustomerAddressByDistance() {
  const { apiClient, storeId } = useApiClient();
  const queryClient = useQueryClient();
  const getValidId = useGetValidAddressId();

  return useMutation({
    mutationFn: async (data: AddAddressRequest): Promise<{ addressId: number; message?: string }> => {
      const addressId = await getValidId.mutateAsync();
      const url = buildUrl(API_ENDPOINTS.addresses.createByDistance, storeId);
      const body = buildAddressRequestBody(data, addressId, 'ByDistance', 'Customer');

      console.log('[Address] Creating customer address (ByDistance):', body);
      const response = await apiClient.post(url, body);
      console.log('[Address] Create response:', response.data);

      return {
        addressId,
        message: response.data?.result?.message,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

/**
 * Create Shop Address by Area
 */
export function useCreateShopAddressByArea() {
  const { apiClient, storeId } = useApiClient();
  const queryClient = useQueryClient();
  const getValidId = useGetValidAddressId();

  return useMutation({
    mutationFn: async (data: AddAddressRequest): Promise<{ addressId: number; message?: string }> => {
      const addressId = await getValidId.mutateAsync();
      const url = buildUrl(API_ENDPOINTS.addresses.createShopByArea, storeId);
      const body = buildAddressRequestBody(data, addressId, 'ByArea', 'Shop');

      console.log('[Address] Creating shop address (ByArea):', body);
      const response = await apiClient.post(url, body);
      console.log('[Address] Create response:', response.data);

      return {
        addressId,
        message: response.data?.result?.message,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

/**
 * Create Shop Address by Distance
 */
export function useCreateShopAddressByDistance() {
  const { apiClient, storeId } = useApiClient();
  const queryClient = useQueryClient();
  const getValidId = useGetValidAddressId();

  return useMutation({
    mutationFn: async (data: AddAddressRequest): Promise<{ addressId: number; message?: string }> => {
      const addressId = await getValidId.mutateAsync();
      const url = buildUrl(API_ENDPOINTS.addresses.createShopByDistance, storeId);
      const body = buildAddressRequestBody(data, addressId, 'ByDistance', 'Shop');

      console.log('[Address] Creating shop address (ByDistance):', body);
      const response = await apiClient.post(url, body);
      console.log('[Address] Create response:', response.data);

      return {
        addressId,
        message: response.data?.result?.message,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

/**
 * Legacy: Create address (uses customer + ByArea by default)
 * @deprecated Use useCreateCustomerAddressByArea, useCreateCustomerAddressByDistance, etc.
 */
export function useCreateAddress() {
  return useCreateCustomerAddressByArea();
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
