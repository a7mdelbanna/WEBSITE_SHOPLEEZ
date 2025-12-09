'use client';

/**
 * Brand Logos Component - Circular Logo Grid
 *
 * Displays brand/company logos in a beautiful circular grid layout.
 * Features:
 * - Circular logo containers with subtle shadows
 * - Horizontal scrollable on mobile
 * - Grid layout on desktop
 * - Hover effects with scale animation
 * - RTL support
 */

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/lib/hooks/use-translations';
import { Skeleton } from '@/components/ui/skeleton';
import type { HomeBrand } from '@/types/home';

interface BrandLogosProps {
  brands: HomeBrand[];
  isLoading?: boolean;
  className?: string;
}

export function BrandLogos({ brands, isLoading, className }: BrandLogosProps) {
  const { localize, isRTL } = useTranslations();

  if (isLoading) {
    return (
      <div className={cn("flex gap-[16px] overflow-x-auto pb-2 scrollbar-hide", className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <BrandLogoSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!brands || brands.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex gap-[20px] overflow-x-auto pb-2 scrollbar-hide",
        "scroll-smooth snap-x snap-mandatory",
        className
      )}
    >
      {brands.map((brand) => {
        const brandName = localize(brand.name, brand.nameAr || '');
        const logoUrl = brand.logoUrl || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop';

        return (
          <Link
            key={brand.id}
            href={`/brand/${brand.id}`}
            className="group snap-start shrink-0"
          >
            <div className="flex flex-col items-center gap-[8px]">
              {/* Circular logo container */}
              <div className={cn(
                "relative w-[72px] h-[72px] rounded-full overflow-hidden",
                "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]",
                "border border-[#F0F0F0]",
                "transition-all duration-300 ease-out",
                "group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]",
                "group-hover:scale-105",
                "group-hover:border-[#FF4B12]/20"
              )}>
                <Image
                  src={logoUrl}
                  alt={brandName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* Brand name */}
              <span className={cn(
                "text-[11px] font-medium text-[#666666] text-center",
                "max-w-[72px] truncate",
                "transition-colors duration-200",
                "group-hover:text-[#1A1A1A]"
              )}>
                {brandName}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function BrandLogoSkeleton() {
  return (
    <div className="flex flex-col items-center gap-[8px] shrink-0">
      <Skeleton className="w-[72px] h-[72px] rounded-full" />
      <Skeleton className="w-[48px] h-[12px] rounded" />
    </div>
  );
}

/**
 * Compact brand logos for sidebar or smaller sections
 */
export function BrandLogosCompact({ brands, isLoading, className }: BrandLogosProps) {
  const { localize } = useTranslations();

  if (isLoading) {
    return (
      <div className={cn("flex flex-wrap gap-[12px]", className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="w-[56px] h-[56px] rounded-full" />
        ))}
      </div>
    );
  }

  if (!brands || brands.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-[12px]", className)}>
      {brands.slice(0, 12).map((brand) => {
        const brandName = localize(brand.name, brand.nameAr || '');
        const logoUrl = brand.logoUrl || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop';

        return (
          <Link
            key={brand.id}
            href={`/brand/${brand.id}`}
            className="group"
            title={brandName}
          >
            <div className={cn(
              "relative w-[56px] h-[56px] rounded-full overflow-hidden",
              "bg-white shadow-sm border border-[#F0F0F0]",
              "transition-all duration-200",
              "group-hover:shadow-md group-hover:scale-105"
            )}>
              <Image
                src={logoUrl}
                alt={brandName}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
