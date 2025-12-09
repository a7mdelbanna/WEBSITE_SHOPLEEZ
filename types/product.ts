/**
 * Product Types
 */

export interface ProductImage {
  id: number;
  url: string;
  isMain: boolean;
  sortOrder: number;
}

export interface ProductUnit {
  id: number;
  name: string;
  nameAr: string;
  quantity: number;      // How many small units in this unit
  price: number;
  discountPrice?: number;
}

export interface ProductFlavor {
  id: number;
  name: string;
  nameAr: string;
  isAvailable: boolean;
}

export interface ProductDiscount {
  quantity: number;           // Buy this quantity
  discountedPrice: number;    // Get this price
  maxQuantity?: number;       // Max quantity for this price
}

export interface Product {
  id: number;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;

  // Images
  mainImage: string;
  images: ProductImage[];

  // Pricing
  price: number;
  discountPrice?: number;

  // Units (big/small)
  units: ProductUnit[];
  defaultUnitId: number;

  // Flavors
  flavors: ProductFlavor[];
  hasFlavors: boolean;

  // Quantity discounts
  quantityDiscounts: ProductDiscount[];
  hasQuantityDiscount: boolean;

  // Categories
  categoryId: number;
  categoryName: string;
  categoryNameAr: string;
  subCategoryId?: number;
  subCategoryName?: string;
  subCategoryNameAr?: string;

  // Company/Brand
  companyId?: number;
  companyName?: string;
  companyNameAr?: string;
  companyLogo?: string;

  // Status
  isAvailable: boolean;
  stockQuantity?: number;
  isNew: boolean;
  isFeatured: boolean;

  // Additional info
  weight?: string;
  barcode?: string;

  // Nutrition (optional)
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
}

// Simplified product for lists
export interface ProductSummary {
  id: number;
  name: string;
  nameAr: string;
  mainImage: string;
  price: number;
  discountPrice?: number;
  isAvailable: boolean;
  isNew: boolean;
  weight?: string;
  categoryId: number;
  hasQuantityDiscount: boolean;
}

// Product filter options
export interface ProductFilters {
  categoryId?: number;
  subCategoryId?: number;
  companyId?: number;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
  isForRedeem?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'name' | 'newest';
  page?: number;
  pageSize?: number;
}
