'use client';

/**
 * Floating Cart Component
 *
 * Features:
 * - Shows cart item count badge
 * - Hover to preview cart items
 * - Click to navigate to cart page
 * - Uses LOCAL cart store (no API calls)
 * - Animated dropdown with item previews
 */

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, ChevronRight, Minus, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useCurrency } from '@/lib/hooks/use-tenant';
import { formatPrice } from '@/lib/utils/format';
import { useCartStore, useLocalCartItems, useCartTotalQuantity, useCartSubtotal } from '@/lib/stores/cart-store';

export function FloatingCart() {
  const { t, isRTL, locale } = useTranslations();
  const currency = useCurrency();
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // LOCAL cart data
  const cartItems = useLocalCartItems();
  const totalQuantity = useCartTotalQuantity();
  const subtotal = useCartSubtotal();
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  // Handle mouse enter with delay
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(true);
  };

  // Handle mouse leave with delay
  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 200);
  };

  // Handle quantity change
  const handleQuantityChange = (itemId: number, unitId: number | undefined, flavorId: number | undefined, newQty: number) => {
    if (newQty <= 0) {
      removeItem(itemId, unitId, flavorId);
    } else {
      updateQuantity(itemId, unitId, flavorId, newQty);
    }
  };

  // Get unique items (grouped by itemId for display, limited to 3)
  const displayItems = cartItems.slice(0, 4);
  const hasMoreItems = cartItems.length > 4;

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Cart Button */}
      <Link
        href="/cart"
        className={cn(
          "relative flex items-center justify-center w-[48px] h-[48px] rounded-full transition-all duration-200",
          isHovered
            ? "bg-[var(--color-primary)] text-white scale-105"
            : "bg-[var(--color-bg-page)] text-[var(--color-text-primary)] hover:bg-[var(--color-gray-200)]"
        )}
        aria-label={t('common.cart')}
      >
        <ShoppingCart className="h-[20px] w-[20px]" strokeWidth={2} />
        {totalQuantity > 0 && (
          <span
            className={cn(
              "absolute -top-[2px] -right-[2px] min-w-[20px] h-[20px] flex items-center justify-center rounded-full text-[11px] font-bold px-[5px] transition-all duration-200",
              isHovered
                ? "bg-white text-[var(--color-primary)]"
                : "bg-[var(--color-primary)] text-white"
            )}
          >
            {totalQuantity > 99 ? '99+' : totalQuantity}
          </span>
        )}
      </Link>

      {/* Hover Dropdown */}
      {isHovered && totalQuantity > 0 && (
        <div
          className={cn(
            "absolute top-full mt-[8px] w-[360px] bg-white rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.15)] border border-[var(--color-border-light)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200",
            isRTL ? "left-0" : "right-0"
          )}
        >
          {/* Header */}
          <div className="px-[20px] py-[16px] border-b border-[var(--color-border-light)]">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[var(--color-text-primary)]">
                {t('cart.title')}
              </h3>
              <span className="text-[13px] text-[var(--color-text-tertiary)]">
                {totalQuantity} {isRTL ? 'منتج' : 'items'}
              </span>
            </div>
          </div>

          {/* Cart Items Preview */}
          <div className="max-h-[280px] overflow-y-auto">
            {displayItems.map((item, index) => (
              <div
                key={`${item.itemId}-${item.selectedUnitId}-${item.selectedFlavorId}-${index}`}
                className="flex items-center gap-[12px] px-[20px] py-[12px] border-b border-[var(--color-border-ultralight)] last:border-0 hover:bg-[var(--color-bg-page)] transition-colors"
              >
                {/* Item Image */}
                <div className="w-[56px] h-[56px] bg-[var(--color-bg-page)] rounded-[12px] shrink-0 overflow-hidden relative">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={isRTL ? (item.nameAr || item.name) : item.name}
                      fill
                      className="object-contain p-[4px]"
                      sizes="56px"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="w-[20px] h-[20px] text-[var(--color-gray-300)]" />
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-[13px] font-medium text-[var(--color-text-primary)] line-clamp-1",
                    isRTL && "text-right"
                  )}>
                    {isRTL ? (item.nameAr || item.name) : item.name}
                  </p>
                  <div className={cn(
                    "flex items-center gap-[8px] mt-[4px]",
                    isRTL && "flex-row-reverse"
                  )}>
                    <span className="text-[14px] font-bold text-[var(--color-primary)]">
                      {formatPrice(item.discountedUnitPrice || item.unitPrice, currency, locale)}
                    </span>
                    {item.discountedUnitPrice && item.discountedUnitPrice < item.unitPrice && (
                      <span className="text-[11px] text-[var(--color-text-tertiary)] line-through">
                        {formatPrice(item.unitPrice, currency, locale)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-[4px] shrink-0">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleQuantityChange(item.itemId, item.selectedUnitId, item.selectedFlavorId, item.quantity - 1);
                    }}
                    className="w-[28px] h-[28px] rounded-full bg-[var(--color-bg-page)] flex items-center justify-center hover:bg-[var(--color-gray-200)] transition-colors"
                  >
                    {item.quantity === 1 ? (
                      <X className="w-[14px] h-[14px] text-[var(--color-error)]" />
                    ) : (
                      <Minus className="w-[14px] h-[14px] text-[var(--color-text-secondary)]" />
                    )}
                  </button>
                  <span className="w-[24px] text-center text-[14px] font-semibold text-[var(--color-text-primary)]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleQuantityChange(item.itemId, item.selectedUnitId, item.selectedFlavorId, item.quantity + 1);
                    }}
                    className="w-[28px] h-[28px] rounded-full bg-[var(--color-primary)] flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-[14px] h-[14px] text-white" />
                  </button>
                </div>
              </div>
            ))}

            {/* More items indicator */}
            {hasMoreItems && (
              <div className="px-[20px] py-[12px] text-center">
                <span className="text-[13px] text-[var(--color-text-tertiary)]">
                  +{cartItems.length - 4} {isRTL ? 'منتجات أخرى' : 'more items'}
                </span>
              </div>
            )}
          </div>

          {/* Footer with Total and CTA */}
          <div className="px-[20px] py-[16px] bg-[var(--color-bg-page)] border-t border-[var(--color-border-light)]">
            {/* Subtotal */}
            <div className={cn(
              "flex items-center justify-between mb-[12px]",
              isRTL && "flex-row-reverse"
            )}>
              <span className="text-[14px] text-[var(--color-text-secondary)]">
                {t('cart.subtotal')}
              </span>
              <span className="text-[18px] font-bold text-[var(--color-text-primary)]">
                {formatPrice(subtotal, currency, locale)}
              </span>
            </div>

            {/* Go to Cart Button */}
            <Link
              href="/cart"
              className={cn(
                "flex items-center justify-center gap-[8px] w-full h-[48px] rounded-full text-white text-[15px] font-semibold transition-all hover:opacity-90 hover:scale-[1.02]",
                isRTL && "flex-row-reverse"
              )}
              style={{ background: 'var(--gradient-primary)' }}
            >
              {t('cart.checkout')}
              <ChevronRight className={cn("w-[18px] h-[18px]", isRTL && "rotate-180")} />
            </Link>
          </div>
        </div>
      )}

      {/* Empty Cart Dropdown */}
      {isHovered && totalQuantity === 0 && (
        <div
          className={cn(
            "absolute top-full mt-[8px] w-[280px] bg-white rounded-[16px] shadow-[0_8px_40px_rgba(0,0,0,0.15)] border border-[var(--color-border-light)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200",
            isRTL ? "left-0" : "right-0"
          )}
        >
          <div className="p-[24px] text-center">
            <div className="w-[64px] h-[64px] mx-auto mb-[12px] bg-[var(--color-bg-page)] rounded-full flex items-center justify-center">
              <ShoppingCart className="w-[28px] h-[28px] text-[var(--color-gray-300)]" />
            </div>
            <p className="text-[15px] font-medium text-[var(--color-text-primary)] mb-[4px]">
              {t('cart.empty')}
            </p>
            <p className="text-[13px] text-[var(--color-text-tertiary)]">
              {t('cart.emptyMessage')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default FloatingCart;
