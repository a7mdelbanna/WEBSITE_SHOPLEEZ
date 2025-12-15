'use client';

/**
 * Category Page - Samokat Style
 *
 * Features:
 * - Breadcrumb navigation
 * - Category title
 * - Dynamic filter tags (subcategories or companies based on store settings)
 * - Filter and Price buttons
 * - Product grid with real API data
 */

import { use, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { AppShell } from '@/components/layout';
import { ProductCard, ProductGrid, ProductGridSkeleton } from '@/components/products/product-card';
import { ProductDetailModal } from '@/components/products/product-detail-modal';
import { CategoryFilters } from '@/components/category/category-filters';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useAuth } from '@/lib/contexts/auth-context';
import { useCategories } from '@/lib/services/categories';
import { useProductsSimple } from '@/lib/services/products';
import { useCartStore, useLocalCartItems } from '@/lib/stores/cart-store';
import { getCartItemKey } from '@/lib/services/cart';
import { toast } from '@/lib/stores/toast-store';
import { cn } from '@/lib/utils';
import type { ProductSummary } from '@/types/product';

interface CategoryPageProps {
  params: Promise<{ id: string }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { id } = use(params);
  const categoryId = parseInt(id) || 0;
  const { t, isRTL, localize } = useTranslations();

  // Filter state
  const [selectedFilterId, setSelectedFilterId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<'subcategory' | 'company' | null>(null);

  // Product detail modal state
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  // Fetch all categories and find the current one (uses cached sidebar data)
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const category = categories?.find(cat => cat.id === categoryId);
  const categoryLoading = categoriesLoading;

  // Build filters for products query
  const productFilters = {
    categoryId,
    ...(filterType === 'subcategory' && selectedFilterId ? { subCategoryId: selectedFilterId } : {}),
    ...(filterType === 'company' && selectedFilterId ? { companyId: selectedFilterId } : {}),
    pageSize: 40,
  };

  // Fetch products for this category
  const { data: products, isLoading: productsLoading } = useProductsSimple(productFilters);

  // LOCAL-FIRST: Use local cart store instead of API
  const localCartItems = useLocalCartItems();
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  // Create a map using 3-field key (itemId-unitId-flavorId) to cart quantity
  const quantityMap = useMemo(() => {
    const map = new Map<string, number>();
    localCartItems.forEach(item => {
      const key = getCartItemKey(item.itemId, item.selectedUnitId, item.selectedFlavorId);
      const existing = map.get(key) || 0;
      map.set(key, existing + item.quantity);
    });
    return map;
  }, [localCartItems]);

  // Get display quantity for a specific product+unit combination
  const getDisplayQuantity = useCallback((productId: number, unitId?: number, flavorId?: number): number => {
    const key = getCartItemKey(productId, unitId, flavorId);
    return quantityMap.get(key) || 0;
  }, [quantityMap]);

  // Category name with localization
  const categoryName = category ? localize(category.name, category.nameAr) : '';

  // Handle filter selection
  const handleFilterSelect = (filterId: number | null, type: 'subcategory' | 'company' | null) => {
    setSelectedFilterId(filterId);
    setFilterType(type);
  };

  // Handle product click - opens product detail modal
  const handleProductClick = (productId: number) => {
    setSelectedProductId(productId);
  };

  // Handle add to cart - LOCAL ONLY, NO API call (following Flutter documentation)
  const handleAddToCart = (product: ProductSummary, unitType?: 'big' | 'small') => {
    // Determine which unit to use based on selection, with fallbacks
    let selectedUnit = unitType === 'big' ? product.bigUnit : product.smallUnit;

    // Fallback: if selected unit doesn't exist, try the other one
    if (!selectedUnit) {
      selectedUnit = product.smallUnit || product.bigUnit;
    }

    const unitId = selectedUnit?.id;
    const unitPrice = selectedUnit?.price || product.price;
    const discountPrice = selectedUnit?.specialPrice || product.discountPrice;

    console.log('[Category] LOCAL add to cart:', {
      itemId: product.id,
      unitType,
      unitId,
      price: unitPrice,
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
      name: product.name,
      nameAr: product.nameAr,
      image: product.imageUrl || product.mainImage || '',
      // Discount limits
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

    // Show toast notification
    toast.success('Added to cart', 'تمت الإضافة إلى السلة');
  };

  // Handle quantity update - LOCAL ONLY, NO API call
  const handleUpdateQuantity = useCallback((
    product: ProductSummary,
    newQuantity: number,
    unitType?: 'big' | 'small'
  ) => {
    const productId = product.id;
    const selectedUnit = unitType === 'big' ? product.bigUnit : (product.smallUnit || product.bigUnit);
    const unitId = selectedUnit?.id;

    console.log('[Category] LOCAL update quantity:', {
      productId,
      newQuantity,
      unitType,
      unitId,
    });

    if (newQuantity <= 0) {
      removeItem(productId, unitId, undefined);
    } else {
      updateQuantity(productId, unitId, undefined, newQuantity);
    }
  }, [updateQuantity, removeItem]);

  return (
    <AppShell activeCategoryId={categoryId}>
      <div className="flex">
        {/* Main content - White background like Samokat */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl px-6 py-6 mx-2 my-2">
          {/* Breadcrumb - Samokat style */}
          <nav className="pb-1">
            <Link
              href="/"
              className="text-[13px] text-[#9CA3AF] hover:text-[#FF4D6A] transition-colors"
            >
              {t('common.home')}
            </Link>
          </nav>

          {/* Category title - Large bold */}
          <h1
            className="text-[36px] font-bold text-[#1A1A1A] leading-[1.1]"
            style={{ marginBottom: '32px' }}
          >
            {categoryLoading ? '...' : categoryName}
          </h1>

          {/* Filter section - Two rows with spacing */}
          <CategoryFilters
            categoryId={categoryId}
            selectedFilterId={selectedFilterId}
            onFilterSelect={handleFilterSelect}
            className="pb-10"
          />

          {/* Products Grid */}
          <section>
            <h3
              className="text-[22px] font-bold text-[#1A1A1A]"
              style={{ marginBottom: '24px' }}
            >
              {selectedFilterId
                ? t('category.allProducts')
                : `${t('category.popularIn')} ${categoryName}`
              }
            </h3>

            {/* Loading state */}
            {productsLoading && <ProductGridSkeleton count={12} />}

            {/* Products grid */}
            {!productsLoading && products && products.length > 0 && (
              <ProductGrid>
                {products.map((product) => {
                  // Get per-unit quantities using 3-field matching from LOCAL store
                  const smallUnitId = product.smallUnit?.id;
                  const bigUnitId = product.bigUnit?.id;

                  // Check for quantities with proper unit IDs
                  const smallQty = smallUnitId ? getDisplayQuantity(product.id, smallUnitId, undefined) : 0;
                  const bigQty = bigUnitId ? getDisplayQuantity(product.id, bigUnitId, undefined) : 0;

                  // CRITICAL: Also check for cart items added WITHOUT unit IDs (old items)
                  const legacyQty = getDisplayQuantity(product.id, undefined, undefined);

                  // Total quantity = sum of all matching methods
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
                              textAr: `-${product.discountPercent}%`,
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
                      // Cart quantity - per unit for 3-field matching (from LOCAL store)
                      smallUnitCartQuantity={totalSmallQty || legacyQty}
                      bigUnitCartQuantity={totalBigQty || legacyQty}
                      cartQuantity={noUnitQty || legacyQty}
                      isUpdating={false}
                      // Flutter parity: Maximum quantity validation
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
                <p className="text-gray-500">{t('common.noProducts')}</p>
              </div>
            )}
          </section>
        </div>

        {/* Right sidebar - Location widget (desktop only) */}
        <aside className="hidden xl:block w-[320px] shrink-0 p-4 lg:p-6">
          <LocationWidget isRTL={isRTL} t={t} />
        </aside>
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

/**
 * Location Widget - Samokat style
 * Requires authentication for location confirmation
 */
function LocationWidget({ isRTL, t }: { isRTL: boolean; t: (key: string) => string }) {
  const { requireAuth } = useAuth();

  const handleYesClick = () => {
    // Require auth before confirming location
    requireAuth(() => {
      // TODO: Confirm location logic
      console.log('Location confirmed');
    });
  };

  const handleNoClick = () => {
    // Require auth before changing location
    requireAuth(() => {
      // TODO: Open location selector
      console.log('Change location');
    });
  };

  return (
    <div className="sticky top-20 bg-white rounded-2xl p-4 shadow-sm border border-[var(--color-border-light)]">
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-bold text-[var(--color-text-primary)] mb-1">
            {isRTL ? 'ما هو موقعك؟' : 'Your location?'}
          </h4>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {isRTL
              ? 'المنتجات والأسعار تعتمد على العنوان'
              : 'Products and prices depend on address'
            }
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleYesClick}
          className="flex-1 h-10 rounded-full text-white text-sm font-medium transition-colors hover:opacity-90"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {t('location.yesCorrect')}
        </button>
        <button
          onClick={handleNoClick}
          className="flex-1 h-10 rounded-full bg-[#F0F0F0] text-[var(--color-text-primary)] text-sm font-medium hover:bg-[#E8E8E8] transition-colors"
        >
          {t('location.noDifferent')}
        </button>
      </div>

      {/* Placeholder map */}
      <div className="mt-4 h-[200px] rounded-xl bg-[var(--color-bg-input)] flex items-center justify-center">
        <span className="text-[var(--color-text-muted)] text-sm">
          {isRTL ? 'خريطة الموقع' : 'Location Map'}
        </span>
      </div>
    </div>
  );
}
