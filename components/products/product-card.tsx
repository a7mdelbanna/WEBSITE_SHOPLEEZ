'use client';

/**
 * ProductCard Component - Exact Samokat Design
 *
 * Features:
 * - WHITE background container with rounded corners (16px)
 * - Square image taking full width
 * - Badge at bottom-left of image
 * - Product name (2 lines max)
 * - Weight + promo text in one line
 * - Light pink price button WITHOUT border
 */

import Image from 'next/image';
import { Plus } from 'lucide-react';
import { useLocalization } from '@/lib/hooks/use-tenant';
import { cn } from '@/lib/utils';

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
  onAddToCart?: () => void;
  onClick?: () => void;
  className?: string;
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
}: ProductCardProps) {
  const { isRTL } = useLocalization();

  const displayName = isRTL ? nameAr : name;
  const displayPromo = isRTL ? promoTextAr : promoText;
  const hasDiscount = originalPrice && originalPrice > price;

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.();
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative flex flex-col bg-white rounded-[16px]',
        'cursor-pointer overflow-hidden',
        'transition-all duration-200 hover:shadow-md',
        !isAvailable && 'opacity-60',
        className
      )}
    >
      {/* Image container - square with light gray bg */}
      <div className="relative aspect-square overflow-hidden bg-[#F5F5F5] rounded-t-[16px]">
        <Image
          src={image}
          alt={displayName}
          fill
          className="object-cover transition-transform duration-200 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />

        {/* Badge - Bottom left of image */}
        {badge && (
          <div
            className={cn(
              'absolute bottom-[8px] left-[8px] rounded-[6px] px-[8px] py-[3px] text-[11px] font-semibold',
              badge.variant === 'discount' && 'bg-[#FF4B12] text-white',
              badge.variant === 'tag' && 'bg-[#00B894] text-white',
              badge.variant === 'new' && 'bg-[#6C5CE7] text-white'
            )}
          >
            {isRTL ? badge.textAr : badge.text}
          </div>
        )}
      </div>

      {/* Content section */}
      <div className="flex flex-1 flex-col p-[12px] pt-[10px]">
        {/* Product name - 2 lines max */}
        <h3 className="text-[13px] font-medium text-[#1A1A1A] leading-[1.3] line-clamp-2 mb-[4px]">
          {displayName}
        </h3>

        {/* Weight + Promo text in one line */}
        <div className="flex items-center gap-[4px] text-[12px] mb-[10px]">
          {weight && (
            <span className="text-[#999999]">{weight}</span>
          )}
          {weight && displayPromo && (
            <span className="text-[#999999]">·</span>
          )}
          {displayPromo && (
            <span className="text-[#FF4B12] truncate">{displayPromo}</span>
          )}
        </div>

        {/* Spacer to push price to bottom */}
        <div className="flex-1" />

        {/* Price row - Light pink button WITHOUT border */}
        <div className="flex items-center">
          <div className="flex items-center gap-[6px] h-[32px] px-[12px] rounded-full bg-[#FFF0ED]">
            {/* Original price (strikethrough) */}
            {hasDiscount && (
              <span className="text-[12px] text-[#CCCCCC] line-through">
                {originalPrice}
              </span>
            )}
            {/* Current price */}
            <span className={cn(
              'text-[14px] font-bold',
              hasDiscount ? 'text-[#FF4B12]' : 'text-[#1A1A1A]'
            )}>
              {price} ₽
            </span>

            {/* Plus button */}
            <button
              onClick={handleAddClick}
              disabled={!isAvailable}
              className={cn(
                'flex items-center justify-center ml-[2px]',
                'text-[#FF4B12]',
                'transition-colors',
                'disabled:opacity-40 disabled:cursor-not-allowed'
              )}
            >
              <Plus className="w-[18px] h-[18px]" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Horizontal Product Scroll - Samokat style
 */
export function ProductScroll({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex gap-[8px] overflow-x-auto pb-2 scrollbar-hide',
        '-mx-[24px] px-[24px]',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Product Grid - 4 columns, 8px gap
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
        'grid gap-[8px]',
        'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
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
    <div className="flex flex-col rounded-[16px] bg-white overflow-hidden">
      <div className="aspect-square animate-pulse bg-[#F5F5F5]" />
      <div className="p-[12px]">
        <div className="mb-[8px] h-[32px] animate-pulse rounded bg-[#F5F5F5]" />
        <div className="mb-[10px] h-[14px] w-[80px] animate-pulse rounded bg-[#F5F5F5]" />
        <div className="h-[32px] w-[90px] animate-pulse rounded-full bg-[#FFF0ED]" />
      </div>
    </div>
  );
}

/**
 * Skeleton for horizontal scroll
 */
export function ProductScrollSkeleton({ count = 5 }: { count?: number }) {
  return (
    <ProductScroll>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-[180px] shrink-0">
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
