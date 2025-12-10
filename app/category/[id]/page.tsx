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

import { use, useState } from 'react';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { AppShell } from '@/components/layout';
import { ProductCard, ProductGrid, ProductGridSkeleton } from '@/components/products/product-card';
import { CategoryFilters } from '@/components/category/category-filters';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useCategories } from '@/lib/services/categories';
import { useProductsSimple } from '@/lib/services/products';
import { cn } from '@/lib/utils';

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

  // Category name with localization
  const categoryName = category ? localize(category.name, category.nameAr) : '';

  // Handle filter selection
  const handleFilterSelect = (filterId: number | null, type: 'subcategory' | 'company' | null) => {
    setSelectedFilterId(filterId);
    setFilterType(type);
  };

  // Handle product click
  const handleProductClick = (productId: number) => {
    console.log('Product clicked:', productId);
  };

  // Handle add to cart
  const handleAddToCart = (productId: number) => {
    console.log('Add to cart:', productId);
  };

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
                {products.map((product) => (
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
                    onAddToCart={() => handleAddToCart(product.id)}
                    onClick={() => handleProductClick(product.id)}
                  />
                ))}
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
    </AppShell>
  );
}

/**
 * Location Widget - Samokat style
 */
function LocationWidget({ isRTL, t }: { isRTL: boolean; t: (key: string) => string }) {
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
          className="flex-1 h-10 rounded-full text-white text-sm font-medium transition-colors"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {t('location.yesCorrect')}
        </button>
        <button className="flex-1 h-10 rounded-full bg-[#F0F0F0] text-[var(--color-text-primary)] text-sm font-medium hover:bg-[#E8E8E8] transition-colors">
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
