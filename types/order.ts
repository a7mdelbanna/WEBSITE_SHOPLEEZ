/**
 * Order Types
 */

export interface OrderItem {
  id: number;
  itemId: number;
  name: string;
  nameAr: string;
  image: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unitName?: string;
  unitNameAr?: string;
  flavorName?: string;
  flavorNameAr?: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'ReadyForDelivery'
  | 'OutForDelivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded';

export interface OrderAddress {
  id: number;
  addressTitle: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
  buildingNumber?: string;
  floorNumber?: string;
  apartmentNumber?: string;
  landmark?: string;
}

export interface Order {
  id: number;
  orderNumber: string;

  // Status
  status: OrderStatus;
  statusHistory: OrderStatusChange[];

  // Items
  items: OrderItem[];
  itemCount: number;

  // Pricing
  subtotal: number;
  discount: number;
  couponDiscount: number;
  deliveryFee: number;
  tip: number;
  total: number;

  // Payment
  paymentMethod: 'CashOnDelivery' | 'Card' | 'Wallet';
  isPaid: boolean;

  // Delivery
  address: OrderAddress;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;

  // Notes
  note?: string;

  // Rating
  rating?: number;
  review?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusChange {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface OrderSummary {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  itemCount: number;
  total: number;
  createdAt: string;
  firstItemImage?: string;
}

// Checkout request
export interface CheckoutRequest {
  id: number;                    // From GetValidId
  addressId: number;
  orderEznMemo?: string;         // Order note
  orderTipVal: number;
  couponDisVal: number;
  deliveryFee: number;
  paymentMethod: number;         // 3 = COD
  inviteeDisVal: number;
  finalAmount: number;
}
