'use client';

/**
 * Profile Service
 *
 * React Query hooks for profile-related data:
 * - Wallet balance
 * - Transaction history
 * - Store settings (for referral)
 *
 * Note: useProfile, useChangePassword, useDeleteAccount are in auth.ts
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/provider';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { buildUrl, getTokens } from '@/lib/api/client';
import type {
  WalletModel,
  TransactionsHistoryModel,
  ReferralSettings,
} from '@/types/profile';

// ============================================================================
// Query Keys
// ============================================================================

export const profileQueryKeys = {
  all: ['profile'] as const,
  wallet: (storeId: number) => [...profileQueryKeys.all, 'wallet', storeId] as const,
  transactions: (storeId: number) => [...profileQueryKeys.all, 'transactions', storeId] as const,
  storeSettings: (storeId: number) => [...profileQueryKeys.all, 'storeSettings', storeId] as const,
};

// ============================================================================
// Wallet
// ============================================================================

/**
 * Get user wallet balance
 */
export function useWallet() {
  const { apiClient, storeId } = useApiClient();
  const { accessToken } = getTokens();

  return useQuery({
    queryKey: profileQueryKeys.wallet(storeId),
    queryFn: async (): Promise<WalletModel> => {
      const url = buildUrl(API_ENDPOINTS.wallet.get, storeId);
      const response = await apiClient.get(url);
      return response.data;
    },
    enabled: !!accessToken,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ============================================================================
// Transaction History
// ============================================================================

/**
 * Get wallet transaction history
 */
export function useTransactionHistory() {
  const { apiClient, storeId } = useApiClient();
  const { accessToken } = getTokens();

  return useQuery({
    queryKey: profileQueryKeys.transactions(storeId),
    queryFn: async (): Promise<TransactionsHistoryModel> => {
      const url = buildUrl(API_ENDPOINTS.wallet.getTransactionHistory, storeId);
      const response = await apiClient.get(url);
      return response.data;
    },
    enabled: !!accessToken,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// ============================================================================
// Store Settings (for Referral)
// ============================================================================

/**
 * Get store settings including referral configuration
 */
export function useStoreSettings() {
  const { apiClient, storeId } = useApiClient();

  return useQuery({
    queryKey: profileQueryKeys.storeSettings(storeId),
    queryFn: async (): Promise<{ data?: ReferralSettings }> => {
      const url = buildUrl(API_ENDPOINTS.store.getSettings, storeId);
      const response = await apiClient.get(url);
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ============================================================================
// Referral
// ============================================================================

/**
 * Activate user's referral code
 */
export function useActivateReferral() {
  const { apiClient, storeId } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<{ result?: { code?: number; message?: string } }> => {
      const url = buildUrl(API_ENDPOINTS.referrals.activate, storeId);
      const response = await apiClient.post(url);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate profile to refresh referral code status
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
