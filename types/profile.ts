/**
 * Profile Module Types
 *
 * Types for user profile, wallet, transactions, favorites,
 * notifications, loyalty points, referral, and chatbot.
 */

// ============================================================================
// Profile & Wallet
// ============================================================================

export interface ProfileModel {
  customerId?: number;
  customerInfo?: {
    result?: {
      code?: number;
      message?: string;
    };
    data?: CustomerData;
  };
}

export interface CustomerData {
  id?: string;
  fullName?: string;
  username?: string;
  email?: string | null;
  phoneNumber?: string;
  phone1?: string;
  phone2?: string;
  fcmToken?: string;
  userType?: string;
  isActive?: boolean;
  isAvaliable?: boolean;
  status?: unknown;
  hasNewNotifications?: number;
  minAllowedOrders?: number;
  myReferrerCode?: string;
  isMyReferralCodeActive?: boolean;
  referralCode?: unknown;
  myPonums?: number;
  myPoints?: number;
}

export interface WalletModel {
  result?: {
    code?: number;
    message?: string;
  };
  data?: WalletData;
}

export interface WalletData {
  id?: number;
  balance?: number;
  currency?: string;
  createdAtDate?: string;
  createdAtTime?: string;
  customer?: CustomerData;
}

// ============================================================================
// Transactions
// ============================================================================

export interface TransactionData {
  id?: number;
  senderWalletId?: unknown;
  transactionType?: string;
  amount?: number;
  currency?: unknown;
  recipientWalletId?: number;
  details?: string;
  createdAtDate?: string;
  createdAtTime?: string;
}

export interface TransactionsHistoryModel {
  result?: {
    code?: number;
    message?: string;
  };
  data?: TransactionData[];
}

// ============================================================================
// Favorites
// ============================================================================

export interface FavoriteItemData {
  id?: number;
  nameEn?: string;
  nameAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  itemImage?: string;
  itemImageUrl?: string;
  itemImageForBigUnitUrl?: string;
  itemImageForSmallUnitUrl?: string;
  itemImageFileLength?: number;
  itemAmount2?: number;

  // Unit information
  bigUnit?: {
    id?: number;
    unitNameAR?: string;
    unitNameEN?: string;
    unitAmount?: number;
  };
  bigUnitPrice?: number;
  bigUnitSpecialPrice?: number;

  smallUnit?: {
    id?: number;
    unitNameAR?: string;
    unitNameEN?: string;
    unitAmount?: number;
  };
  smallUnitPrice?: number;
  smallUnitSpecialPrice?: number;

  // Nutritional info
  taxPrcent?: number;
  vatPrcent?: number;
  per?: number;
  calories?: number;
  protein?: number;
  fat?: number;
  carbohydrates?: number;

  // Offer info
  itemOfferDisVal?: number;
  flavors?: Flavor[];

  // Quantity restrictions
  maximumAmountForUser?: number;
  isMaximumAmountForUser?: boolean;

  // Discount quantities
  bigUnitDiscountMinQuantity?: number;
  bigUnitDiscountMaxQuantity?: number;
  smallUnitDiscountMinQuantity?: number;
  smallUnitDiscountMaxQuantity?: number;

  // Product settings
  expiration?: number;
  expirationType?: string;
  isSoldByWeight?: boolean;
  isSellByCustomValue?: boolean;

  // Categories
  mainCategory?: {
    id?: number;
    categoryNameAR?: string;
    categoryNameEN?: string;
  };
  subCategory?: {
    id?: number;
    categoryNameAR?: string;
    categoryNameEN?: string;
  };

  tags?: unknown[];
}

export interface Flavor {
  id?: number;
  flavourNameAR?: string;
  flavourNameEN?: string;
}

export interface FavoritesModel {
  result?: {
    code?: number;
    message?: string;
  };
  data?: FavoriteItemData[];
}

// ============================================================================
// Notifications
// ============================================================================

export interface NotificationItem {
  notificationId?: number;
  notificationTitle?: string;
  notificationSubTitle?: string;
  notificationMessage?: string;
  notificationType?: string;
  userId?: string;
  userName?: string;
  notificationDate?: string;
  notificationTime?: string;
  isRead?: boolean;
}

export interface NotificationsModel {
  result?: {
    code?: number;
    message?: string;
  };
  data?: NotificationItem[];
}

// ============================================================================
// Loyalty Points & Redeem
// ============================================================================

export interface LoyaltyPointsData {
  myPoints?: number;
  myReferrerCode?: string;
  isMyReferralCodeActive?: boolean;
}

export interface RedeemItem {
  id?: number;
  itemNameAR?: string;
  itemNameEN?: string;
  itemImageUrl?: string;
  pointsCost?: number;
  description?: string;
}

export interface RedeemModel {
  result?: {
    code?: number;
    message?: string;
  };
  data?: RedeemItem[];
}

// ============================================================================
// Referral
// ============================================================================

export interface ReferralSettings {
  referralCashbackPercent?: number;
  referralCashbackMaxEGP?: number;
  inviteeDiscountPercent?: number;
  inviteeDiscountMaxEGP?: number;
  inviteeDiscountMaxOrders?: number;
}

// ============================================================================
// Chatbot
// ============================================================================

export type ChatMessageSender = 'user' | 'bot' | 'agent';

export interface ChatMessage {
  id?: string;
  message: string;
  senderId: string;
  senderType: ChatMessageSender;
  timestamp: string;
  sessionId: string;
  choices?: string[];  // Bot message choices/quick replies
}

export interface ChatSession {
  sessionId: string;
  userId: string;
  status: 'active' | 'closed';
  startTime: string;
  endTime?: string;
}

export type ChatbotStatus =
  | 'initial'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'sessionClosed';

// ============================================================================
// Orders (Profile Context)
// ============================================================================

export interface MyOrderData {
  id?: number;
  orderEznNo?: number;
  orderEznMemo?: string;
  orderTipVal?: number;
  orderStatus?: string;
  orderEznDate?: string;
  orderEznTime?: string;
  remainingTimeInMinutes?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  deliveryBoyName?: string;
  customer?: {
    id?: string;
    fullName?: string;
    phoneNumber?: string;
  };
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    governorate?: string;
    latitude?: string;
    longitude?: string;
  };
  storeLocationLong?: string;
  storeLocationLat?: string;
  itemDetails?: OrderItemDetail[];
  notDeliveredReason?: unknown;
  orderRating?: unknown;
  deliveryFeeInfo?: {
    deliveryFee?: number;
    deliveryFeeWithVat?: number;
  };
  orderEznTotal?: number;
  orderEznTotalVatValue?: number;
  orderEznTotalTaxValue?: number;
  orderEznTotalOfferDisValue?: number;
  couponDisVal?: number;
  deliveryFee?: unknown;
  orderEznNetValue?: number;
}

export interface OrderItemDetail {
  id?: number;
  itemId?: number;
  itemNameAR?: string;
  itemNameEN?: string;
  itemImageUrl?: string;
  selectedUnit?: string;
  unitPrice?: number;
  orderDetQty?: number;
  orderDetTotal?: number;
  itemUnit?: {
    id?: number;
    unitNameAR?: string;
    unitNameEN?: string;
  };
}

export interface MyOrdersModel {
  result?: {
    code?: number;
    message?: string;
  };
  data?: MyOrderData[];
}

// ============================================================================
// Order Status
// ============================================================================

export type OrderStatusType =
  | 'Pending'
  | 'Confirmed'
  | 'In Progress'
  | 'Delivered'
  | 'Cancelled'
  | 'Rejected';

export const ORDER_STATUS_COLORS: Record<OrderStatusType, string> = {
  Pending: '#FF9800',
  Confirmed: '#2196F3',
  'In Progress': '#9C27B0',
  Delivered: '#4CAF50',
  Cancelled: '#F44336',
  Rejected: '#F44336',
};

// ============================================================================
// Change Password
// ============================================================================

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  result?: {
    code?: number;
    message?: string;
  };
}
