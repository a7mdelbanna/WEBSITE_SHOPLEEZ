'use client';

/**
 * Promotion Detail Page
 *
 * Shows products for a specific promotion/banner.
 * Matches Flutter's SpecialSectionHomeView pattern.
 */

import { useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AppShell } from '@/components/layout';
import { ProductCard, ProductGrid, ProductGridSkeleton } from '@/components/products/product-card';
import { ProductDetailModal } from '@/components/products/product-detail-modal';
import { useTranslations } from '@/lib/hooks/use-translations';
import { usePromotionDetail } from '@/lib/services';
import { useCartStore, useLocalCartItems } from '@/lib/stores/cart-store';
import { getCartItemKey } from '@/lib/services/cart';
import { toast } from '@/lib/stores/toast-store';
import type { ProductSummary } from '@/types/product';
import { ArrowLeft } from 'lucide-react';

export default function PromotionDetailPage() {
  const { t, isRTL, localize } = useTranslations();
  const params = useParams();
  const router = useRouter();
  const promotionId = parseInt(params.id as string, 10);

  // Product detail modal state
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  // Fetch promotion details
  const { data: promotion, isLoading: promotionLoading, error } = usePromotionDetail(promotionId);

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

  // Error state
  if (error) {
    return (
      <AppShell>
        <div className="flex-1 min-w-0 bg-white rounded-2xl px-6 py-6 mx-2 my-2">
          <div className="text-center py-12">
            <p className="text-red-500">{isRTL ? 'حدث خطأ في تحميل العرض' : 'Error loading promotion'}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 text-[var(--color-primary)] hover:underline"
            >
              {t('common.goBack')}
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex-1 min-w-0 bg-white rounded-2xl px-6 py-6 mx-2 my-2">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors mb-4"
        >
          <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          <span>{t('common.back')}</span>
        </button>

        {/* Promotion Banner Image - Hero Section */}
        {promotionLoading ? (
          <>
            <div className="w-full aspect-[16/7] max-h-[400px] bg-gray-200 animate-pulse rounded-[20px] mb-6" />
            <div className="h-10 w-64 bg-gray-200 animate-pulse rounded mb-12" />
          </>
        ) : (
          promotion?.imageUrl && (
            <div className="mb-12">
              {/* Enhanced banner with shadow and responsive sizing */}
              <div
                className="w-full aspect-[16/7] max-h-[400px] rounded-[20px] overflow-hidden relative bg-gradient-to-br from-[#FEF5E0] to-[#F5F5F7] shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-transform duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] mb-6"
              >
                <Image
                  src={promotion.imageUrl}
                  alt={localize(promotion.title || '', promotion.titleAr || '')}
                  fill
                  className="object-cover"
                  unoptimized
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
              </div>

              {/* Title below banner */}
              <h1
                className="text-[36px] font-bold text-[#1A1A1A] leading-[1.1]"
              >
                {localize(promotion?.title || '', promotion?.titleAr || '')} 🔥
              </h1>
            </div>
          )
        )}

        {/* Products Grid */}
        <section>
          {/* Loading state */}
          {promotionLoading && <ProductGridSkeleton count={12} />}

          {/* Products grid */}
          {!promotionLoading && promotion && promotion.items.length > 0 && (
            <ProductGrid>
              {promotion.items.map((product) => {
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
                        : product.isNew
                        ? { text: 'New', textAr: 'جديد', variant: 'new' as const }
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
          {!promotionLoading && (!promotion || promotion.items.length === 0) && (
            <div className="text-center py-12">
              <p className="text-gray-500">{isRTL ? 'لا توجد منتجات في هذا العرض' : 'No products in this promotion'}</p>
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
