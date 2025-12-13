'use client';

/**
 * Cart Page - LOCAL-FIRST Cart Management
 *
 * Following Flutter Order Flow Documentation:
 * - All cart operations are LOCAL (no API calls)
 * - Data comes from local cart store (Zustand + localStorage)
 * - Server sync happens ONLY on checkout
 *
 * Features:
 * - Cart items list with images and names
 * - Quantity controls (+/-)
 * - Remove item functionality
 * - Cart summary (subtotal, delivery, total)
 * - Proceed to Checkout button
 * - Empty cart state
 * - RTL support
 */

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart, Trash2, Plus, Minus, X,
  ArrowLeft, ArrowRight, ShoppingBag
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { AppShell } from '@/components/layout';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useCurrency } from '@/lib/hooks/use-tenant';
import { useAuth } from '@/lib/contexts/auth-context';
import { formatPrice } from '@/lib/utils/format';
import {
  useCartStore,
  useLocalCartItems,
  useCartTotalQuantity,
  useCartSubtotal,
} from '@/lib/stores/cart-store';
import { useEnrichCartItems } from '@/lib/hooks/use-cart-enrichment';
import { cn } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const { t, isRTL, locale } = useTranslations();
  const currency = useCurrency();
  const { isAuthenticated, requireAuth } = useAuth();

  // LOCAL-FIRST: Get cart data from local store (NO API calls)
  const cartItems = useLocalCartItems();
  const totalQuantity = useCartTotalQuantity();
  const subtotal = useCartSubtotal();
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  // Auto-enrich cart items that are missing metadata (name, image, etc.)
  const { isEnriching, itemsNeedingEnrichment } = useEnrichCartItems();

  // Confirm dialog state
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const isEmpty = cartItems.length === 0;

  // Handle quantity change - LOCAL ONLY
  const handleQuantityChange = (
    itemId: number,
    unitId: number | undefined,
    flavorId: number | undefined,
    delta: number,
    currentQty: number
  ) => {
    const newQuantity = currentQty + delta;
    if (newQuantity <= 0) {
      removeItem(itemId, unitId, flavorId);
    } else {
      updateQuantity(itemId, unitId, flavorId, newQuantity);
    }
  };

  // Handle remove item - LOCAL ONLY
  const handleRemoveItem = (
    itemId: number,
    unitId?: number,
    flavorId?: number
  ) => {
    removeItem(itemId, unitId, flavorId);
  };

  // Handle clear cart - LOCAL ONLY
  const handleClearCart = () => {
    setShowClearConfirm(true);
  };

  // Confirm clear cart
  const confirmClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
  };

  // Handle proceed to checkout
  const handleCheckout = () => {
    console.log('[Cart] handleCheckout called');
    console.log('[Cart] isAuthenticated:', isAuthenticated);

    if (!isAuthenticated) {
      console.log('[Cart] Not authenticated, opening login modal');
      requireAuth(() => {
        console.log('[Cart] Auth callback - navigating to checkout');
        router.push('/checkout');
      });
      return;
    }

    console.log('[Cart] Navigating to checkout...');
    router.push('/checkout');
  };

  // Calculate summary (local calculation)
  const deliveryFee = 0; // Will be calculated on checkout based on address
  const discount = 0; // Will be calculated from coupons on checkout
  const total = subtotal + deliveryFee - discount;

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <AppShell>
      <div className="flex-1 min-w-0 bg-white rounded-2xl px-6 py-6 mx-2 my-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F5F5F7] hover:bg-[#ECECEC] transition-colors"
            >
              <BackIcon className="w-5 h-5 text-[#1A1A1A]" />
            </Link>
            <h1 className="text-[28px] font-bold text-[#1A1A1A]">
              {isRTL ? 'سلة التسوق' : 'Shopping Cart'}
            </h1>
            {!isEmpty && (
              <span className="text-[14px] text-[#6B7280]">
                ({totalQuantity} {isRTL ? 'منتج' : 'items'})
                {isEnriching && itemsNeedingEnrichment > 0 && (
                  <span className="ml-2 text-[12px] text-blue-500 animate-pulse">
                    {isRTL ? 'جاري التحميل...' : 'Loading details...'}
                  </span>
                )}
              </span>
            )}
          </div>
          {!isEmpty && (
            <button
              onClick={handleClearCart}
              className="flex items-center gap-2 px-4 py-2 text-[14px] text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {isRTL ? 'مسح الكل' : 'Clear All'}
            </button>
          )}
        </div>

        {/* Empty Cart State */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-[#F5F5F7] flex items-center justify-center mb-6">
              <ShoppingBag className="w-12 h-12 text-[#9CA3AF]" />
            </div>
            <h2 className="text-[20px] font-semibold text-[#1A1A1A] mb-2">
              {isRTL ? 'سلة التسوق فارغة' : 'Your cart is empty'}
            </h2>
            <p className="text-[14px] text-[#6B7280] mb-6 text-center max-w-sm">
              {isRTL
                ? 'ابدأ التسوق وأضف المنتجات إلى سلتك'
                : 'Start shopping and add products to your cart'}
            </p>
            <Link
              href="/"
              className="px-6 py-3 rounded-full text-white font-medium"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {isRTL ? 'تصفح المنتجات' : 'Browse Products'}
            </Link>
          </div>
        )}

        {/* Cart Content */}
        {!isEmpty && (
          <div className="flex gap-8">
            {/* Cart Items */}
            <div className="flex-1 space-y-4">
              {cartItems.map((item, index) => {
                const itemName = isRTL ? (item.nameAr || item.name) : item.name;
                const hasDiscount = item.discountedUnitPrice && item.discountedUnitPrice < item.unitPrice;

                return (
                  <div
                    key={`${item.itemId}-${item.selectedUnitId}-${item.selectedFlavorId}-${index}`}
                    className="flex gap-4 p-4 rounded-[16px] bg-[#F9FAFB] transition-opacity"
                  >
                    {/* Product Image */}
                    <div className="w-[100px] h-[100px] rounded-[12px] bg-white overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={itemName || 'Product'}
                          width={100}
                          height={100}
                          className="w-full h-full object-contain"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-8 h-8 text-[#D1D5DB]" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "text-[16px] font-semibold text-[#1A1A1A] line-clamp-2 mb-1",
                        isRTL && "text-right"
                      )}>
                        {itemName || (isRTL ? 'منتج' : 'Product')}
                      </h3>

                      {/* Unit/Flavor info */}
                      {(item.selectedUnit || item.selectedFlavorName) && (
                        <p className={cn(
                          "text-[13px] text-[#6B7280] mb-2",
                          isRTL && "text-right"
                        )}>
                          {item.selectedUnit && (isRTL ? item.selectedUnit.nameAr : item.selectedUnit.name)}
                          {item.selectedFlavorName && ` - ${item.selectedFlavorName}`}
                        </p>
                      )}

                      {/* Price */}
                      <div className={cn(
                        "flex items-center gap-2 mb-3",
                        isRTL && "flex-row-reverse justify-end"
                      )}>
                        <span
                          className="text-[16px] font-bold"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          {formatPrice(item.discountedUnitPrice || item.unitPrice, currency, locale)}
                        </span>
                        {hasDiscount && (
                          <span className="text-[13px] text-[#9CA3AF] line-through">
                            {formatPrice(item.unitPrice, currency, locale)}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className={cn(
                        "flex items-center gap-3",
                        isRTL && "flex-row-reverse justify-end"
                      )}>
                        <div className="flex items-center gap-1 bg-white rounded-full border border-[#E5E5E5]">
                          <button
                            onClick={() => handleQuantityChange(
                              item.itemId,
                              item.selectedUnitId,
                              item.selectedFlavorId,
                              -1,
                              item.quantity
                            )}
                            className="w-8 h-8 flex items-center justify-center hover:bg-[#F5F5F5] rounded-full transition-colors"
                          >
                            {item.quantity === 1 ? (
                              <X className="w-4 h-4 text-red-400" />
                            ) : (
                              <Minus className="w-4 h-4 text-[#6B7280]" />
                            )}
                          </button>
                          <span className="w-8 text-center text-[15px] font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(
                              item.itemId,
                              item.selectedUnitId,
                              item.selectedFlavorId,
                              1,
                              item.quantity
                            )}
                            className="w-8 h-8 flex items-center justify-center hover:bg-[#F5F5F5] rounded-full transition-colors"
                          >
                            <Plus className="w-4 h-4 text-[#6B7280]" />
                          </button>
                        </div>

                        {/* Total for this item */}
                        <span className="text-[14px] text-[#6B7280]">
                          = {formatPrice(item.totalPrice, currency, locale)}
                        </span>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.itemId, item.selectedUnitId, item.selectedFlavorId)}
                      className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-400 hover:text-red-500" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary - Fixed Sidebar */}
            <div className="w-[320px] flex-shrink-0">
              <div className="sticky top-4 bg-[#F9FAFB] rounded-[20px] p-6">
                <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-4">
                  {isRTL ? 'ملخص الطلب' : 'Order Summary'}
                </h2>

                <div className="space-y-3 mb-6">
                  {/* Subtotal */}
                  <div className={cn(
                    "flex justify-between text-[14px]",
                    isRTL && "flex-row-reverse"
                  )}>
                    <span className="text-[#6B7280]">
                      {isRTL ? 'المجموع الفرعي' : 'Subtotal'}
                    </span>
                    <span className="font-medium text-[#1A1A1A]">
                      {formatPrice(subtotal, currency, locale)}
                    </span>
                  </div>

                  {/* Discount */}
                  {discount > 0 && (
                    <div className={cn(
                      "flex justify-between text-[14px]",
                      isRTL && "flex-row-reverse"
                    )}>
                      <span className="text-[#6B7280]">
                        {isRTL ? 'الخصم' : 'Discount'}
                      </span>
                      <span className="font-medium text-green-600">
                        -{formatPrice(discount, currency, locale)}
                      </span>
                    </div>
                  )}

                  {/* Delivery Fee */}
                  <div className={cn(
                    "flex justify-between text-[14px]",
                    isRTL && "flex-row-reverse"
                  )}>
                    <span className="text-[#6B7280]">
                      {isRTL ? 'رسوم التوصيل' : 'Delivery Fee'}
                    </span>
                    <span className="font-medium text-[#1A1A1A]">
                      {deliveryFee > 0
                        ? formatPrice(deliveryFee, currency, locale)
                        : (isRTL ? 'يحسب عند الدفع' : 'Calculated at checkout')}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-[#E5E5E5] pt-4 mb-6">
                  <div className={cn(
                    "flex justify-between",
                    isRTL && "flex-row-reverse"
                  )}>
                    <span className="text-[16px] font-bold text-[#1A1A1A]">
                      {isRTL ? 'الإجمالي' : 'Total'}
                    </span>
                    <span
                      className="text-[20px] font-bold"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      {formatPrice(total, currency, locale)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full h-[52px] rounded-full text-white text-[16px] font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {isRTL ? 'متابعة الدفع' : 'Proceed to Checkout'}
                </button>

                {/* Continue Shopping Link */}
                <Link
                  href="/"
                  className="block text-center mt-4 text-[14px] text-[#6B7280] hover:text-[var(--color-primary)] transition-colors"
                >
                  {isRTL ? 'متابعة التسوق' : 'Continue Shopping'}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clear Cart Confirmation Dialog */}
      <ConfirmDialog
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        title={isRTL ? 'مسح سلة التسوق' : 'Clear Shopping Cart'}
        description={
          isRTL
            ? 'هل أنت متأكد من رغبتك في مسح جميع المنتجات من السلة؟ لا يمكن التراجع عن هذا الإجراء.'
            : 'Are you sure you want to remove all items from your cart? This action cannot be undone.'
        }
        confirmText={isRTL ? 'مسح الكل' : 'Clear All'}
        cancelText={isRTL ? 'إلغاء' : 'Cancel'}
        variant="danger"
        onConfirm={confirmClearCart}
        isRTL={isRTL}
      />
    </AppShell>
  );
}
