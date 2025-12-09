/**
 * API Response Types
 *
 * Common types for API responses from the backend.
 */

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Auth responses
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  tokens?: AuthTokens;
  requiresOtp?: boolean;
  requiresRegistration?: boolean;
  isNewUser?: boolean;
  userId?: number;
}

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  profileImage?: string;
  loyaltyPoints: number;
  walletBalance: number;
  referralCode?: string;
  sellType: 'WholeSale' | 'Retail';
}

// Store settings from API
export interface StoreSettings {
  storeId: number;
  storeName: string;
  storeNameAr: string;
  enableDeliveryTips: boolean;
  enableOTPAuthentication: boolean;
  requireCompanyForItem: boolean;
  requireSubCategoryForItem: boolean;
  appMode: string;
  isInventoryTracked: boolean;
  minimumOrderAmount: number;
  deliveryTimeMinutes: number;
  workingHoursStart: string;
  workingHoursEnd: string;
  isOpen: boolean;
}

// Error response
export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}
