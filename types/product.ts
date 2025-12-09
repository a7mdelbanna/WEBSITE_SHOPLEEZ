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

// Unit info from API
export interface UnitInfo {
  id: number;
  name: string;
  nameAr: string;
  amount: number;
  price: number;
  imageUrl?: string;
}

// Simplified product for lists
export interface ProductSummary {
  id: number;
  itemId?: number;        // Item ID from API
  name: string;
  nameEn?: string;        // English name (from API)
  nameAr: string;
  description?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  mainImage: string;
  imageUrl?: string;      // Alternative image field from API
  price: number;
  discountPrice?: number;
  originalPrice?: number; // Alternative original price field
  discountPercent?: number;
  isAvailable: boolean;
  isNew: boolean;
  weight?: string;
  volume?: string;
  categoryId: number;
  categoryName?: string;
  categoryNameAr?: string;
  brandName?: string;
  brandNameAr?: string;
  hasQuantityDiscount: boolean;
  // Unit support
  bigUnit?: UnitInfo;
  smallUnit?: UnitInfo;
  bigUnitPrice?: number;
  smallUnitPrice?: number;
  bigUnitImageUrl?: string;
  smallUnitImageUrl?: string;
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
