'use client';

/**
 * Products Service
 *
 * React Query hooks for product data fetching.
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/provider';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { Product, ProductSummary, ProductFilters } from '@/types/product';

/**
 * Query keys for products
 */
export const productQueryKeys = {
  all: ['products'] as const,
  lists: () => [...productQueryKeys.all, 'list'] as const,
  list: (storeId: number, filters?: ProductFilters) =>
    [...productQueryKeys.lists(), storeId, filters] as const,
  details: () => [...productQueryKeys.all, 'detail'] as const,
  detail: (storeId: number, itemId: number) =>
    [...productQueryKeys.details(), storeId, itemId] as const,
  related: (storeId: number, itemId: number) =>
    [...productQueryKeys.all, 'related', storeId, itemId] as const,
  byBarcode: (storeId: number, barcode: string) =>
    [...productQueryKeys.all, 'barcode', storeId, barcode] as const,
  byCategory: (storeId: number, categoryId: number, filters?: ProductFilters) =>
    [...productQueryKeys.all, 'category', storeId, categoryId, filters] as const,
};

/**
 * Paginated response type
 */
interface PaginatedProducts {
  items: ProductSummary[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Fetch products with filters and pagination
 */
export function useProducts(filters?: ProductFilters) {
  const { apiClient, storeId, buildEndpoint } = useApiClient();

  return useInfiniteQuery<PaginatedProducts>({
    queryKey: productQueryKeys.list(storeId, filters),
    queryFn: async ({ pageParam = 1 }) => {
      const url = buildEndpoint(API_ENDPOINTS.products.getAll);
      const { data } = await apiClient.get(url, {
        params: {
          ...filters,
          pageNumber: pageParam,
          pageSize: filters?.pageSize || 20,
        },
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch a single product by ID
 */
export function useProductById(itemId: number, enabled = true) {
  const { apiClient, storeId, buildEndpoint } = useApiClient();

  return useQuery<Product>({
    queryKey: productQueryKeys.detail(storeId, itemId),
    queryFn: async () => {
      const url = buildEndpoint(API_ENDPOINTS.products.getById, { itemId });
      const { data } = await apiClient.get(url);
      return data;
    },
    enabled: enabled && itemId > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch related products for an item
 */
export function useRelatedProducts(itemId: number, enabled = true) {
  const { apiClient, storeId, buildEndpoint } = useApiClient();

  return useQuery<ProductSummary[]>({
    queryKey: productQueryKeys.related(storeId, itemId),
    queryFn: async () => {
      const url = buildEndpoint(API_ENDPOINTS.products.getRelated, { itemId });
      const { data } = await apiClient.get(url);
      return data;
    },
    enabled: enabled && itemId > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

/**
 * Fetch product by barcode
 */
export function useProductByBarcode(barcode: string, enabled = true) {
  const { apiClient, storeId, buildEndpoint } = useApiClient();

  return useQuery<Product>({
    queryKey: productQueryKeys.byBarcode(storeId, barcode),
    queryFn: async () => {
      const url = buildEndpoint(API_ENDPOINTS.products.getByBarcode, { barcode });
      const { data } = await apiClient.get(url);
      return data;
    },
    enabled: enabled && barcode.length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch products by category with pagination
 */
export function useProductsByCategory(
  categoryId: number,
  filters?: Omit<ProductFilters, 'categoryId'>,
  enabled = true
) {
  const { apiClient, storeId, buildEndpoint } = useApiClient();

  return useInfiniteQuery<PaginatedProducts>({
    queryKey: productQueryKeys.byCategory(storeId, categoryId, filters),
    queryFn: async ({ pageParam = 1 }) => {
      const url = buildEndpoint(API_ENDPOINTS.products.getByCategory, { categoryId });
      const { data } = await apiClient.get(url, {
        params: {
          ...filters,
          pageNumber: pageParam,
          pageSize: filters?.pageSize || 20,
        },
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined,
    enabled: enabled && categoryId > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Simple products fetch (non-paginated) - useful for limited lists
 */
export function useProductsSimple(filters?: ProductFilters, enabled = true) {
  const { apiClient, storeId, buildEndpoint } = useApiClient();

  return useQuery<ProductSummary[]>({
    queryKey: [...productQueryKeys.list(storeId, filters), 'simple'],
    queryFn: async () => {
      const url = buildEndpoint(API_ENDPOINTS.products.getAll);
      const { data } = await apiClient.get(url, {
        params: {
          ...filters,
          pageNumber: 1,
          pageSize: filters?.pageSize || 20,
        },
      });
      // Return just items if paginated, or data directly if array
      return Array.isArray(data) ? data : data.items || [];
    },
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
