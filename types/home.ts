/**
 * Home Page Types
 *
 * Types for the home page API response and related data structures.
 * Based on the mobile app's HomeModelOrdered structure.
 */

import type { Category } from './category';
import type { ProductSummary } from './product';

/**
 * Widget data structure
 */
export interface WidgetData {
  id: number | string;
  title: string;
  titleAr: string;
  type: 'recently-added' | 'best-selling' | 'custom';
  items: ProductSummary[];
}

/**
 * Discount item unit info
 */
export interface DiscountUnitInfo {
  id: number;
  name: string;
  nameAr: string;
  amount: number;
  price: number;
  imageUrl?: string;
}

/**
 * Discount item structure
 */
export interface DiscountItem {
  id: number;
  itemId: number;
  name: string;
  nameAr: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  imageUrl: string;
  discountName: string;
  discountNameAr: string;
  // Unit support
  bigUnit?: DiscountUnitInfo;
  smallUnit?: DiscountUnitInfo;
  bigUnitPrice?: number;
  smallUnitPrice?: number;
  bigUnitImageUrl?: string;
  smallUnitImageUrl?: string;
}

/**
 * Home page API response
 */
export interface HomePageResponse {
  orderedSections: HomeSection[];
  categories?: Category[];
  companies?: HomeBrand[];
  widgets?: WidgetData[];
  discounts?: DiscountItem[];
  popupAd?: PopupAd;
}

/**
 * Section types that can appear on the home page
 */
export type HomeSectionType =
  | 'categories'
  | 'companies'
  | 'banners'
  | 'specialOffers'
  | 'spotlight'
  | 'widget'
  | 'widgets'
  | 'discounts'
  | 'ads';

/**
 * A section on the home page
 */
export interface HomeSection {
  id: number;
  type: HomeSectionType;
  title?: string;
  titleAr?: string;
  sortOrder: number;
  data: unknown; // Varies by type - cast when using
}

/**
 * Banner/Promotion data
 */
export interface Banner {
  id: number;
  imageUrl: string;
  imageUrlAr?: string;
  title?: string;
  titleAr?: string;
  subtitle?: string;
  subtitleAr?: string;
  linkType: 'category' | 'product' | 'company' | 'url' | 'none';
  linkValue?: string;
  sortOrder: number;
  backgroundColor?: string;
  textColor?: string;
}

/**
 * Section containing banners
 */
export interface BannersSection extends HomeSection {
  type: 'banners';
  data: Banner[];
}

/**
 * Section containing categories
 */
export interface CategoriesSection extends HomeSection {
  type: 'categories';
  data: Category[];
}

/**
 * Company/Brand for home page
 */
export interface HomeBrand {
  id: number;
  name: string;
  nameAr?: string;
  logoUrl: string;
  sortOrder: number;
}

/**
 * Section containing companies/brands
 */
export interface CompaniesSection extends HomeSection {
  type: 'companies';
  data: HomeBrand[];
}

/**
 * Special offer item
 */
export interface SpecialOfferItem {
  id: number;
  itemId: number;
  item: ProductSummary;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  sortOrder: number;
}

/**
 * Section containing special offers
 */
export interface SpecialOffersSection extends HomeSection {
  type: 'specialOffers';
  data: SpecialOfferItem[];
}

/**
 * Spotlight item (featured product)
 */
export interface SpotlightItem {
  id: number;
  itemId: number;
  item: ProductSummary;
  title?: string;
  titleAr?: string;
  sortOrder: number;
}

/**
 * Section containing spotlight items
 */
export interface SpotlightSection extends HomeSection {
  type: 'spotlight';
  data: SpotlightItem[];
}

/**
 * Custom widget section
 */
export interface WidgetSection extends HomeSection {
  type: 'widget';
  widgetId: number;
  data: ProductSummary[]; // Widget items are typically products
}

/**
 * Ad section (single promotional ad)
 */
export interface AdSection extends HomeSection {
  type: 'ads';
  data: Banner;
}

/**
 * Popup advertisement
 */
export interface PopupAd {
  id: number;
  imageUrl: string;
  imageUrlAr?: string;
  linkType: 'category' | 'product' | 'company' | 'url' | 'none';
  linkValue?: string;
  showOnce: boolean;
}

/**
 * Store settings relevant to home page display
 */
export interface HomePageSettings {
  showCategories: boolean;
  showCompanies: boolean;
  showBanners: boolean;
  showSpecialOffers: boolean;
  showSpotlight: boolean;
  enablePopupAds: boolean;
}

/**
 * Type guard functions
 */
export function isBannersSection(section: HomeSection): section is BannersSection {
  return section.type === 'banners';
}

export function isCategoriesSection(section: HomeSection): section is CategoriesSection {
  return section.type === 'categories';
}

export function isCompaniesSection(section: HomeSection): section is CompaniesSection {
  return section.type === 'companies';
}

export function isSpecialOffersSection(section: HomeSection): section is SpecialOffersSection {
  return section.type === 'specialOffers';
}

export function isSpotlightSection(section: HomeSection): section is SpotlightSection {
  return section.type === 'spotlight';
}

export function isWidgetSection(section: HomeSection): section is WidgetSection {
  return section.type === 'widget';
}

export function isAdSection(section: HomeSection): section is AdSection {
  return section.type === 'ads';
}
