/**
 * Cart Types
 */

export interface CartItemUnit {
  id: number;
  name: string;
  nameAr: string;
  price: number;
  discountPrice?: number;
}

export interface CartItem {
  id: number;                    // Cart item ID
  itemId: number;                // Product ID
  name: string;
  nameAr: string;
  image: string;

  // Quantity
  quantity: number;

  // Pricing
  unitPrice: number;             // Price per unit (normal/regular price)
  discountedUnitPrice?: number;  // Discounted price per unit (special price)
  totalPrice: number;            // quantity * price

  // Selected options - CRITICAL: Used for 3-field matching (itemId + unitId + flavorId)
  selectedUnitId?: number;
  selectedUnit?: CartItemUnit;
  selectedFlavorId?: number;
  selectedFlavorName?: string;

  // Unit identification (for matching)
  bigUnitId?: number;
  smallUnitId?: number;

  // Discount quantity limits (for splitting logic)
  bigUnitDiscountMinQuantity?: number;
  bigUnitDiscountMaxQuantity?: number;
  smallUnitDiscountMinQuantity?: number;
  smallUnitDiscountMaxQuantity?: number;

  // Legacy discount info (deprecated, use unit-specific limits above)
  discountQuantity?: number;
  maxDiscountQuantity?: number;

  // Maximum quantity per user
  isMaximumAmountForUser?: boolean;
  maximumAmountForUser?: number;

  // Stock status
  isAvailable: boolean;
  availableQuantity?: number;
  itemAmount?: number;           // Current stock quantity
}

export interface CartSummary {
  subtotal: number;              // Sum of all items
  discount: number;              // Total discount amount
  couponDiscount: number;        // Coupon discount
  deliveryFee: number;
  tip: number;
  total: number;                 // Final amount

  // Coupon info
  appliedCouponCode?: string;
  appliedCouponId?: number;

  // Referral discount
  inviteeDiscount: number;

  // Item counts
  itemCount: number;             // Number of unique items
  totalQuantity: number;         // Total quantity of all items
}

export interface Cart {
  items: CartItem[];
  summary: CartSummary;
  addressId?: number;
  lastUpdated: string;
}

// Request types
export interface AddToCartRequest {
  itemId: number;
  quantity: number;
  customerUnitId?: number;
  discountedPrice?: number;
  normalPrice?: number;
  discountQuantity?: number;
  maxDiscountQuantity?: number;
  flavourId?: number;

  // Product metadata (for display in cart without API call)
  name?: string;                // Product name in English
  nameAr?: string;              // Product name in Arabic
  image?: string;               // Product image URL

  // Unit identification (for 3-field matching and discount splitting)
  itemUnitId?: number;          // Selected unit ID
  bigUnitId?: number;
  smallUnitId?: number;

  // Discount quantity limits per unit (for splitting logic)
  bigUnitDiscountMinQuantity?: number;
  bigUnitDiscountMaxQuantity?: number;
  smallUnitDiscountMinQuantity?: number;
  smallUnitDiscountMaxQuantity?: number;

  // Special/discounted price
  itemPriceAfterDiscount?: number;

  // Maximum quantity per user
  isMaximumAmountForUser?: boolean;
  maximumAmountForUser?: number;
}

export interface UpdateCartItemRequest {
  itemId: number;
  quantity: number;
  customerUnitId?: number;
  flavourId?: number;           // CRITICAL: For 3-field matching
}

export interface BulkAddRequest {
  items: AddToCartRequest[];
}

// Coupon
export interface CouponValidationResult {
  isValid: boolean;
  couponId?: number;
  discountType: 'Percentage' | 'Fixed';
  discountValue: number;
  maxDiscount?: number;
  minimumOrder?: number;
  message?: string;
}
