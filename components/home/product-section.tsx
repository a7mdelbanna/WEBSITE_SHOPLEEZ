'use client';

/**
 * Product Section Component
 *
 * Reusable section for displaying products in a horizontal scroll.
 * Used for: Widgets, Special Offers, Spotlight, Discounts, etc.
 *
 * Features:
 * - Section header with title and "See All" link
 * - Horizontal product scroll
 * - Loading skeleton state
 * - Empty state handling
 * - RTL support
 */

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ProductCard, ProductScroll, ProductScrollSkeleton } from '@/components/products/product-card';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/lib/hooks/use-translations';
import type { ProductSummary } from '@/types/product';
import type { ProductDetailData } from '@/components/products/product-detail-modal';

interface ProductSectionProps {
  title: string;
  titleAr?: string;
  products: ProductSummary[];
  isLoading?: boolean;
  seeAllLink?: string;
  seeAllText?: string;
  onProductClick?: (product: ProductDetailData) => void;
  onAddToCart?: (productId: number) => void;
  className?: string;
  emptyText?: string;
}

export function ProductSection({
  title,
  titleAr,
  products,
  isLoading,
  seeAllLink,
  seeAllText,
  onProductClick,
  onAddToCart,
  className,
  emptyText,
}: ProductSectionProps) {
  const { t, isRTL, localize } = useTranslations();

  const displayTitle = localize(title, titleAr || title);
  const displaySeeAll = seeAllText || t('common.seeAll');
  const displayEmpty = emptyText || t('common.noProducts');

  const handleProductClick = (product: ProductSummary) => {
    if (!onProductClick) return;

    onProductClick({
      id: product.id,
      name: product.nameEn || product.name,
      nameAr: product.nameAr || product.name,
      image: product.imageUrl || product.mainImage || '',
      price: product.price,
      originalPrice: product.originalPrice || product.discountPrice,
      volume: product.volume || product.weight,
      description: product.descriptionEn || product.description,
      descriptionAr: product.descriptionAr,
      brand: product.brandName,
      brandAr: product.brandNameAr,
      productType: product.categoryName,
      productTypeAr: product.categoryNameAr,
    });
  };

  return (
    <section className={cn("mb-[48px]", className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-[20px]">
        <h2 className="text-[24px] font-bold text-[#1A1A1A] leading-none">
          {displayTitle}
        </h2>
        {seeAllLink && (
          <Link
            href={seeAllLink}
            className={cn(
              "flex items-center gap-[4px] text-[14px] font-medium text-[#1A1A1A] hover:text-[#FF4B12] transition-colors",
              isRTL && "flex-row-reverse"
            )}
          >
            {displaySeeAll}
            <ChevronRight className={cn("w-[16px] h-[16px]", isRTL && "rotate-180")} strokeWidth={2} />
          </Link>
        )}
      </div>

      {/* Product Scroll */}
      {isLoading ? (
        <ProductScrollSkeleton count={6} />
      ) : products && products.length > 0 ? (
        <ProductScroll>
          {products.map((product) => (
            <div key={product.id} className="w-[140px] shrink-0 snap-start">
              <ProductCard
                id={product.id}
                name={product.nameEn || product.name}
                nameAr={product.nameAr || product.name}
                image={product.imageUrl || product.mainImage || ''}
                price={product.price}
                originalPrice={product.originalPrice || product.discountPrice}
                weight={product.volume || product.weight}
                badge={product.discountPercent ? {
                  text: `-${product.discountPercent}%`,
                  textAr: `${product.discountPercent}%-`,
                  variant: 'discount' as const,
                } : undefined}
                onAddToCart={() => onAddToCart?.(product.id)}
                onClick={() => handleProductClick(product)}
                // Unit support
                bigUnit={product.bigUnit}
                smallUnit={product.smallUnit}
                bigUnitImageUrl={product.bigUnitImageUrl}
                smallUnitImageUrl={product.smallUnitImageUrl}
              />
            </div>
          ))}
        </ProductScroll>
      ) : (
        <div className="text-center py-[32px] text-[#9CA3AF]">
          {displayEmpty}
        </div>
      )}
    </section>
  );
}
