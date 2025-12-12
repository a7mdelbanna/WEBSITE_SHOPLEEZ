'use client';

/**
 * Store Settings Service
 *
 * React Query hooks for store settings data fetching.
 * These settings control various app behaviors including:
 * - Filter display (requireCompanyForItem, requireSubCategoryForItem)
 * - Feature flags (enableDeliveryTips, enableOTPAuthentication)
 * - Store configuration (minimumOrderAmount, deliveryTimeMinutes, etc.)
 */

import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/provider';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

/**
 * Store Settings interface based on API response
 */
export interface StoreSettings {
  storeId: number;
  storeName: string;
  storeNameAr: string;
  enableDeliveryTips: boolean;
  enableOTPAuthentication: boolean;
  requireCompanyForItem: boolean;
  requireSubCategoryForItem: boolean;
  appMode: 'WholeSale' | 'Retail' | 'Both';
  isInventoryTracked: boolean;
  minimumOrderAmount: number;
  deliveryTimeMinutes: number;
  workingHoursStart: string;
  workingHoursEnd: string;
  isOpen: boolean;
  // Address creation mode: ByArea = dropdowns, ByDistance = text inputs
  deliveryFeeType: 'ByArea' | 'ByDistance';
}

/**
 * Query keys for store settings
 */
export const storeSettingsQueryKeys = {
  all: ['storeSettings'] as const,
  byStore: (storeId: number) => [...storeSettingsQueryKeys.all, storeId] as const,
};

/**
 * Fetch store settings
 * Returns settings that control app behavior including filter display
 */
export function useStoreSettings() {
  const { apiClient, storeId, buildEndpoint } = useApiClient();

  return useQuery<StoreSettings>({
    queryKey: storeSettingsQueryKeys.byStore(storeId),
    queryFn: async () => {
      const url = buildEndpoint(API_ENDPOINTS.store.getSettings);
      const { data } = await apiClient.get(url);
      // API returns { result: {...}, data: {...} } - extract the settings object
      const settings = data.data || data;

      return {
        storeId: settings.storeId ?? storeId,
        storeName: settings.storeName || settings.nameEn || '',
        storeNameAr: settings.storeNameAr || settings.nameAr || '',
        enableDeliveryTips: settings.enableDeliveryTips ?? false,
        enableOTPAuthentication: settings.enableOTPAuthentication ?? true,
        requireCompanyForItem: settings.requireCompanyForItem ?? false,
        requireSubCategoryForItem: settings.requireSubCategoryForItem ?? false,
        appMode: settings.appMode || 'Retail',
        isInventoryTracked: settings.isInventoryTracked ?? false,
        minimumOrderAmount: settings.minimumOrderAmount ?? 0,
        deliveryTimeMinutes: settings.deliveryTimeMinutes ?? 30,
        workingHoursStart: settings.workingHoursStart || '08:00',
        workingHoursEnd: settings.workingHoursEnd || '22:00',
        isOpen: settings.isOpen ?? true,
        // Address mode: ByArea = dropdowns, ByDistance = text inputs (default to ByArea)
        deliveryFeeType: settings.deliveryFeeType === 'ByDistance' ? 'ByDistance' : 'ByArea',
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - settings don't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
