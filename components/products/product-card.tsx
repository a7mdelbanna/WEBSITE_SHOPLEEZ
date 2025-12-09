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
 */

import Image from 'next/image';
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
        'product-card group relative flex flex-col',
        'bg-white rounded-[20px]',
        'cursor-pointer overflow-hidden',
        'transition-all duration-300 ease-out',
        'hover:shadow-lg hover:-translate-y-[2px]',
        !isAvailable && 'opacity-60',
        className
      )}
    >
      {/* Image container - gray background, rounded top corners */}
      <div className="relative aspect-square overflow-hidden bg-[#F5F5F7] rounded-t-[20px]">
        <Image
          src={image}
          alt={displayName}
          fill
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 50vw, 25vw"
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
            {isRTL ? badge.textAr : badge.text}
          </div>
        )}
      </div>

      {/* Content section - FIXED HEIGHT for uniform cards, WHITE bg */}
      <div className="flex flex-col p-[12px] pt-[10px] h-[120px] bg-white">
        {/* Product name - 13px to match Samokat reference exactly */}
        <h3 className="text-[13px] font-medium text-[#1A1A1A] leading-[1.4] line-clamp-2 h-[38px] mb-[2px]">
          {displayName}
        </h3>

        {/* Weight / Volume - smaller, gray */}
        <div className="h-[18px] mb-[10px]">
          {weight && (
            <span className="text-[13px] text-[#8E8E93]">
              {weight}
            </span>
          )}
          {displayPromo && !weight && (
            <span className="text-[12px] text-[#FF4B12] truncate">
              {displayPromo}
            </span>
          )}
        </div>

        {/* Price Button - pixel-perfect Samokat reference */}
        <div className="mt-auto">
          <button
            onClick={handleAddClick}
            disabled={!isAvailable}
            className={cn(
              'inline-flex items-center justify-center',
              'h-[44px] px-[18px] rounded-full',
              'bg-[#FFEAE8] hover:bg-[#FFE0DD]',
              'transition-colors duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'w-fit'
            )}
          >
            {/* Original price (strikethrough) - medium gray */}
            {hasDiscount && (
              <span className="text-[15px] text-[#BEBEBE] line-through font-normal mr-[8px]">
                {originalPrice}
              </span>
            )}

            {/* Current price - dark/black for contrast */}
            <span className="text-[17px] font-bold text-[#1A1A1A]">
              {price} ₽
            </span>

            {/* Plus icon - elegant, thin stroke like Samokat */}
            <span className="ml-[8px] flex items-center justify-center">
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 4V18M4 11H18"
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
          'flex gap-[16px] overflow-x-auto pb-2 scrollbar-hide',
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
      <div className="aspect-square animate-pulse bg-[#F5F5F7] rounded-t-[20px]" />
      <div className="p-[12px] h-[120px] bg-white">
        <div className="mb-[4px] h-[38px] animate-pulse rounded-[6px] bg-[#F0F0F0]" />
        <div className="mb-[10px] h-[16px] w-[50px] animate-pulse rounded-[4px] bg-[#F0F0F0]" />
        <div className="h-[36px] w-[100px] animate-pulse rounded-full bg-[#FEEEEE]" />
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
        <div key={i} className="w-[200px] shrink-0 snap-start">
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
