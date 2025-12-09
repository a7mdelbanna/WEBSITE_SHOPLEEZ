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
  onClick?: () => void;
  className?: string;
  // Unit support
  bigUnit?: UnitInfo;
  smallUnit?: UnitInfo;
  bigUnitImageUrl?: string;
  smallUnitImageUrl?: string;
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
  onClick,
  className,
  bigUnit,
  smallUnit,
  bigUnitImageUrl,
  smallUnitImageUrl,
}: ProductCardProps) {
  const { tenant, locale } = useTenant();
  const { isRTL, localize, t } = useTranslations();

  // Unit selection state - default to small unit if available
  const hasMultipleUnits = !!(bigUnit && smallUnit && bigUnit.price !== smallUnit.price);
  const [selectedUnit, setSelectedUnit] = useState<'small' | 'big'>('small');

  // Get current unit info based on selection
  const currentUnit = selectedUnit === 'big' ? bigUnit : smallUnit;
  const currentPrice = currentUnit?.price || price;
  const currentImage = selectedUnit === 'big' ? (bigUnitImageUrl || image) : (smallUnitImageUrl || image);

  const displayName = localize(name, nameAr);
  const displayPromo = localize(promoText || '', promoTextAr || '');
  const displayBadge = badge ? localize(badge.text, badge.textAr) : '';
  const hasDiscount = originalPrice && originalPrice > currentPrice;

  // Get unit names for display
  const smallUnitName = smallUnit ? localize(smallUnit.name, smallUnit.nameAr) : t('product.smallUnit');
  const bigUnitName = bigUnit ? localize(bigUnit.name, bigUnit.nameAr) : t('product.bigUnit');

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(selectedUnit);
  };

  const handleUnitToggle = (e: React.MouseEvent, unit: 'small' | 'big') => {
    e.stopPropagation();
    setSelectedUnit(unit);
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
                {bigUnitName || smallUnitName || weight || ''}
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF4B12] rounded-full" />
              </button>
            </div>
          )}
        </div>

        {/* Price Button */}
        <div className="mt-auto">
          <button
            onClick={handleAddClick}
            disabled={!isAvailable}
            className={cn(
              'inline-flex items-center justify-center',
              'h-[32px] px-[8px] rounded-full',
              'bg-[#FFEAE8] hover:bg-[#FFE0DD]',
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
                  stroke="#F27D7D"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </button>
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
