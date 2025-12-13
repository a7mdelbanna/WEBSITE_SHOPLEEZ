'use client';

/**
 * Favorites Service
 *
 * React Query hooks for managing user favorites:
 * - Get all favorites
 * - Add item to favorites
 * - Remove item from favorites
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/provider';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { buildUrl, getTokens } from '@/lib/api/client';
import type { FavoritesModel } from '@/types/profile';

// ============================================================================
// Query Keys
// ============================================================================

export const favoritesQueryKeys = {
  all: ['favorites'] as const,
  list: (storeId: number) => [...favoritesQueryKeys.all, 'list', storeId] as const,
};

// ============================================================================
// Get Favorites
// ============================================================================

/**
 * Get all user favorite items
 */
export function useFavorites() {
  const { apiClient, storeId } = useApiClient();
  const { accessToken } = getTokens();

  return useQuery({
    queryKey: favoritesQueryKeys.list(storeId),
    queryFn: async (): Promise<FavoritesModel> => {
      const url = buildUrl(API_ENDPOINTS.favorites.getAll, storeId);
      const response = await apiClient.get(url);
      return response.data;
    },
    enabled: !!accessToken,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ============================================================================
// Add to Favorites
// ============================================================================

/**
 * Add an item to favorites
 */
export function useAddToFavorites() {
  const { apiClient, storeId } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: number): Promise<{ result?: { code?: number; message?: string } }> => {
      // Replace {itemId} in the URL
      const endpoint = API_ENDPOINTS.favorites.add.replace('{itemId}', String(itemId));
      const url = buildUrl(endpoint, storeId);
      const response = await apiClient.post(url);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate favorites list to refresh
      queryClient.invalidateQueries({ queryKey: favoritesQueryKeys.all });
    },
  });
}

// ============================================================================
// Remove from Favorites
// ============================================================================

/**
 * Remove an item from favorites
 */
export function useRemoveFromFavorites() {
  const { apiClient, storeId } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: number): Promise<{ result?: { code?: number; message?: string } }> => {
      // Replace {itemId} in the URL
      const endpoint = API_ENDPOINTS.favorites.remove.replace('{itemId}', String(itemId));
      const url = buildUrl(endpoint, storeId);
      const response = await apiClient.delete(url);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate favorites list to refresh
      queryClient.invalidateQueries({ queryKey: favoritesQueryKeys.all });
    },
  });
}

// ============================================================================
// Toggle Favorite
// ============================================================================

/**
 * Toggle favorite status of an item
 * Returns true if item was added, false if removed
 */
export function useToggleFavorite() {
  const addMutation = useAddToFavorites();
  const removeMutation = useRemoveFromFavorites();

  return {
    toggle: async (itemId: number, isFavorite: boolean): Promise<boolean> => {
      if (isFavorite) {
        await removeMutation.mutateAsync(itemId);
        return false;
      } else {
        await addMutation.mutateAsync(itemId);
        return true;
      }
    },
    isPending: addMutation.isPending || removeMutation.isPending,
  };
}
