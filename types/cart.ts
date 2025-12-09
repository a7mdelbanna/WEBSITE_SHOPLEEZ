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
  unitPrice: number;             // Price per unit
  discountedUnitPrice?: number;  // Discounted price per unit
  totalPrice: number;            // quantity * price

  // Selected options
  selectedUnitId?: number;
  selectedUnit?: CartItemUnit;
  selectedFlavorId?: number;
  selectedFlavorName?: string;

  // Discount info
  discountQuantity?: number;
  maxDiscountQuantity?: number;

  // Stock status
  isAvailable: boolean;
  availableQuantity?: number;
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
}

export interface UpdateCartItemRequest {
  itemId: number;
  quantity: number;
  customerUnitId?: number;
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
