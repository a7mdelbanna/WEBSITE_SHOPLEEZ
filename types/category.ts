/**
 * Category Types
 */

export interface Category {
  id: number;
  name: string;
  nameAr: string;
  image?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
}

export interface SubCategory {
  id: number;
  name: string;
  nameAr: string;
  mainCategoryId: number;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
}

export interface Company {
  id: number;
  name: string;
  nameAr: string;
  logo?: string;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
}

// For sidebar navigation
export interface CategoryNavItem {
  id: number;
  name: string;
  nameAr: string;
  icon?: string;
  image?: string;
  subCategories?: SubCategory[];
}
