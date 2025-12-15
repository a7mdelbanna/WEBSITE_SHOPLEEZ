'use client';

/**
 * Promotions Service
 *
 * React Query hooks for fetching promotion/banner details.
 * Matches Flutter's SpecialSectionHomeBloc pattern.
 */

import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/provider';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { ProductSummary } from '@/types/product';

/**
 * Promotion detail response from API
 */
export interface PromotionDetail {
  id: number;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  imageUrl?: string;
  fromDate?: string;
  toDate?: string;
  items: ProductSummary[];
}

/**
 * Query keys for promotions
 */
export const promotionQueryKeys = {
  all: ['promotions'] as const,
  detail: (storeId: number, promotionId: number) => [...promotionQueryKeys.all, 'detail', storeId, promotionId] as const,
};

/**
 * Normalize promotion item from API response
 */
function normalizePromotionItem(item: Record<string, unknown>): ProductSummary {
  const bigUnit = item.bigUnit as Record<string, unknown> | undefined;
  const smallUnit = item.smallUnit as Record<string, unknown> | undefined;

  const smallUnitPrice = item.smallUnitPrice as number | undefined;
  const bigUnitPrice = item.bigUnitPrice as number | undefined;
  const displayPrice = smallUnitPrice || bigUnitPrice || (item.price as number || 0);

  const smallUnitImageUrl = item.itemImageForSmallUnitUrl as string | undefined;
  const bigUnitImageUrl = item.itemImageForBigUnitUrl as string | undefined;
  const displayImage = smallUnitImageUrl || bigUnitImageUrl || item.imageUrl as string || item.mainImage as string || '';

  return {
    id: item.id as number || item.itemId as number,
    itemId: item.itemId as number,
    name: (item.nameEN || item.name || '') as string,
    nameAr: (item.nameAR || item.nameAr || '') as string,
    nameEn: (item.nameEN || item.name || '') as string,
    price: displayPrice,
    originalPrice: (item.beforeDiscount || item.originalPrice) as number | undefined,
    discountPrice: (item.sellPrice || item.discountPrice) as number | undefined,
    discountPercent: (item.discountPercent || item.discountPercentage) as number | undefined,
    imageUrl: displayImage,
    mainImage: displayImage,
    volume: (item.volumeEN || item.volume || '') as string | undefined,
    weight: (item.weight || '') as string | undefined,
    brandName: (item.companyNameEN || item.brandName || '') as string | undefined,
    brandNameAr: (item.companyNameAR || item.brandNameAr || '') as string | undefined,
    categoryName: (item.categoryNameEN || item.categoryName || '') as string | undefined,
    categoryNameAr: (item.categoryNameAR || item.categoryNameAr || '') as string | undefined,
    isAvailable: (item.isAvailable ?? true) as boolean,
    isNew: (item.isNew ?? false) as boolean,
    categoryId: (item.categoryId ?? 0) as number,
    hasQuantityDiscount: (item.hasQuantityDiscount ?? false) as boolean,
    // Unit support
    bigUnitPrice,
    smallUnitPrice,
    bigUnitImageUrl,
    smallUnitImageUrl,
    bigUnit: bigUnit ? {
      id: bigUnit.id as number,
      name: (bigUnit.nameEN || bigUnit.name || '') as string,
      nameAr: (bigUnit.nameAR || bigUnit.nameAr || '') as string,
      amount: bigUnit.amount as number || 1,
      price: bigUnitPrice || 0,
      specialPrice: (bigUnit.specialPrice || bigUnit.discountPrice) as number | undefined,
      imageUrl: bigUnitImageUrl,
    } : undefined,
    smallUnit: smallUnit ? {
      id: smallUnit.id as number,
      name: (smallUnit.nameEN || smallUnit.name || '') as string,
      nameAr: (smallUnit.nameAR || smallUnit.nameAr || '') as string,
      amount: smallUnit.amount as number || 1,
      price: smallUnitPrice || 0,
      specialPrice: (smallUnit.specialPrice || smallUnit.discountPrice) as number | undefined,
      imageUrl: smallUnitImageUrl,
    } : undefined,
    // Discount quantity limits
    bigUnitDiscountMinQuantity: item.bigUnitDiscountMinQuantity as number | undefined,
    bigUnitDiscountMaxQuantity: item.bigUnitDiscountMaxQuantity as number | undefined,
    smallUnitDiscountMinQuantity: item.smallUnitDiscountMinQuantity as number | undefined,
    smallUnitDiscountMaxQuantity: item.smallUnitDiscountMaxQuantity as number | undefined,
    // Maximum quantity per user
    isMaximumAmountForUser: item.isMaximumAmountForUser as boolean | undefined,
    maximumAmountForUser: item.maximumAmountForUser as number | undefined,
    // Stock quantity
    itemAmount: item.itemAmount as number | undefined,
  };
}

/**
 * Fetch promotion details by ID
 * Matches Flutter's GetOfferDetailsByIdEvent pattern
 */
export function usePromotionDetail(promotionId: number, enabled = true) {
  const { apiClient, storeId, buildEndpoint } = useApiClient();

  return useQuery<PromotionDetail>({
    queryKey: promotionQueryKeys.detail(storeId, promotionId),
    queryFn: async () => {
      const url = buildEndpoint(API_ENDPOINTS.promotions.getById);
      const { data } = await apiClient.get(url, {
        params: { promotionId },
      });

      const apiData = data.data || data;

      // Normalize the response
      return {
        id: apiData.id as number,
        title: (apiData.titleEN || apiData.title || '') as string,
        titleAr: (apiData.titleAR || apiData.titleAr || '') as string,
        description: (apiData.descriptionEN || apiData.description || '') as string | undefined,
        descriptionAr: (apiData.descriptionAR || apiData.descriptionAr || '') as string | undefined,
        imageUrl: (apiData.imageUrl || apiData.imagePath || '') as string | undefined,
        fromDate: apiData.fromDate as string | undefined,
        toDate: apiData.toDate as string | undefined,
        items: (apiData.items || []).map((item: Record<string, unknown>) => normalizePromotionItem(item)),
      };
    },
    enabled: enabled && promotionId > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
