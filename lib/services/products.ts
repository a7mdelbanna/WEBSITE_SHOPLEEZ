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
  search: (storeId: number, query: string) =>
    [...productQueryKeys.all, 'search', storeId, query] as const,
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
 * Product detail response from API
 */
export interface ProductDetailResponse {
  id: number;
  code: string;
  nameEN: string;
  nameAR: string;
  descriptionEN: string;
  descriptionAR: string;
  itemImageForBigUnitUrl: string;
  itemImageForSmallUnitUrl: string;
  bigUnit: {
    nameEN?: string;
    nameAR: string;
    amount: number;
    id: number;
  };
  bigUnitPrice: number;
  smallUnit: {
    nameEN?: string;
    nameAR: string;
    amount: number;
    id: number;
  };
  smallUnitPrice: number;
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  expiration: number;
  expirationType: string;
  category: {
    id: number;
    nameEN: string;
    nameAR: string;
  };
  company: {
    id: number;
    nameAr: string;
    nameEN?: string;
  };
  tags: Array<{ id: number; nameAR?: string; nameEN?: string }>;
  flavours: Array<{ id: number; nameAR?: string; nameEN?: string; isAvailable?: boolean }>;
  isActive: boolean;
}

/**
 * Normalize product detail from API response
 */
function normalizeProductDetail(item: ProductDetailResponse): Product {
  return {
    id: item.id,
    name: item.nameEN || item.nameAR,
    nameAr: item.nameAR,
    description: item.descriptionEN || undefined,
    descriptionAr: item.descriptionAR || undefined,
    mainImage: item.itemImageForSmallUnitUrl || item.itemImageForBigUnitUrl,
    images: [],
    price: item.smallUnitPrice || item.bigUnitPrice,
    discountPrice: undefined,
    units: [
      ...(item.smallUnit ? [{
        id: item.smallUnit.id,
        name: item.smallUnit.nameEN || item.smallUnit.nameAR,
        nameAr: item.smallUnit.nameAR,
        quantity: item.smallUnit.amount,
        price: item.smallUnitPrice,
      }] : []),
      ...(item.bigUnit && item.bigUnitPrice !== item.smallUnitPrice ? [{
        id: item.bigUnit.id,
        name: item.bigUnit.nameEN || item.bigUnit.nameAR,
        nameAr: item.bigUnit.nameAR,
        quantity: item.bigUnit.amount,
        price: item.bigUnitPrice,
      }] : []),
    ],
    defaultUnitId: item.smallUnit?.id || item.bigUnit?.id || 0,
    flavors: item.flavours?.map(f => ({
      id: f.id,
      name: f.nameEN || f.nameAR || '',
      nameAr: f.nameAR || '',
      isAvailable: f.isAvailable ?? true,
    })) || [],
    hasFlavors: (item.flavours?.length || 0) > 0,
    quantityDiscounts: [],
    hasQuantityDiscount: false,
    categoryId: item.category?.id || 0,
    categoryName: item.category?.nameEN || '',
    categoryNameAr: item.category?.nameAR || '',
    companyId: item.company?.id,
    companyName: item.company?.nameEN || item.company?.nameAr,
    companyNameAr: item.company?.nameAr,
    isAvailable: item.isActive,
    isNew: false,
    isFeatured: false,
    calories: item.calories || undefined,
    protein: item.protein || undefined,
    fat: item.fat || undefined,
    carbs: item.carbohydrates || undefined,
    // Extended fields for modal
    bigUnitPrice: item.bigUnitPrice,
    smallUnitPrice: item.smallUnitPrice,
    bigUnitName: item.bigUnit?.nameAR,
    smallUnitName: item.smallUnit?.nameAR,
    bigUnitImageUrl: item.itemImageForBigUnitUrl,
    smallUnitImageUrl: item.itemImageForSmallUnitUrl,
  };
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
      const apiData = data.data || data;
      return normalizeProductDetail(apiData);
    },
    enabled: enabled && itemId > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Normalize related product from API response
 */
function normalizeRelatedProduct(item: Record<string, unknown>): ProductSummary {
  const bigUnitPrice = item.bigUnitPrice as number | undefined;
  const smallUnitPrice = item.smallUnitPrice as number | undefined;
  const displayPrice = smallUnitPrice || bigUnitPrice || 0;
  const displayImage = (item.itemImageForSmallUnitUrl || item.itemImageForBigUnitUrl || '') as string;

  // Extract discount data from API
  const discountPercent = (item.discountPercent || item.discountPercentage || item.discount) as number | undefined;
  const originalPrice = item.originalPrice as number | undefined;
  const specialPrice = (item.specialPrice || item.discountPrice) as number | undefined;
  const discountPrice = specialPrice || (originalPrice && discountPercent ? originalPrice * (1 - discountPercent / 100) : undefined);

  return {
    id: item.id as number,
    itemId: item.id as number,
    name: (item.nameEN || item.nameAR || '') as string,
    nameAr: (item.nameAR || '') as string,
    nameEn: (item.nameEN || '') as string,
    price: displayPrice,
    originalPrice,
    discountPrice,
    discountPercent,
    imageUrl: displayImage,
    mainImage: displayImage,
    volume: undefined,
    weight: undefined,
    brandName: ((item.company as Record<string, unknown>)?.nameEN || (item.company as Record<string, unknown>)?.nameAr || '') as string,
    brandNameAr: ((item.company as Record<string, unknown>)?.nameAr || '') as string,
    categoryName: ((item.category as Record<string, unknown>)?.nameEN || '') as string,
    categoryNameAr: ((item.category as Record<string, unknown>)?.nameAR || '') as string,
    isAvailable: (item.isActive as boolean) ?? true,
    isNew: false,
    categoryId: ((item.category as Record<string, unknown>)?.id as number) || 0,
    hasQuantityDiscount: false,
    bigUnitPrice,
    smallUnitPrice,
    bigUnitImageUrl: item.itemImageForBigUnitUrl as string | undefined,
    smallUnitImageUrl: item.itemImageForSmallUnitUrl as string | undefined,
    bigUnit: item.bigUnit ? {
      id: (item.bigUnit as Record<string, unknown>).id as number,
      name: ((item.bigUnit as Record<string, unknown>).nameEN || (item.bigUnit as Record<string, unknown>).nameAR || '') as string,
      nameAr: ((item.bigUnit as Record<string, unknown>).nameAR || '') as string,
      amount: (item.bigUnit as Record<string, unknown>).amount as number || 1,
      price: bigUnitPrice || 0,
    } : undefined,
    smallUnit: item.smallUnit ? {
      id: (item.smallUnit as Record<string, unknown>).id as number,
      name: ((item.smallUnit as Record<string, unknown>).nameEN || (item.smallUnit as Record<string, unknown>).nameAR || '') as string,
      nameAr: ((item.smallUnit as Record<string, unknown>).nameAR || '') as string,
      amount: (item.smallUnit as Record<string, unknown>).amount as number || 1,
      price: smallUnitPrice || 0,
    } : undefined,
  };
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
      const items = data.data || data || [];
      return Array.isArray(items) ? items.map(normalizeRelatedProduct) : [];
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
      // API returns { result: {...}, data: [...] } - extract the array
      const items = data.data || data.items || data || [];
      // Normalize product items
      return Array.isArray(items) ? items.map(normalizeProductItem) : [];
    },
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Normalize product item from API response to ProductSummary
 */
function normalizeProductItem(item: Record<string, unknown>): ProductSummary {
  const bigUnitPrice = item.bigUnitPrice as number | undefined;
  const smallUnitPrice = item.smallUnitPrice as number | undefined;
  const displayPrice = smallUnitPrice || bigUnitPrice || 0;
  const displayImage = (item.itemImageForSmallUnitUrl || item.itemImageForBigUnitUrl || item.imageUrl || '') as string;

  // Extract discount data from API
  const discountPercent = (item.discountPercent || item.discountPercentage || item.discount) as number | undefined;
  const originalPrice = item.originalPrice as number | undefined;
  const specialPrice = (item.specialPrice || item.discountPrice) as number | undefined;
  const discountPrice = specialPrice || (originalPrice && discountPercent ? originalPrice * (1 - discountPercent / 100) : undefined);

  return {
    id: item.id as number,
    itemId: item.id as number,
    name: (item.nameEN || item.name || item.nameAR || '') as string,
    nameAr: (item.nameAR || item.nameAr || '') as string,
    nameEn: (item.nameEN || item.name || '') as string,
    price: displayPrice,
    originalPrice,
    discountPrice,
    discountPercent,
    imageUrl: displayImage,
    mainImage: displayImage,
    volume: undefined,
    weight: undefined,
    brandName: ((item.company as Record<string, unknown>)?.nameEN || (item.company as Record<string, unknown>)?.nameAr || '') as string,
    brandNameAr: ((item.company as Record<string, unknown>)?.nameAr || '') as string,
    categoryName: ((item.category as Record<string, unknown>)?.nameEN || '') as string,
    categoryNameAr: ((item.category as Record<string, unknown>)?.nameAR || '') as string,
    isAvailable: (item.isActive as boolean) ?? true,
    isNew: false,
    categoryId: ((item.category as Record<string, unknown>)?.id as number) || (item.categoryId as number) || 0,
    hasQuantityDiscount: false,
    bigUnitPrice,
    smallUnitPrice,
    bigUnitImageUrl: item.itemImageForBigUnitUrl as string | undefined,
    smallUnitImageUrl: item.itemImageForSmallUnitUrl as string | undefined,
    bigUnit: item.bigUnit ? {
      id: (item.bigUnit as Record<string, unknown>).id as number,
      name: ((item.bigUnit as Record<string, unknown>).nameEN || (item.bigUnit as Record<string, unknown>).nameAR || '') as string,
      nameAr: ((item.bigUnit as Record<string, unknown>).nameAR || '') as string,
      amount: (item.bigUnit as Record<string, unknown>).amount as number || 1,
      price: bigUnitPrice || 0,
    } : undefined,
    smallUnit: item.smallUnit ? {
      id: (item.smallUnit as Record<string, unknown>).id as number,
      name: ((item.smallUnit as Record<string, unknown>).nameEN || (item.smallUnit as Record<string, unknown>).nameAR || '') as string,
      nameAr: ((item.smallUnit as Record<string, unknown>).nameAR || '') as string,
      amount: (item.smallUnit as Record<string, unknown>).amount as number || 1,
      price: smallUnitPrice || 0,
    } : undefined,
    // Stock & availability validation fields
    itemAmount: item.itemAmount as number | undefined,
    isMaximumAmountForUser: item.isMaximumAmountForUser as boolean | undefined,
    maximumAmountForUser: item.maximumAmountForUser as number | undefined,
  };
}

/**
 * Search products by query
 * Uses GET /RetailAPI/Customer/Item/GetAllItems/{storeId}?searchQuery={query}
 * Following Flutter implementation with 1-second debounce on the UI side
 */
export function useSearchProducts(query: string, enabled = true) {
  const { apiClient, storeId, buildEndpoint } = useApiClient();

  return useQuery<ProductSummary[]>({
    queryKey: productQueryKeys.search(storeId, query),
    queryFn: async () => {
      if (!query.trim()) return [];

      const url = buildEndpoint(API_ENDPOINTS.products.getAll);
      const { data } = await apiClient.get(url, {
        params: {
          searchQuery: query.trim(),
          pageNumber: 1,
          pageSize: 20,
        },
      });
      // API returns { result: {...}, data: [...] } - extract the array
      const items = data.data || data.items || data || [];
      // Normalize product items with all stock validation fields
      return Array.isArray(items) ? items.map(normalizeProductItem) : [];
    },
    enabled: enabled && query.trim().length >= 2, // Only search if 2+ characters
    staleTime: 30 * 1000, // 30 seconds - search results can change
    gcTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData, // Keep showing old results while loading new
  });
}

/**
 * Search products with pagination support
 * For full-page search results
 */
export function useSearchProductsPaginated(
  query: string,
  page: number = 1,
  pageSize: number = 24,
  enabled = true
) {
  const { apiClient, storeId, buildEndpoint } = useApiClient();

  return useQuery<{
    items: ProductSummary[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>({
    queryKey: [...productQueryKeys.search(storeId, query), page, pageSize],
    queryFn: async () => {
      if (!query.trim()) {
        return {
          items: [],
          totalCount: 0,
          pageNumber: 1,
          pageSize: pageSize,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        };
      }

      const url = buildEndpoint(API_ENDPOINTS.products.getAll);
      const { data } = await apiClient.get(url, {
        params: {
          SearchTerm: query.trim(), // Flutter uses "SearchTerm" not "searchQuery"
          pageNumber: page,
          pageSize: pageSize,
        },
      });

      // Extract items array
      const items = data.data || data.items || data || [];
      const normalizedItems = Array.isArray(items) ? items.map(normalizeProductItem) : [];

      // Calculate pagination info
      const totalCount = normalizedItems.length; // API should return total, but fallback to items length
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        items: normalizedItems,
        totalCount,
        pageNumber: page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    },
    enabled: enabled && query.trim().length >= 2,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
}
