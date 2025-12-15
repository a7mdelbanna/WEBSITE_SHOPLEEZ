'use client';

/**
 * Active Discounts Page
 *
 * Shows all products with active discounts
 * Similar to category page but filtered by discount availability
 */

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout';
import { ProductCard, ProductGrid, ProductGridSkeleton } from '@/components/products/product-card';
import { ProductDetailModal } from '@/components/products/product-detail-modal';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useProductsSimple } from '@/lib/services/products';
import { useCartStore, useLocalCartItems } from '@/lib/stores/cart-store';
import { getCartItemKey } from '@/lib/services/cart';
import { toast } from '@/lib/stores/toast-store';
import { cn } from '@/lib/utils';
import type { ProductSummary } from '@/types/product';

export default function DiscountsPage() {
  const { t, isRTL, localize } = useTranslations();

  // Product detail modal state
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  // Fetch products with discounts
  const { data: products, isLoading: productsLoading } = useProductsSimple({
    hasDiscount: true,
    pageSize: 40,
  });

  // LOCAL-FIRST: Use local cart store
  const localCartItems = useLocalCartItems();
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  // Create quantity map
  const quantityMap = useMemo(() => {
    const map = new Map<string, number>();
    localCartItems.forEach(item => {
      const key = getCartItemKey(item.itemId, item.selectedUnitId, item.selectedFlavorId);
      const existing = map.get(key) || 0;
      map.set(key, existing + item.quantity);
    });
    return map;
  }, [localCartItems]);

  // Get display quantity
  const getDisplayQuantity = useCallback((productId: number, unitId?: number, flavorId?: number): number => {
    const key = getCartItemKey(productId, unitId, flavorId);
    return quantityMap.get(key) || 0;
  }, [quantityMap]);

  // Handle product click
  const handleProductClick = (productId: number) => {
    setSelectedProductId(productId);
  };

  // Handle add to cart
  const handleAddToCart = (product: ProductSummary, unitType?: 'big' | 'small') => {
    let selectedUnit = unitType === 'big' ? product.bigUnit : product.smallUnit;
    if (!selectedUnit) {
      selectedUnit = product.smallUnit || product.bigUnit;
    }

    const unitId = selectedUnit?.id;
    const unitPrice = selectedUnit?.price || product.price;
    const discountPrice = selectedUnit?.specialPrice || product.discountPrice;

    addItem({
      itemId: product.id,
      quantity: 1,
      customerUnitId: unitId,
      itemUnitId: unitId,
      normalPrice: unitPrice,
      itemPriceAfterDiscount: discountPrice,
      name: product.name,
      nameAr: product.nameAr,
      image: product.imageUrl || product.mainImage || '',
      bigUnitId: product.bigUnit?.id,
      smallUnitId: product.smallUnit?.id,
      bigUnitDiscountMinQuantity: product.bigUnitDiscountMinQuantity,
      bigUnitDiscountMaxQuantity: product.bigUnitDiscountMaxQuantity,
      smallUnitDiscountMinQuantity: product.smallUnitDiscountMinQuantity,
      smallUnitDiscountMaxQuantity: product.smallUnitDiscountMaxQuantity,
      isMaximumAmountForUser: product.isMaximumAmountForUser,
      maximumAmountForUser: product.maximumAmountForUser,
    });

    toast.success('Added to cart', 'تمت الإضافة إلى السلة');
  };

  // Handle quantity update
  const handleUpdateQuantity = useCallback((
    product: ProductSummary,
    newQuantity: number,
    unitType?: 'big' | 'small'
  ) => {
    const productId = product.id;
    const selectedUnit = unitType === 'big' ? product.bigUnit : (product.smallUnit || product.bigUnit);
    const unitId = selectedUnit?.id;

    if (newQuantity <= 0) {
      removeItem(productId, unitId, undefined);
    } else {
      updateQuantity(productId, unitId, undefined, newQuantity);
    }
  }, [updateQuantity, removeItem]);

  return (
    <AppShell>
      <div className="flex-1 min-w-0 bg-white rounded-2xl px-6 py-6 mx-2 my-2">
        {/* Breadcrumb */}
        <nav className="pb-1">
          <Link
            href="/"
            className="text-[13px] text-[#9CA3AF] hover:text-[#FF4D6A] transition-colors"
          >
            {t('common.home')}
          </Link>
        </nav>

        {/* Page title */}
        <h1
          className="text-[36px] font-bold text-[#1A1A1A] leading-[1.1]"
          style={{ marginBottom: '32px' }}
        >
          {isRTL ? 'العروض والخصومات' : 'Active Discounts'}
        </h1>

        {/* Products Grid */}
        <section>
          <h3
            className="text-[22px] font-bold text-[#1A1A1A]"
            style={{ marginBottom: '24px' }}
          >
            {isRTL ? 'جميع المنتجات المخفضة' : 'All Discounted Products'}
          </h3>

          {/* Loading state */}
          {productsLoading && <ProductGridSkeleton count={12} />}

          {/* Products grid */}
          {!productsLoading && products && products.length > 0 && (
            <ProductGrid>
              {products.map((product) => {
                const smallUnitId = product.smallUnit?.id;
                const bigUnitId = product.bigUnit?.id;
                const smallQty = smallUnitId ? getDisplayQuantity(product.id, smallUnitId, undefined) : 0;
                const bigQty = bigUnitId ? getDisplayQuantity(product.id, bigUnitId, undefined) : 0;
                const legacyQty = getDisplayQuantity(product.id, undefined, undefined);
                const totalSmallQty = smallQty + (smallUnitId ? 0 : legacyQty);
                const totalBigQty = bigQty + (bigUnitId ? 0 : legacyQty);
                const hasUnits = smallUnitId || bigUnitId;
                const noUnitQty = !hasUnits ? legacyQty : 0;

                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    nameAr={product.nameAr}
                    image={product.imageUrl || product.mainImage || ''}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    weight={product.weight || product.volume}
                    badge={
                      product.discountPercent
                        ? {
                            text: `-${product.discountPercent}%`,
                            textAr: `${product.discountPercent}%-`,
                            variant: 'discount' as const,
                          }
                        : undefined
                    }
                    isAvailable={product.isAvailable}
                    bigUnit={product.bigUnit}
                    smallUnit={product.smallUnit}
                    bigUnitImageUrl={product.bigUnitImageUrl}
                    smallUnitImageUrl={product.smallUnitImageUrl}
                    onAddToCart={(unitType) => handleAddToCart(product, unitType)}
                    onUpdateQuantity={(quantity, unitType) => handleUpdateQuantity(product, quantity, unitType)}
                    onClick={() => handleProductClick(product.id)}
                    smallUnitCartQuantity={totalSmallQty || legacyQty}
                    bigUnitCartQuantity={totalBigQty || legacyQty}
                    cartQuantity={noUnitQty || legacyQty}
                    isUpdating={false}
                    isMaximumAmountForUser={product.isMaximumAmountForUser}
                    maximumAmountForUser={product.maximumAmountForUser}
                    itemAmount={product.itemAmount}
                  />
                );
              })}
            </ProductGrid>
          )}

          {/* Empty state */}
          {!productsLoading && (!products || products.length === 0) && (
            <div className="text-center py-12">
              <p className="text-gray-500">{isRTL ? 'لا توجد منتجات مخفضة حالياً' : 'No discounted products available'}</p>
            </div>
          )}
        </section>
      </div>

      {/* Product Detail Modal */}
      {selectedProductId && (
        <ProductDetailModal
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
        />
      )}
    </AppShell>
  );
}
