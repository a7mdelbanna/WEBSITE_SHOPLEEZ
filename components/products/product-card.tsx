'use client';

/**
 * ProductCard Component - Pixel-Perfect Samokat Design
 *
 * Reference: Samokat "Выгодная полка" section
 *
 * Key Design Details:
 * - Light gray card background (#F5F5F7)
 * - DARK badge (not orange!) for discounts
 * - Large product name (15px, semi-bold)
 * - Light pink price pill with strikethrough + current price + plus icon
 * - Smooth hover lift effect
 * - Unit selection toggle (big/small unit)
 *
 * Features:
 * - Full Arabic/English localization
 * - Dynamic currency formatting (EGP for Store 1)
 * - RTL support
 * - Unit selection with smooth animation
 */

import Image from 'next/image';
import { useState } from 'react';
import { useTenant } from '@/lib/hooks/use-tenant';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useAuth } from '@/lib/contexts/auth-context';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils/format';
import type { UnitInfo } from '@/types/product';

interface ProductCardProps {
  id: number;
  name: string;
  nameAr: string;
  image: string;
  price: number;
  originalPrice?: number;
  weight?: string;
  promoText?: string;
  promoTextAr?: string;
  badge?: {
    text: string;
    textAr: string;
    variant: 'discount' | 'tag' | 'new';
  };
  isAvailable?: boolean;
  onAddToCart?: (unitType?: 'big' | 'small') => void;
  onUpdateQuantity?: (quantity: number, unitType?: 'big' | 'small') => void;
  onClick?: () => void;
  className?: string;
  // Unit support
  bigUnit?: UnitInfo;
  smallUnit?: UnitInfo;
  bigUnitImageUrl?: string;
  smallUnitImageUrl?: string;
  // Cart quantity - per unit for 3-field matching
  // Pass both so ProductCard can show correct quantity based on selected unit
  smallUnitCartQuantity?: number;
  bigUnitCartQuantity?: number;
  // Legacy single quantity prop (deprecated, use per-unit quantities)
  cartQuantity?: number;
  isUpdating?: boolean;

  // Maximum quantity per user (Flutter parity)
  isMaximumAmountForUser?: boolean;
  maximumAmountForUser?: number;

  // Stock quantity (for out-of-stock handling)
  itemAmount?: number;

  // Notify Me callback (for out-of-stock items)
  onNotifyMe?: (productId: number) => void;
}

export function ProductCard({
  id,
  name,
  nameAr,
  image,
  price,
  originalPrice,
  weight,
  promoText,
  promoTextAr,
  badge,
  isAvailable = true,
  onAddToCart,
  onUpdateQuantity,
  onClick,
  className,
  bigUnit,
  smallUnit,
  bigUnitImageUrl,
  smallUnitImageUrl,
  // Per-unit cart quantities for 3-field matching
  smallUnitCartQuantity = 0,
  bigUnitCartQuantity = 0,
  // Legacy prop - fallback if per-unit not provided
  cartQuantity: legacyCartQuantity = 0,
  isUpdating = false,
  // New props for Flutter parity
  isMaximumAmountForUser,
  maximumAmountForUser,
  itemAmount,
  onNotifyMe,
}: ProductCardProps) {
  const { tenant, locale } = useTenant();
  const { isRTL, localize, t } = useTranslations();
  const { requireAuth } = useAuth();

  // Unit selection state - default to small unit if available
  const hasMultipleUnits = !!(bigUnit && smallUnit && bigUnit.price !== smallUnit.price);
  const [selectedUnit, setSelectedUnit] = useState<'small' | 'big'>('small');

  // Compute effective unit - handles single-unit products correctly
  // - For multi-unit products: use user's selection
  // - For single-unit products: use whichever unit actually exists
  const effectiveSelectedUnit = hasMultipleUnits
    ? selectedUnit
    : (smallUnit ? 'small' : 'big');

  // Get current unit info based on effective selection
  const currentUnit = effectiveSelectedUnit === 'big' ? bigUnit : smallUnit;

  // Compute cart quantity based on effective selected unit
  // Uses per-unit quantities if provided, falls back to legacy prop
  const cartQuantity = effectiveSelectedUnit === 'big'
    ? (bigUnitCartQuantity || legacyCartQuantity)
    : (smallUnitCartQuantity || legacyCartQuantity);

  // Calculate current price - use simple logic like other widgets:
  // For multiple units: use selected unit price
  // Otherwise: use the price prop (which is already correctly calculated in the service)
  const currentPrice = hasMultipleUnits && currentUnit
    ? currentUnit.price
    : price;
  const currentImage = effectiveSelectedUnit === 'big' ? (bigUnitImageUrl || image) : (smallUnitImageUrl || image);

  const displayName = localize(name, nameAr);
  const displayPromo = localize(promoText || '', promoTextAr || '');
  const displayBadge = badge ? localize(badge.text, badge.textAr) : '';
  const hasDiscount = originalPrice && originalPrice > currentPrice;

  // Get unit names for display - use actual names from API, fallback to translations only if no unit data
  const smallUnitName = smallUnit?.nameAr || smallUnit?.name || (smallUnit ? '' : t('product.smallUnit'));
  const bigUnitName = bigUnit?.nameAr || bigUnit?.name || (bigUnit ? '' : t('product.bigUnit'));

  // For single unit display, determine which unit name to show
  const singleUnitDisplayName = bigUnit?.nameAr || bigUnit?.name || smallUnit?.nameAr || smallUnit?.name || weight || '';

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Check if user is authenticated before adding to cart
    // If not authenticated, the login modal will open
    requireAuth(() => {
      onAddToCart?.(effectiveSelectedUnit);
    });
  };

  const handleUnitToggle = (e: React.MouseEvent, unit: 'small' | 'big') => {
    e.stopPropagation();
    // Simply switch units - cart quantities are tracked per unit via 3-field matching
    // The UI will automatically show the correct quantity for the new unit
    // We don't clear the old unit's cart - user can have both units in cart
    setSelectedUnit(unit);
  };

  // Check if out of stock
  const isOutOfStock = itemAmount !== undefined && itemAmount <= 0;

  // Check if maximum quantity reached (only when increasing)
  const isAtMaxQuantity = isMaximumAmountForUser && maximumAmountForUser
    ? cartQuantity >= maximumAmountForUser
    : false;

  // Final availability check
  const canAddToCart = isAvailable && !isOutOfStock;

  // Handle Notify Me click
  const handleNotifyMe = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNotifyMe?.(id);
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'product-card group relative flex flex-col',
        'bg-white rounded-[20px]',
        'cursor-pointer overflow-hidden',
        !isAvailable && 'opacity-60',
        className
      )}
    >
      {/* Image container - gray background, fully rounded corners */}
      <div className="relative aspect-square overflow-hidden bg-[#F5F5F7] rounded-[16px] m-[6px] mb-0">
        <Image
          src={currentImage}
          alt={displayName}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
          unoptimized
        />

        {/* Discount Badge - DARK background (Samokat style) */}
        {badge && (
          <div
            className={cn(
              'absolute bottom-[12px]',
              isRTL ? 'right-[12px]' : 'left-[12px]',
              'px-[10px] py-[6px] rounded-[8px]',
              'text-[13px] font-semibold text-white',
              // Dark badge for discount (Samokat reference)
              badge.variant === 'discount' && 'bg-[#1F1F1F]',
              badge.variant === 'tag' && 'bg-[#00B894]',
              badge.variant === 'new' && 'bg-[#6C5CE7]'
            )}
          >
            {displayBadge}
          </div>
        )}
      </div>

      {/* Content section - consistent height for all cards */}
      <div className="flex flex-col p-[6px] pt-[5px] bg-white h-[105px]">
        {/* Product name - 11px, 2 lines */}
        <h3 className="text-[11px] font-medium text-[#1A1A1A] leading-[1.3] line-clamp-2 h-[30px] mb-[4px]">
          {displayName}
        </h3>

        {/* Unit Section - Always visible for ALL cards */}
        <div className="h-[20px] mb-[6px] flex items-center justify-center">
          {hasMultipleUnits ? (
            /* Text Toggle with Underline - Variant B */
            <div className="flex items-center gap-[8px]">
              <button
                onClick={(e) => handleUnitToggle(e, 'small')}
                style={{ fontSize: '12px' }}
                className={cn(
                  "font-medium transition-all duration-200 relative pb-[2px]",
                  selectedUnit === 'small'
                    ? "text-[#FF4B12]"
                    : "text-[#999] hover:text-[#666]"
                )}
              >
                {smallUnitName}
                {selectedUnit === 'small' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF4B12] rounded-full" />
                )}
              </button>
              <span style={{ fontSize: '13px' }} className="text-[#E0E0E0]">|</span>
              <button
                onClick={(e) => handleUnitToggle(e, 'big')}
                style={{ fontSize: '12px' }}
                className={cn(
                  "font-medium transition-all duration-200 relative pb-[2px]",
                  selectedUnit === 'big'
                    ? "text-[#FF4B12]"
                    : "text-[#999] hover:text-[#666]"
                )}
              >
                {bigUnitName}
                {selectedUnit === 'big' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF4B12] rounded-full" />
                )}
              </button>
            </div>
          ) : (
            /* Single unit display - using button element for consistent rendering */
            <div className="flex items-center gap-[8px]">
              <button
                type="button"
                style={{ fontSize: '12px' }}
                className="font-medium text-[#FF4B12] relative pb-[2px] cursor-default"
              >
                {singleUnitDisplayName || t('product.bigUnit')}
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF4B12] rounded-full" />
              </button>
            </div>
          )}
        </div>

        {/* Price Button / Quantity Stepper / Notify Me */}
        <div className="mt-auto">
          {isOutOfStock ? (
            /* Notify Me Button - shown when out of stock */
            <button
              onClick={handleNotifyMe}
              className={cn(
                'inline-flex items-center justify-center gap-[4px]',
                'h-[32px] px-[12px] rounded-full',
                'bg-[#FFF3E0] hover:bg-[#FFE0B2]',
                'transition-colors duration-200',
                'text-[#FF6D00] font-medium text-[12px]',
                'whitespace-nowrap'
              )}
            >
              {/* Bell icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {t('product.notifyMe')}
            </button>
          ) : cartQuantity > 0 ? (
            /* Quantity Stepper - shown when item is in cart */
            <div
              className={cn(
                'inline-flex items-center justify-center',
                'h-[32px] rounded-full',
                'bg-[var(--color-primary)] text-white',
                'transition-all duration-200',
                isUpdating && 'opacity-70'
              )}
            >
              {/* Minus button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuantity?.(cartQuantity - 1, effectiveSelectedUnit);
                }}
                disabled={isUpdating}
                className="w-[32px] h-[32px] flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7H11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>

              {/* Quantity */}
              <span className="min-w-[24px] text-center text-[13px] font-bold">
                {cartQuantity}
              </span>

              {/* Plus button - disabled at max quantity */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isAtMaxQuantity) {
                    onUpdateQuantity?.(cartQuantity + 1, effectiveSelectedUnit);
                  }
                }}
                disabled={isUpdating || isAtMaxQuantity}
                className={cn(
                  "w-[32px] h-[32px] flex items-center justify-center rounded-full transition-colors",
                  isAtMaxQuantity
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-white/10"
                )}
                title={isAtMaxQuantity ? t('product.maxQuantityReached') : undefined}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2.5V11.5M2.5 7H11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ) : (
            /* Add to Cart Button - shown when item not in cart */
            <button
              onClick={handleAddClick}
              disabled={!canAddToCart}
              className={cn(
                'inline-flex items-center justify-center',
                'h-[32px] px-[8px] rounded-full',
                'bg-[#F0F0F0] hover:bg-[#E8E8E8]',
                'transition-colors duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'whitespace-nowrap'
              )}
            >
              {/* Original price (strikethrough) */}
              {hasDiscount && (
                <span className={cn(
                  "text-[11px] text-[#BEBEBE] line-through font-normal",
                  isRTL ? "ml-[3px]" : "mr-[3px]"
                )}>
                  {formatPrice(originalPrice, tenant.currency, locale)}
                </span>
              )}

              {/* Current price */}
              <span className="text-[13px] font-bold text-[#1A1A1A]">
                {formatPrice(currentPrice, tenant.currency, locale)}
              </span>

              {/* Plus icon */}
              <span className={cn(
                "flex items-center justify-center",
                isRTL ? "mr-[3px]" : "ml-[3px]"
              )}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 2.5V11.5M2.5 7H11.5"
                    stroke="#1A1A1A"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Horizontal Product Scroll - Samokat style
 * NO negative margins - stays within parent padding
 */
export function ProductScroll({
  children,
  className,
  showArrow = true,
}: {
  children: React.ReactNode;
  className?: string;
  showArrow?: boolean;
}) {
  return (
    <div className="product-scroll-container relative group/scroll">
      <div
        className={cn(
          'flex gap-[12px] overflow-x-auto pb-2 scrollbar-hide',
          'scroll-smooth snap-x snap-mandatory',
          className
        )}
      >
        {children}
      </div>

      {/* Navigation Arrow - Right side (appears on hover) */}
      {showArrow && (
        <button
          className={cn(
            'absolute -right-[22px] top-[35%] -translate-y-1/2 z-10',
            'w-[44px] h-[44px] rounded-full',
            'bg-white shadow-lg border border-[#F0F0F0]',
            'flex items-center justify-center',
            'opacity-0 group-hover/scroll:opacity-100',
            'transition-all duration-200',
            'hover:scale-105 hover:shadow-xl'
          )}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#1A1A1A]"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * Product Grid - 4 columns, 12px gap
 */
export function ProductGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid gap-[12px]',
        'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Skeleton loader for product card
 */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-[20px] bg-white overflow-hidden">
      <div className="aspect-square animate-pulse bg-[#F5F5F7] rounded-[16px] m-[6px] mb-0" />
      <div className="p-[6px] h-[95px] bg-white">
        <div className="mb-[2px] h-[30px] animate-pulse rounded-[6px] bg-[#F0F0F0]" />
        <div className="mb-[4px] h-[13px] w-[30px] animate-pulse rounded-[4px] bg-[#F0F0F0]" />
        <div className="h-[32px] w-[70px] animate-pulse rounded-full bg-[#FFEAE8]" />
      </div>
    </div>
  );
}

/**
 * Skeleton for horizontal scroll
 */
export function ProductScrollSkeleton({ count = 5 }: { count?: number }) {
  return (
    <ProductScroll showArrow={false}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-[140px] shrink-0 snap-start">
          <ProductCardSkeleton />
        </div>
      ))}
    </ProductScroll>
  );
}

/**
 * Skeleton grid
 */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ProductGrid>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </ProductGrid>
  );
}
