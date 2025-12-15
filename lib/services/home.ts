'use client';

/**
 * Home Service
 *
 * React Query hooks for home page data fetching.
 */

import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/provider';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { HomePageResponse, HomeBrand, WidgetData, DiscountItem } from '@/types/home';
import type { ProductSummary } from '@/types/product';
import type { Category } from '@/types/category';

/**
 * Query keys for home page data
 */
export const homeQueryKeys = {
  all: ['home'] as const,
  homePage: (storeId: number) => [...homeQueryKeys.all, 'page', storeId] as const,
  categories: (storeId: number) => [...homeQueryKeys.all, 'categories', storeId] as const,
  companies: (storeId: number) => [...homeQueryKeys.all, 'companies', storeId] as const,
  specialOffers: (storeId: number) => [...homeQueryKeys.all, 'specialOffers', storeId] as const,
  spotlight: (storeId: number) => [...homeQueryKeys.all, 'spotlight', storeId] as const,
  widgets: (storeId: number) => [...homeQueryKeys.all, 'widgets', storeId] as const,
  widget: (storeId: number, widgetId: number) =>
    [...homeQueryKeys.widgets(storeId), widgetId] as const,
};

/**
 * Check if a unit ID is valid (positive integer)
 */
function isValidUnitId(id: unknown): id is number {
  return typeof id === 'number' && id > 0 && Number.isInteger(id);
}

/**
 * Normalize widget item from API response
 */
function normalizeWidgetItem(item: Record<string, unknown>): ProductSummary {
  // Extract unit info
  const bigUnit = item.bigUnit as Record<string, unknown> | undefined;
  const smallUnit = item.smallUnit as Record<string, unknown> | undefined;

  // Debug: Log raw item for first few items to understand API structure
  if (Math.random() < 0.05) {
    console.log('[Home] Raw API item:', JSON.stringify(item, null, 2));
  }

  // Get prices - prefer smallUnitPrice for display, fallback to bigUnitPrice
  const smallUnitPrice = item.smallUnitPrice as number | undefined;
  const bigUnitPrice = item.bigUnitPrice as number | undefined;
  const displayPrice = smallUnitPrice || bigUnitPrice || 0;

  // Get image - prefer small unit image
  const smallUnitImageUrl = item.itemImageForSmallUnitUrl as string | undefined;
  const bigUnitImageUrl = item.itemImageForBigUnitUrl as string | undefined;
  const displayImage = smallUnitImageUrl || bigUnitImageUrl || item.imageUrl as string || item.mainImage as string || '';

  // Extract unit IDs - try multiple possible field names
  // The API might return unit ID as bigUnit.id, bigUnit.unitId, or item.bigUnitId
  let bigUnitId = bigUnit?.id as number | undefined;
  if (!isValidUnitId(bigUnitId)) {
    bigUnitId = (bigUnit?.unitId || bigUnit?.customerUnitId || item.bigUnitId) as number | undefined;
  }

  let smallUnitId = smallUnit?.id as number | undefined;
  if (!isValidUnitId(smallUnitId)) {
    smallUnitId = (smallUnit?.unitId || smallUnit?.customerUnitId || item.smallUnitId) as number | undefined;
  }

  // Check for default unit ID at item level
  const defaultUnitId = item.defaultUnitId as number | undefined;
  const customerUnitId = item.customerUnitId as number | undefined;

  const hasBigUnit = bigUnit && isValidUnitId(bigUnitId);
  const hasSmallUnit = smallUnit && isValidUnitId(smallUnitId);

  // Log if no valid unit IDs found
  if (!hasBigUnit && !hasSmallUnit) {
    console.warn('[Home] No valid unit IDs for item:', {
      itemId: item.id || item.itemId,
      name: item.nameEN || item.name,
      bigUnit: bigUnit ? JSON.stringify(bigUnit) : null,
      smallUnit: smallUnit ? JSON.stringify(smallUnit) : null,
      bigUnitId,
      smallUnitId,
      defaultUnitId,
      customerUnitId,
    });
  }

  return {
    id: item.id as number || item.itemId as number,
    itemId: item.itemId as number,
    name: (item.nameEN || item.nameEn || item.name || '') as string,
    nameAr: (item.nameAR || item.nameAr || '') as string,
    nameEn: (item.nameEN || item.nameEn || item.name || '') as string,
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
    // Required ProductSummary fields
    isAvailable: (item.isAvailable ?? true) as boolean,
    isNew: (item.isNew ?? false) as boolean,
    categoryId: (item.categoryId ?? 0) as number,
    hasQuantityDiscount: (item.hasQuantityDiscount ?? false) as boolean,
    // Unit support - only include units with valid IDs
    bigUnitPrice,
    smallUnitPrice,
    bigUnitImageUrl,
    smallUnitImageUrl,
    // Include fallback unit IDs at the product level
    ...(isValidUnitId(defaultUnitId) ? { defaultUnitId } : {}),
    ...(isValidUnitId(customerUnitId) ? { customerUnitId } : {}),
    bigUnit: hasBigUnit ? {
      id: bigUnitId as number, // Safe: hasBigUnit ensures bigUnitId is valid
      name: (bigUnit.nameEN || bigUnit.name || '') as string,
      nameAr: (bigUnit.nameAR || bigUnit.nameAr || '') as string,
      amount: bigUnit.amount as number || 1,
      price: bigUnitPrice || 0,
      specialPrice: (bigUnit.specialPrice || bigUnit.discountPrice || item.bigUnitSpecialPrice) as number | undefined,
      imageUrl: bigUnitImageUrl,
    } : undefined,
    smallUnit: hasSmallUnit ? {
      id: smallUnitId as number, // Safe: hasSmallUnit ensures smallUnitId is valid
      name: (smallUnit.nameEN || smallUnit.name || '') as string,
      nameAr: (smallUnit.nameAR || smallUnit.nameAr || '') as string,
      amount: smallUnit.amount as number || 1,
      price: smallUnitPrice || 0,
      specialPrice: (smallUnit.specialPrice || smallUnit.discountPrice || item.smallUnitSpecialPrice) as number | undefined,
      imageUrl: smallUnitImageUrl,
    } : undefined,

    // Discount quantity limits (for splitting logic) - Flutter parity
    bigUnitDiscountMinQuantity: item.bigUnitDiscountMinQuantity as number | undefined,
    bigUnitDiscountMaxQuantity: item.bigUnitDiscountMaxQuantity as number | undefined,
    smallUnitDiscountMinQuantity: item.smallUnitDiscountMinQuantity as number | undefined,
    smallUnitDiscountMaxQuantity: item.smallUnitDiscountMaxQuantity as number | undefined,

    // Maximum quantity per user - Flutter parity
    isMaximumAmountForUser: item.isMaximumAmountForUser as boolean | undefined,
    maximumAmountForUser: item.maximumAmountForUser as number | undefined,

    // Stock quantity - Flutter parity
    itemAmount: item.itemAmount as number | undefined,
  };
}

/**
 * Normalize discount item from API response
 */
function normalizeDiscountItem(item: Record<string, unknown>): DiscountItem {
  // Extract unit info - API uses nameAR (uppercase) not nameAr
  const bigUnit = item.bigUnit as Record<string, unknown> | undefined;
  const smallUnit = item.smallUnit as Record<string, unknown> | undefined;

  // Debug: Log raw discount item for first few items
  if (Math.random() < 0.05) {
    console.log('[Home] Raw discount item:', JSON.stringify(item, null, 2));
  }

  // Get prices from API - use directly without modification
  const rawSmallPrice = item.smallUnitPrice as number | undefined;
  const rawBigPrice = item.bigUnitPrice as number | undefined;
  const smallUnitPrice = rawSmallPrice ? Math.round(rawSmallPrice) : undefined;
  const bigUnitPrice = rawBigPrice ? Math.round(rawBigPrice) : undefined;

  // Display price: prefer small unit, fallback to big unit
  const displayPrice = smallUnitPrice || bigUnitPrice || Math.round(item.sellPrice as number || item.price as number || 0);

  // Get images for each unit
  const smallUnitImageUrl = item.itemImageForSmallUnitUrl as string | undefined;
  const bigUnitImageUrl = item.itemImageForBigUnitUrl as string | undefined;
  const displayImage = (smallUnitImageUrl || bigUnitImageUrl || item.imageUrl || '') as string;

  // Original price
  const rawOriginalPrice = (item.beforeDiscount || item.originalPrice || 0) as number;
  const originalPrice = Math.round(rawOriginalPrice);

  // Extract unit names - API uses nameAR (uppercase)
  const bigUnitName = bigUnit ? (bigUnit.nameAR || bigUnit.nameAr || bigUnit.nameEN || bigUnit.name || '') as string : '';
  const smallUnitName = smallUnit ? (smallUnit.nameAR || smallUnit.nameAr || smallUnit.nameEN || smallUnit.name || '') as string : '';

  // Extract unit IDs - try multiple possible field names
  let bigUnitId = bigUnit?.id as number | undefined;
  if (!isValidUnitId(bigUnitId)) {
    bigUnitId = (bigUnit?.unitId || bigUnit?.customerUnitId || item.bigUnitId) as number | undefined;
  }

  let smallUnitId = smallUnit?.id as number | undefined;
  if (!isValidUnitId(smallUnitId)) {
    smallUnitId = (smallUnit?.unitId || smallUnit?.customerUnitId || item.smallUnitId) as number | undefined;
  }

  const hasBigUnit = bigUnit && isValidUnitId(bigUnitId);
  const hasSmallUnit = smallUnit && isValidUnitId(smallUnitId);

  // Log if no valid unit IDs found
  if (!hasBigUnit && !hasSmallUnit) {
    console.warn('[Home] No valid unit IDs for discount item:', {
      itemId: item.id || item.itemId,
      name: item.nameEN || item.name,
      bigUnit: bigUnit ? JSON.stringify(bigUnit) : null,
      smallUnit: smallUnit ? JSON.stringify(smallUnit) : null,
      bigUnitId,
      smallUnitId,
    });
  }

  return {
    id: item.id as number || item.itemId as number,
    itemId: item.itemId as number || item.id as number,
    name: (item.nameEN || item.nameEn || item.name || '') as string,
    nameAr: (item.nameAR || item.nameAr || '') as string,
    price: displayPrice,
    originalPrice,
    discountPercent: Math.round((item.discountPercentage || item.discountPercent || 0) as number),
    imageUrl: displayImage,
    discountName: (item.discountNameEN || item.discountName || '') as string,
    discountNameAr: (item.discountNameAR || item.discountNameAr || '') as string,
    // Unit support - only include units with valid IDs
    bigUnitPrice,
    smallUnitPrice,
    bigUnitImageUrl,
    smallUnitImageUrl,
    bigUnit: hasBigUnit ? {
      id: bigUnitId as number,
      name: bigUnitName,
      nameAr: bigUnitName, // Use same name since API only provides nameAR
      amount: bigUnit.amount as number || 1,
      price: bigUnitPrice || 0,
      specialPrice: (bigUnit.specialPrice || bigUnit.discountPrice || item.bigUnitSpecialPrice) as number | undefined,
      imageUrl: bigUnitImageUrl,
    } : undefined,
    smallUnit: hasSmallUnit ? {
      id: smallUnitId as number,
      name: smallUnitName,
      nameAr: smallUnitName, // Use same name since API only provides nameAR
      amount: smallUnit.amount as number || 1,
      price: smallUnitPrice || 0,
      specialPrice: (smallUnit.specialPrice || smallUnit.discountPrice || item.smallUnitSpecialPrice) as number | undefined,
      imageUrl: smallUnitImageUrl,
    } : undefined,

    // Discount quantity limits (for splitting logic) - Flutter parity
    bigUnitDiscountMinQuantity: item.bigUnitDiscountMinQuantity as number | undefined,
    bigUnitDiscountMaxQuantity: item.bigUnitDiscountMaxQuantity as number | undefined,
    smallUnitDiscountMinQuantity: item.smallUnitDiscountMinQuantity as number | undefined,
    smallUnitDiscountMaxQuantity: item.smallUnitDiscountMaxQuantity as number | undefined,

    // Maximum quantity per user - Flutter parity
    isMaximumAmountForUser: item.isMaximumAmountForUser as boolean | undefined,
    maximumAmountForUser: item.maximumAmountForUser as number | undefined,

    // Stock quantity - Flutter parity
    itemAmount: item.itemAmount as number | undefined,
  };
}

/**
 * Map API section keys to our internal types
 */
const SECTION_KEY_MAP: Record<string, string> = {
  'PromotionOffers': 'banners',
  'PromotionSpecialOffers': 'specialOffers',
  'PromotionSpotlights': 'spotlight',
  'Companies': 'companies',
  'Categories': 'categories',
  'MainCategories': 'categories',
  'RecentlyAdded': 'widget',
  'BestSelling': 'widget',
  'Campaigns': 'widget',
  'Widgets': 'widgets',
  'ActiveDiscounts': 'discounts',
};

export function useHomePage() {
  const { apiClient, storeId, buildEndpoint } = useApiClient();

  return useQuery<HomePageResponse>({
    queryKey: homeQueryKeys.homePage(storeId),
    queryFn: async () => {
      const url = buildEndpoint(API_ENDPOINTS.home.getHomePage);
      const { data } = await apiClient.get(url);
      const apiData = data.data || data;

      // Extract top-level data
      const categories = (apiData.categories || []).map((cat: Record<string, unknown>) => ({
        ...cat,
        name: cat.nameEN || cat.name || '',
        nameAr: cat.nameAR || cat.nameAr || '',
        imageUrl: cat.categoryImageURL || cat.mainCategoryImageURL || cat.imageUrl,
      }));

      const companies = (apiData.companies || []).map((comp: Record<string, unknown>) => ({
        ...comp,
        name: comp.nameEN || comp.name || comp.nameAr || '',
        nameAr: comp.nameAr || '',
        logoUrl: comp.imageUrl || comp.imagePath || comp.logo,
      }));

      // Extract widgets from top-level data
      const widgetsData: WidgetData[] = [];

      // Add recentlyAddedWidget if exists
      if (apiData.recentlyAddedWidget) {
        const widget = apiData.recentlyAddedWidget;
        widgetsData.push({
          id: widget.id || 'recently-added',
          title: widget.nameEN || widget.name || 'Recently Added',
          titleAr: widget.nameAR || widget.nameAr || 'المضاف حديثاً',
          type: 'recently-added',
          items: (widget.items || []).map(normalizeWidgetItem),
        });
      }

      // Add bestSellingWidget if exists
      if (apiData.bestSellingWidget) {
        const widget = apiData.bestSellingWidget;
        widgetsData.push({
          id: widget.id || 'best-selling',
          title: widget.nameEN || widget.name || 'Best Selling',
          titleAr: widget.nameAR || widget.nameAr || 'الأكثر مبيعاً',
          type: 'best-selling',
          items: (widget.items || []).map(normalizeWidgetItem),
        });
      }

      // Add widgets from widgets array - ONLY if they have a name and items
      if (apiData.widgets && Array.isArray(apiData.widgets)) {
        apiData.widgets.forEach((widget: Record<string, unknown>) => {
          const title = (widget.nameEN || widget.name || '') as string;
          const titleAr = (widget.nameAR || widget.nameAr || '') as string;
          const items = (widget.items || []) as Record<string, unknown>[];

          // Skip widgets without names or items
          if ((!title && !titleAr) || items.length === 0) {
            return;
          }

          // Normalize and deduplicate items by ID
          const normalizedItems = items.map(normalizeWidgetItem);
          const seen = new Set<number>();
          const deduplicatedItems = normalizedItems.filter(item => {
            if (seen.has(item.id)) {
              return false;
            }
            seen.add(item.id);
            return true;
          });

          widgetsData.push({
            id: widget.id as number,
            title,
            titleAr,
            type: 'custom',
            items: deduplicatedItems,
          });
        });
      }

      // Extract active discounts
      let discounts: DiscountItem[] = [];

      // Transform orderedSections: map key→type, normalize data
      const orderedSections = (apiData.orderedSections || []).map((section: { key: string; data: unknown[] }, index: number) => {
        const type = SECTION_KEY_MAP[section.key] || section.key.toLowerCase();
        let sectionData = section.data || [];

        // Normalize banners (PromotionOffers)
        // Banners only need id + image + title (no linkType/linkValue)
        // Navigation handled by banner ID → /promotion/[id]
        if (section.key === 'PromotionOffers') {
          sectionData = (sectionData as Record<string, unknown>[]).map((item) => ({
            ...item,
            imageUrl: item.filePath || item.imageUrl || '',
            imageUrlAr: item.filePath || item.imageUrlAr || '',
            title: item.nameEn || item.nameEN || '',
            titleAr: item.nameAr || item.nameAR || '',
          }));
        }

        // Normalize special offers (PromotionSpecialOffers)
        if (section.key === 'PromotionSpecialOffers') {
          sectionData = (sectionData as Record<string, unknown>[]).map(normalizeWidgetItem);
        }

        // Normalize spotlight (PromotionSpotlights)
        if (section.key === 'PromotionSpotlights') {
          sectionData = (sectionData as Record<string, unknown>[]).map(normalizeWidgetItem);
        }

        // Normalize categories
        if (section.key === 'MainCategories' || section.key === 'Categories') {
          sectionData = (sectionData as Record<string, unknown>[]).map((cat) => ({
            ...cat,
            name: cat.nameEN || cat.name || '',
            nameAr: cat.nameAR || cat.nameAr || '',
            imageUrl: cat.categoryImageURL || cat.mainCategoryImageURL || cat.imageUrl,
          }));
        }

        // Normalize companies
        if (section.key === 'Companies') {
          sectionData = (sectionData as Record<string, unknown>[]).map((comp) => ({
            ...comp,
            name: comp.nameEN || comp.name || comp.nameAr || '',
            nameAr: comp.nameAr || '',
            logoUrl: comp.imageUrl || comp.imagePath || comp.logo,
          }));
        }

        // Extract active discounts - deduplicate by item ID
        if (section.key === 'ActiveDiscounts') {
          const allDiscounts = (sectionData as Record<string, unknown>[]).map(normalizeDiscountItem);
          // Deduplicate by ID - keep first occurrence
          const seen = new Set<number>();
          discounts = allDiscounts.filter(item => {
            if (seen.has(item.id)) {
              return false;
            }
            seen.add(item.id);
            return true;
          });
        }

        return {
          id: index,
          type,
          sortOrder: index,
          data: sectionData,
        };
      });

      return {
        orderedSections,
        categories,
        companies,
        widgets: widgetsData,
        discounts,
      };
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch all categories for home page
 */
export function useHomeCategories() {
  const { apiClient, storeId, buildEndpoint } = useApiClient();

  return useQuery<Category[]>({
    queryKey: homeQueryKeys.categories(storeId),
    queryFn: async () => {
      const url = buildEndpoint(API_ENDPOINTS.categories.getAll);
      const { data } = await apiClient.get(url);
      const categories = data.data || [];
      return categories.map((cat: Record<string, unknown>) => ({
        ...cat,
        name: cat.nameEN || cat.name || '',
        nameAr: cat.nameAR || cat.nameAr || '',
        imageUrl: cat.categoryImageURL || cat.mainCategoryImageURL || cat.imageUrl,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - categories don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Fetch all companies/brands for home page
 */
export function useHomeCompanies() {
  const { apiClient, storeId, buildEndpoint } = useApiClient();

  return useQuery<HomeBrand[]>({
    queryKey: homeQueryKeys.companies(storeId),
    queryFn: async () => {
      const url = buildEndpoint(API_ENDPOINTS.companies.getAll);
      const { data } = await apiClient.get(url);
      const companies = data.data || [];
      return companies.map((comp: Record<string, unknown>) => ({
        ...comp,
        name: comp.nameEN || comp.name || comp.nameAr || '',
        nameAr: comp.nameAr || '',
        logoUrl: comp.imageUrl || comp.imagePath || comp.logo,
      }));
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Fetch special offers
 */
export function useSpecialOffers() {
  const { apiClient, storeId, buildEndpoint } = useApiClient();

  return useQuery<ProductSummary[]>({
    queryKey: homeQueryKeys.specialOffers(storeId),
    queryFn: async () => {
      const url = buildEndpoint(API_ENDPOINTS.products.getSpecialOffers);
      const { data } = await apiClient.get(url);
      const items = data.data || [];
      return items.map((item: Record<string, unknown>) => ({
        ...item,
        name: item.nameEN || item.name || '',
        nameAr: item.nameAR || item.nameAr || '',
        mainImage: item.imageUrl || item.mainImage || '',
        imageUrl: item.imageUrl || item.mainImage || '',
      }));
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - offers can change
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch spotlight/featured items
 */
export function useSpotlightItems() {
  const { apiClient, storeId, buildEndpoint } = useApiClient();

  return useQuery<ProductSummary[]>({
    queryKey: homeQueryKeys.spotlight(storeId),
    queryFn: async () => {
      const url = buildEndpoint(API_ENDPOINTS.products.getSpotlight);
      const { data } = await apiClient.get(url);
      const items = data.data || [];
      return items.map((item: Record<string, unknown>) => ({
        ...item,
        name: item.nameEN || item.name || '',
        nameAr: item.nameAR || item.nameAr || '',
        mainImage: item.imageUrl || item.mainImage || '',
        imageUrl: item.imageUrl || item.mainImage || '',
      }));
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch all widgets
 */
export function useWidgets() {
  const { apiClient, storeId, buildEndpoint } = useApiClient();

  return useQuery({
    queryKey: homeQueryKeys.widgets(storeId),
    queryFn: async () => {
      const url = buildEndpoint(API_ENDPOINTS.widgets.getAll);
      const { data } = await apiClient.get(url);
      return data.data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

/**
 * Fetch a specific widget's items
 */
export function useWidget(widgetId: number, enabled = true) {
  const { apiClient, storeId, buildEndpoint } = useApiClient();

  return useQuery<ProductSummary[]>({
    queryKey: homeQueryKeys.widget(storeId, widgetId),
    queryFn: async () => {
      const url = buildEndpoint(API_ENDPOINTS.widgets.getById, { widgetId });
      const { data } = await apiClient.get(url);
      const items = data.data || [];
      return items.map((item: Record<string, unknown>) => ({
        ...item,
        name: item.nameEN || item.name || '',
        nameAr: item.nameAR || item.nameAr || '',
        mainImage: item.imageUrl || item.mainImage || '',
        imageUrl: item.imageUrl || item.mainImage || '',
      }));
    },
    enabled: enabled && widgetId > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}
