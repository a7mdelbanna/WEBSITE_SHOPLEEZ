'use client';

/**
 * Categories Service
 *
 * React Query hooks for category data fetching.
 */

import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/provider';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { Category, SubCategory, Company } from '@/types/category';

/**
 * Query keys for categories
 */
export const categoryQueryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryQueryKeys.all, 'list'] as const,
  list: (storeId: number) => [...categoryQueryKeys.lists(), storeId] as const,
  details: () => [...categoryQueryKeys.all, 'detail'] as const,
  detail: (storeId: number, categoryId: number) =>
    [...categoryQueryKeys.details(), storeId, categoryId] as const,
  subCategories: (storeId: number, categoryId: number) =>
    [...categoryQueryKeys.all, 'sub', storeId, categoryId] as const,
  companies: (storeId: number, categoryId: number) =>
    [...categoryQueryKeys.all, 'companies', storeId, categoryId] as const,
};

/**
 * Fetch all categories
 */
export function useCategories() {
  const { apiClient, storeId, buildEndpoint } = useApiClient();

  return useQuery<Category[]>({
    queryKey: categoryQueryKeys.list(storeId),
    queryFn: async () => {
      const url = buildEndpoint(API_ENDPOINTS.categories.getAll);
      const { data } = await apiClient.get(url);
      // API returns { result: {...}, data: [...] } - extract the array
      const categories = data.data || [];
      // Normalize field names: nameEN→name, nameAR→nameAr, categoryImageURL→imageUrl
      return categories.map((cat: Record<string, unknown>) => ({
        ...cat,
        name: cat.nameEN || cat.name || '',
        nameAr: cat.nameAR || cat.nameAr || '',
        imageUrl: cat.categoryImageURL || cat.mainCategoryImageURL || cat.imageUrl || cat.image,
        iconUrl: cat.categoryImageURL || cat.iconUrl,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Fetch a single category by ID
 */
export function useCategoryById(categoryId: number, enabled = true) {
  const { apiClient, storeId, buildEndpoint } = useApiClient();

  return useQuery<Category>({
    queryKey: categoryQueryKeys.detail(storeId, categoryId),
    queryFn: async () => {
      const url = buildEndpoint(API_ENDPOINTS.categories.getById, { categoryId });
      const { data } = await apiClient.get(url);
      const cat = data.data || data;
      return {
        ...cat,
        name: cat.nameEN || cat.name || '',
        nameAr: cat.nameAR || cat.nameAr || '',
        imageUrl: cat.categoryImageURL || cat.mainCategoryImageURL || cat.imageUrl,
      };
    },
    enabled: enabled && categoryId > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Fetch sub-categories for a main category
 */
export function useSubCategories(categoryId: number, enabled = true) {
  const { apiClient, storeId, buildEndpoint } = useApiClient();

  return useQuery<SubCategory[]>({
    queryKey: categoryQueryKeys.subCategories(storeId, categoryId),
    queryFn: async () => {
      const url = buildEndpoint(API_ENDPOINTS.categories.getSubCategories, { categoryId });
      const { data } = await apiClient.get(url);
      const subCategories = data.data || [];
      return subCategories.map((sub: Record<string, unknown>) => ({
        ...sub,
        name: sub.nameEN || sub.name || '',
        nameAr: sub.nameAR || sub.nameAr || '',
        imageUrl: sub.categoryImageURL || sub.imageUrl,
      }));
    },
    enabled: enabled && categoryId > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Fetch companies/brands for a category
 */
export function useCompaniesByCategory(categoryId: number, enabled = true) {
  const { apiClient, storeId, buildEndpoint } = useApiClient();

  return useQuery<Company[]>({
    queryKey: categoryQueryKeys.companies(storeId, categoryId),
    queryFn: async () => {
      const url = buildEndpoint(API_ENDPOINTS.companies.getByCategory, { categoryId });
      const { data } = await apiClient.get(url);
      const companies = data.data || [];
      return companies.map((comp: Record<string, unknown>) => ({
        ...comp,
        name: comp.nameEN || comp.name || comp.nameAr || '',
        nameAr: comp.nameAr || '',
        logoUrl: comp.imageUrl || comp.imagePath || comp.logo,
      }));
    },
    enabled: enabled && categoryId > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
