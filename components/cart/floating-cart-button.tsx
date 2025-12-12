'use client';

/**
 * Floating Cart Button
 *
 * A fixed-position cart indicator that shows:
 * - Total items in cart
 * - Total price
 * - Click to navigate to cart page
 *
 * Features:
 * - Smooth animation when items are added
 * - Hidden when cart is empty
 * - Responsive positioning
 * - RTL support
 * - SSR-safe: Only renders after hydration to prevent mismatch
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useCart } from '@/lib/services/cart';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useTenant } from '@/lib/hooks/use-tenant';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

export function FloatingCartButton() {
  const { t, isRTL } = useTranslations();
  const { tenant, locale } = useTenant();
  const { data: cart, isLoading } = useCart();

  // Hydration state - prevent SSR mismatch by only rendering after mount
  const [mounted, setMounted] = useState(false);

  // Animation state for when items are added
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevCount, setPrevCount] = useState(0);

  const itemCount = cart?.summary?.totalQuantity || 0;
  const totalPrice = cart?.summary?.total || 0;

  // Set mounted state after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Animate when item count increases
  useEffect(() => {
    if (itemCount > prevCount && prevCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
    setPrevCount(itemCount);
  }, [itemCount, prevCount]);

  // Don't render during SSR to prevent hydration mismatch
  // Cart data differs between server (empty) and client (from localStorage)
  if (!mounted) {
    return null;
  }

  // Don't show if cart is empty
  if (!isLoading && itemCount === 0) {
    return null;
  }

  return (
    <Link
      href="/cart"
      className={cn(
        // Fixed position
        "fixed bottom-[24px] z-50",
        isRTL ? "left-[24px]" : "right-[24px]",
        // Styling
        "flex items-center gap-[12px] px-[16px] h-[56px] rounded-full",
        "bg-[var(--color-primary)] text-white shadow-lg",
        "hover:shadow-xl transition-all duration-200",
        // Animation
        isAnimating && "scale-110",
        "hover:scale-105",
      )}
    >
      {/* Cart Icon with Badge */}
      <div className="relative">
        {isLoading ? (
          <Loader2 className="w-[24px] h-[24px] animate-spin" />
        ) : (
          <>
            <ShoppingCart className="w-[24px] h-[24px]" />
            {/* Item count badge */}
            <span className={cn(
              "absolute -top-[8px] -right-[8px]",
              "min-w-[20px] h-[20px] px-[6px]",
              "flex items-center justify-center",
              "bg-white text-[var(--color-primary)] rounded-full",
              "text-[11px] font-bold",
              isAnimating && "animate-bounce"
            )}>
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          </>
        )}
      </div>

      {/* Price */}
      <div className="flex flex-col items-start">
        <span className="text-[10px] opacity-80 leading-tight">
          {isRTL ? 'المجموع' : 'Total'}
        </span>
        <span className="text-[16px] font-bold leading-tight">
          {formatPrice(totalPrice, tenant.currency, locale)}
        </span>
      </div>

      {/* Arrow indicator */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(isRTL && "rotate-180")}
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}
