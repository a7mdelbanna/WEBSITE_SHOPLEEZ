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
 * - LOCAL-FIRST cart: All operations are local, NO API calls
 *   (Following Flutter Order Flow Documentation)
 */

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ProductCard, ProductScroll, ProductScrollSkeleton } from '@/components/products/product-card';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/lib/hooks/use-translations';
import { getCartItemKey } from '@/lib/services/cart';
import { useCartStore, useLocalCartItems } from '@/lib/stores/cart-store';
import type { ProductSummary } from '@/types/product';
import type { ProductDetailData } from '@/components/products/product-detail-modal';
import { useMemo, useCallback } from 'react';

interface ProductSectionProps {
  title: string;
  titleAr?: string;
  products: ProductSummary[];
  isLoading?: boolean;
  seeAllLink?: string;
  seeAllText?: string;
  onProductClick?: (product: ProductDetailData) => void;
  onAddToCart?: (product: ProductSummary, unitType?: 'big' | 'small') => void;
  className?: string;
  emptyText?: string;
  /** Unique ID for this section to prevent duplicate React keys when same product appears in multiple sections */
  sectionId?: string;
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
  sectionId,
}: ProductSectionProps) {
  const { t, isRTL, localize } = useTranslations();

  // LOCAL-FIRST: Get cart data from local store (NO API calls)
  const localCartItems = useLocalCartItems();
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  // Create a map using 3-field key (itemId-unitId-flavorId) to cart quantity
  // This reads from LOCAL store, not server
  const quantityMap = useMemo(() => {
    const map = new Map<string, number>();
    localCartItems.forEach(item => {
      // Use 3-field key for proper matching
      const key = getCartItemKey(item.itemId, item.selectedUnitId, item.selectedFlavorId);
      // Aggregate quantities for same key (in case of split items from discount splitting)
      const existing = map.get(key) || 0;
      map.set(key, existing + item.quantity);
    });
    return map;
  }, [localCartItems]);

  // Get display quantity for a specific product+unit combination
  // Uses 3-field key for proper matching - reads from LOCAL store
  const getDisplayQuantity = useCallback((productId: number, unitId?: number, flavorId?: number): number => {
    const key = getCartItemKey(productId, unitId, flavorId);
    return quantityMap.get(key) || 0;
  }, [quantityMap]);

  // Handle add to cart - LOCAL ONLY, NO API call
  const handleLocalAddToCart = useCallback((product: ProductSummary, unitType?: 'big' | 'small') => {
    // Get the correct unit based on unitType
    const selectedUnit = unitType === 'big' ? product.bigUnit : (product.smallUnit || product.bigUnit);
    const unitId = selectedUnit?.id;
    const unitPrice = selectedUnit?.price || product.price;
    const discountPrice = selectedUnit?.specialPrice || product.discountPrice;

    console.log('[ProductSection] LOCAL add to cart:', {
      productId: product.id,
      unitType,
      unitId,
      unitPrice,
      discountPrice,
    });

    // Add to LOCAL cart (instant, no API call)
    addItem({
      itemId: product.id,
      quantity: 1,
      customerUnitId: unitId,
      itemUnitId: unitId,
      normalPrice: unitPrice,
      itemPriceAfterDiscount: discountPrice,
      // Product metadata for display in cart
      name: product.nameEn || product.name,
      nameAr: product.nameAr || product.name,
      image: product.imageUrl || product.mainImage || '',
      // Pass discount limits for splitting logic
      bigUnitId: product.bigUnit?.id,
      smallUnitId: product.smallUnit?.id,
      bigUnitDiscountMinQuantity: product.bigUnitDiscountMinQuantity,
      bigUnitDiscountMaxQuantity: product.bigUnitDiscountMaxQuantity,
      smallUnitDiscountMinQuantity: product.smallUnitDiscountMinQuantity,
      smallUnitDiscountMaxQuantity: product.smallUnitDiscountMaxQuantity,
      // Maximum quantity limits
      isMaximumAmountForUser: product.isMaximumAmountForUser,
      maximumAmountForUser: product.maximumAmountForUser,
    });

    // Also call parent handler if provided (for toast notifications, etc.)
    onAddToCart?.(product, unitType);
  }, [addItem, onAddToCart]);

  // Handle quantity update - LOCAL ONLY, NO API call
  const handleLocalUpdateQuantity = useCallback((
    product: ProductSummary,
    newQuantity: number,
    unitType?: 'big' | 'small'
  ) => {
    const productId = product.id;
    // Get the correct unit based on unitType
    const selectedUnit = unitType === 'big' ? product.bigUnit : (product.smallUnit || product.bigUnit);
    const unitId = selectedUnit?.id;

    console.log('[ProductSection] LOCAL update quantity:', {
      productId,
      newQuantity,
      unitType,
      unitId,
    });

    if (newQuantity <= 0) {
      // Remove item from LOCAL cart
      removeItem(productId, unitId, undefined);
    } else {
      // Update quantity in LOCAL cart
      updateQuantity(productId, unitId, undefined, newQuantity);
    }
  }, [updateQuantity, removeItem]);

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
      // Unit support
      bigUnit: product.bigUnit,
      smallUnit: product.smallUnit,
      bigUnitPrice: product.bigUnit?.price,
      smallUnitPrice: product.smallUnit?.price,
      bigUnitImageUrl: product.bigUnitImageUrl,
      smallUnitImageUrl: product.smallUnitImageUrl,
      // Stock & availability validation
      isAvailable: product.isAvailable,
      itemAmount: product.itemAmount,
      isMaximumAmountForUser: product.isMaximumAmountForUser,
      maximumAmountForUser: product.maximumAmountForUser,
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
          {products.map((product, index) => {
            // Get per-unit quantities using 3-field matching from LOCAL store
            const smallUnitId = product.smallUnit?.id;
            const bigUnitId = product.bigUnit?.id;

            // Check for quantities with proper unit IDs
            const smallQty = smallUnitId ? getDisplayQuantity(product.id, smallUnitId, undefined) : 0;
            const bigQty = bigUnitId ? getDisplayQuantity(product.id, bigUnitId, undefined) : 0;

            // CRITICAL: Also check for cart items added WITHOUT unit IDs (old items)
            // These use key "productId-0-0" (unitId = undefined → 0)
            const legacyQty = getDisplayQuantity(product.id, undefined, undefined);

            // Total quantity = sum of all matching methods
            // This ensures we find items regardless of how they were added to cart
            const totalSmallQty = smallQty + (smallUnitId ? 0 : legacyQty);
            const totalBigQty = bigQty + (bigUnitId ? 0 : legacyQty);
            // For products without units, use legacy quantity directly
            const hasUnits = smallUnitId || bigUnitId;
            const noUnitQty = !hasUnits ? legacyQty : 0;

            return (
              <div key={sectionId ? `${sectionId}-${product.id}` : `${title}-${index}-${product.id}`} className="w-[140px] shrink-0 snap-start">
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
                  onAddToCart={(unitType) => handleLocalAddToCart(product, unitType)}
                  onUpdateQuantity={(quantity, unitType) => handleLocalUpdateQuantity(product, quantity, unitType)}
                  onClick={() => handleProductClick(product)}
                  // Unit support
                  bigUnit={product.bigUnit}
                  smallUnit={product.smallUnit}
                  bigUnitImageUrl={product.bigUnitImageUrl}
                  smallUnitImageUrl={product.smallUnitImageUrl}
                  // Cart quantity - per unit for 3-field matching (from LOCAL store)
                  // Includes fallback for legacy items without unit IDs
                  smallUnitCartQuantity={totalSmallQty || legacyQty}
                  bigUnitCartQuantity={totalBigQty || legacyQty}
                  // Fallback for products without unit info
                  cartQuantity={noUnitQty || legacyQty}
                  // LOCAL operations are instant, no loading state needed
                  isUpdating={false}
                  // Flutter parity: Maximum quantity validation
                  isMaximumAmountForUser={product.isMaximumAmountForUser}
                  maximumAmountForUser={product.maximumAmountForUser}
                  // Stock quantity for out-of-stock handling
                  itemAmount={product.itemAmount}
                />
              </div>
            );
          })}
        </ProductScroll>
      ) : (
        <div className="text-center py-[32px] text-[#9CA3AF]">
          {displayEmpty}
        </div>
      )}
    </section>
  );
}
