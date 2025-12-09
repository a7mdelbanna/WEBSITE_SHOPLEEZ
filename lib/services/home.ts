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
 * Normalize widget item from API response
 */
function normalizeWidgetItem(item: Record<string, unknown>): ProductSummary {
  return {
    id: item.id as number || item.itemId as number,
    itemId: item.itemId as number,
    name: (item.nameEN || item.nameEn || item.name || '') as string,
    nameAr: (item.nameAR || item.nameAr || '') as string,
    nameEn: (item.nameEN || item.nameEn || item.name || '') as string,
    price: (item.sellPrice || item.price || 0) as number,
    originalPrice: (item.beforeDiscount || item.originalPrice) as number | undefined,
    discountPrice: (item.sellPrice || item.discountPrice) as number | undefined,
    discountPercent: (item.discountPercent || item.discountPercentage) as number | undefined,
    imageUrl: (item.itemImageForSmallUnitUrl || item.imageUrl || item.mainImage || '') as string,
    mainImage: (item.itemImageForSmallUnitUrl || item.mainImage || item.imageUrl || '') as string,
    volume: (item.volumeEN || item.volume || '') as string | undefined,
    weight: (item.weight || '') as string | undefined,
    brandName: (item.companyNameEN || item.brandName || '') as string | undefined,
    brandNameAr: (item.companyNameAR || item.brandNameAr || '') as string | undefined,
    categoryName: (item.categoryNameEN || item.categoryName || '') as string | undefined,
    categoryNameAr: (item.categoryNameAR || item.categoryNameAr || '') as string | undefined,
  };
}

/**
 * Normalize discount item from API response
 */
function normalizeDiscountItem(item: Record<string, unknown>): DiscountItem {
  return {
    id: item.id as number || item.itemId as number,
    itemId: item.itemId as number,
    name: (item.nameEN || item.nameEn || item.name || '') as string,
    nameAr: (item.nameAR || item.nameAr || '') as string,
    price: (item.sellPrice || item.price || 0) as number,
    originalPrice: (item.beforeDiscount || item.originalPrice || 0) as number,
    discountPercent: (item.discountPercentage || item.discountPercent || 0) as number,
    imageUrl: (item.itemImageForSmallUnitUrl || item.imageUrl || '') as string,
    discountName: (item.discountNameEN || item.discountName || '') as string,
    discountNameAr: (item.discountNameAR || item.discountNameAr || '') as string,
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

      // Add widgets from widgets array
      if (apiData.widgets && Array.isArray(apiData.widgets)) {
        apiData.widgets.forEach((widget: Record<string, unknown>) => {
          widgetsData.push({
            id: widget.id as number,
            title: (widget.nameEN || widget.name || '') as string,
            titleAr: (widget.nameAR || widget.nameAr || '') as string,
            type: 'custom',
            items: ((widget.items || []) as Record<string, unknown>[]).map(normalizeWidgetItem),
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
        if (section.key === 'PromotionOffers') {
          sectionData = sectionData.map((item: Record<string, unknown>) => ({
            ...item,
            imageUrl: item.filePath || item.imageUrl || '',
            imageUrlAr: item.filePath || item.imageUrlAr || '',
            title: item.nameEn || item.nameEN || '',
            titleAr: item.nameAr || item.nameAR || '',
            linkValue: item.linkValue || '#',
          }));
        }

        // Normalize special offers (PromotionSpecialOffers)
        if (section.key === 'PromotionSpecialOffers') {
          sectionData = sectionData.map(normalizeWidgetItem);
        }

        // Normalize spotlight (PromotionSpotlights)
        if (section.key === 'PromotionSpotlights') {
          sectionData = sectionData.map(normalizeWidgetItem);
        }

        // Normalize categories
        if (section.key === 'MainCategories' || section.key === 'Categories') {
          sectionData = sectionData.map((cat: Record<string, unknown>) => ({
            ...cat,
            name: cat.nameEN || cat.name || '',
            nameAr: cat.nameAR || cat.nameAr || '',
            imageUrl: cat.categoryImageURL || cat.mainCategoryImageURL || cat.imageUrl,
          }));
        }

        // Normalize companies
        if (section.key === 'Companies') {
          sectionData = sectionData.map((comp: Record<string, unknown>) => ({
            ...comp,
            name: comp.nameEN || comp.name || comp.nameAr || '',
            nameAr: comp.nameAr || '',
            logoUrl: comp.imageUrl || comp.imagePath || comp.logo,
          }));
        }

        // Extract active discounts
        if (section.key === 'ActiveDiscounts') {
          discounts = (sectionData as Record<string, unknown>[]).map(normalizeDiscountItem);
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
