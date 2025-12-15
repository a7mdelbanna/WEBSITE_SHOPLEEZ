'use client';

/**
 * Home Page - Shopleez Store 1 (El-Etihad / الاتحاد)
 *
 * Features:
 * - Full Arabic/English localization
 * - Live API integration
 * - Dynamic content from backend
 * - RTL support
 *
 * Sections:
 * 1. Hero Section - Delivery info + promo banners
 * 2. Special Offers - Marquee scroll
 * 3. Brands - Circular logo grid
 * 4. Widget Sections - Recently Added, Best Selling, etc.
 * 5. Active Discounts - Products on discount
 * (Empty sections are hidden automatically)
 */

import { useState } from 'react';
import { AppShell } from '@/components/layout';
import { ProductCard, ProductScroll, ProductScrollSkeleton } from '@/components/products/product-card';
import { ProductDetailModal, useProductDetailModal, type ProductDetailData } from '@/components/products/product-detail-modal';
import { BrandLogos, ProductSection } from '@/components/home';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useTenant } from '@/lib/hooks/use-tenant';
import { useAuth } from '@/lib/contexts/auth-context';
import { useHomePage, useSpecialOffers, useSpotlightItems } from '@/lib/services';
// LOCAL-FIRST: Cart operations handled by ProductSection via local cart store
// No API calls here - only toast notifications
import { toast } from '@/lib/stores/toast-store';
import { cn } from '@/lib/utils';
import { isBannersSection, isCompaniesSection, isSpotlightSection } from '@/types/home';
import type { ProductSummary } from '@/types/product';

export default function HomePage() {
  const { t, isRTL, localize } = useTranslations();
  const { isOpen, selectedProduct, openModal, closeModal } = useProductDetailModal();
  const { isAuthenticated } = useAuth();

  // Track banner image load errors
  const [bannerImageErrors, setBannerImageErrors] = useState<Set<number>>(new Set());

  // Fetch home page data from API
  const { data: homeData, isLoading: isLoadingHome } = useHomePage();
  const { data: specialOffers, isLoading: isLoadingOffers } = useSpecialOffers();
  const { data: spotlightItems } = useSpotlightItems();

  // LOCAL-FIRST: Handle add to cart notification only
  // Actual cart operations are handled by ProductSection via local cart store
  // NO API CALLS - following Flutter Order Flow Documentation
  const handleAddToCart = (_product: ProductSummary, _unitType?: 'big' | 'small') => {
    // ProductSection has already added to local cart
    // This callback is only for toast notifications
    toast.success('Added to cart', 'تمت الإضافة إلى السلة');
  };

  // Handler for ProductDetailModal (different signature)
  const handleModalAddToCart = (_productId: number) => {
    // Modal add to cart - just show toast for now
    // Full modal cart integration would need its own local store hook
    toast.success('Added to cart', 'تمت الإضافة إلى السلة');
  };

  const handleProductClick = (product: ProductDetailData) => {
    openModal(product);
  };

  // Banner navigation: Navigate to promotion detail page
  // Matches Flutter's _showBannerDetails pattern
  const getBannerHref = (bannerId: number): string => {
    return `/promotion/${bannerId}`;
  };

  // Extract sections from home data using type guards
  const bannersSection = homeData?.orderedSections?.find(isBannersSection);
  const companiesSection = homeData?.orderedSections?.find(isCompaniesSection);
  const spotlightSection = homeData?.orderedSections?.find(isSpotlightSection);

  const heroBanners = bannersSection?.data || [];
  const companies = companiesSection?.data || homeData?.companies || [];
  // Map SpotlightItem[] to ProductSummary[] by extracting the nested item property
  const spotlightProducts = (spotlightSection?.data || []).map(spotlight => spotlight.item);

  // Get widgets and discounts from home data
  const widgets = homeData?.widgets || [];
  const discounts = homeData?.discounts || [];

  return (
    <AppShell>
      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isOpen}
        onClose={closeModal}
        onAddToCart={handleModalAddToCart}
      />
      <div className="flex gap-[12px]">
        {/* Main content - white rounded container */}
        <div className="flex-1 min-w-0 bg-white rounded-[20px] p-[32px]">

          {/* Hero Section - Delivery Info */}
          <section className="mb-[48px]">
            {/* Section Header - Light first word + Bold rest */}
            <div className="pb-[32px]">
              <h1 className="text-[32px] leading-tight">
                <span className="text-[var(--color-text-muted)] font-light">{t('home.deliveryTitle')}</span>{' '}
                <span className="text-[var(--color-text-primary)] font-bold">{t('home.deliverySubtitle')}</span>
              </h1>
            </div>

            {/* Auto-scrolling Marquee - IMAGE ONLY BANNERS */}
            {isLoadingHome ? (
              <div className="flex gap-[16px] overflow-hidden">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="w-[400px] h-[240px] rounded-[20px] shrink-0" />
                ))}
              </div>
            ) : heroBanners.length > 0 ? (
              <div className="marquee-container">
                <div className="marquee-track">
                  {/* First set of banners */}
                  {heroBanners.map((banner) => {
                    const imageUrl = isRTL && banner.imageUrlAr ? banner.imageUrlAr : banner.imageUrl;
                    const hasImageError = bannerImageErrors.has(banner.id);
                    const hasImage = imageUrl && imageUrl.trim() !== '' && !hasImageError;
                    const storeId = process.env.NEXT_PUBLIC_STORE_ID || '1';
                    const logoPath = `/tenants/store${storeId}/logo.png`;

                    return (
                      <Link
                        key={banner.id}
                        href={getBannerHref(banner.id)}
                        className="marquee-card w-[400px] h-[240px]"
                      >
                        {hasImage ? (
                          <Image
                            src={imageUrl}
                            alt={localize(banner.title || '', banner.titleAr || '')}
                            fill
                            className="object-cover"
                            unoptimized
                            onError={() => {
                              setBannerImageErrors(prev => new Set(prev).add(banner.id));
                            }}
                          />
                        ) : (
                          // Beautiful placeholder with logo
                          <div
                            className="w-full h-full relative overflow-hidden flex items-center justify-center"
                            style={{
                              background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-bg-page) 100%)'
                            }}
                          >
                            {/* Decorative pattern */}
                            <div
                              className="absolute inset-0 opacity-[0.08]"
                              style={{
                                backgroundImage: 'radial-gradient(circle, var(--color-primary) 1.5px, transparent 1.5px)',
                                backgroundSize: '24px 24px'
                              }}
                            />
                            {/* Radial gradient overlay */}
                            <div
                              className="absolute inset-0 opacity-50"
                              style={{
                                background: 'radial-gradient(circle at center, transparent 40%, var(--color-primary-light) 100%)'
                              }}
                            />
                            {/* Store logo */}
                            <div className="relative w-[140px] h-[140px] opacity-75">
                              <Image
                                src={logoPath}
                                alt="Store logo"
                                fill
                                className="object-contain drop-shadow-lg"
                                sizes="140px"
                                unoptimized
                              />
                            </div>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                  {/* Duplicate set for seamless loop */}
                  {heroBanners.map((banner) => {
                    const imageUrl = isRTL && banner.imageUrlAr ? banner.imageUrlAr : banner.imageUrl;
                    const hasImageError = bannerImageErrors.has(banner.id);
                    const hasImage = imageUrl && imageUrl.trim() !== '' && !hasImageError;
                    const storeId = process.env.NEXT_PUBLIC_STORE_ID || '1';
                    const logoPath = `/tenants/store${storeId}/logo.png`;

                    return (
                      <Link
                        key={`dup-${banner.id}`}
                        href={getBannerHref(banner.id)}
                        className="marquee-card w-[400px] h-[240px]"
                      >
                        {hasImage ? (
                          <Image
                            src={imageUrl}
                            alt={localize(banner.title || '', banner.titleAr || '')}
                            fill
                            className="object-cover"
                            unoptimized
                            onError={() => {
                              setBannerImageErrors(prev => new Set(prev).add(banner.id));
                            }}
                          />
                        ) : (
                          // Beautiful placeholder with logo
                          <div
                            className="w-full h-full relative overflow-hidden flex items-center justify-center"
                            style={{
                              background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-bg-page) 100%)'
                            }}
                          >
                            {/* Decorative pattern */}
                            <div
                              className="absolute inset-0 opacity-[0.08]"
                              style={{
                                backgroundImage: 'radial-gradient(circle, var(--color-primary) 1.5px, transparent 1.5px)',
                                backgroundSize: '24px 24px'
                              }}
                            />
                            {/* Radial gradient overlay */}
                            <div
                              className="absolute inset-0 opacity-50"
                              style={{
                                background: 'radial-gradient(circle at center, transparent 40%, var(--color-primary-light) 100%)'
                              }}
                            />
                            {/* Store logo */}
                            <div className="relative w-[140px] h-[140px] opacity-75">
                              <Image
                                src={logoPath}
                                alt="Store logo"
                                fill
                                className="object-contain drop-shadow-lg"
                                sizes="140px"
                                unoptimized
                              />
                            </div>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Placeholder when no banners available
              <div className="w-full h-[240px] rounded-[20px] bg-gradient-to-br from-[var(--color-bg-page)] to-[var(--color-border)] flex items-center justify-center">
                <span className="text-[var(--color-text-muted)] text-sm">{t('common.comingSoon')}</span>
              </div>
            )}
          </section>

          {/* Special Offers Section - Marquee Scroll */}
          {(isLoadingOffers || (specialOffers && specialOffers.length > 0)) && (
            <section className="mb-[56px]">
              {/* Section Header with "See All" link */}
              <div className="flex items-center justify-between mb-[32px]">
                <h2 className="text-[28px] font-bold text-[var(--color-text-primary)] leading-none">
                  {t('home.specialOffers')}
                </h2>
                <Link
                  href="/offers"
                  className={cn(
                    "flex items-center gap-[6px] text-[15px] font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors group",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  {t('common.seeAll')}
                  <ChevronRight className={cn("w-[18px] h-[18px] group-hover:translate-x-1 transition-transform", isRTL && "rotate-180 group-hover:-translate-x-1")} strokeWidth={2.5} />
                </Link>
              </div>

              {/* Offers Cards - Marquee Style */}
              {isLoadingOffers ? (
                <div className="flex gap-[16px] overflow-hidden">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="w-[280px] h-[160px] rounded-[16px] shrink-0" />
                  ))}
                </div>
              ) : (
                <div className="marquee-container">
                  <div className="marquee-track">
                    {/* First set */}
                    {specialOffers?.map((product) => {
                      const productName = localize(product.nameEn || product.name, product.nameAr);
                      const productImage = product.imageUrl || product.mainImage || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop';
                      return (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          className="marquee-card w-[280px] h-[160px]"
                        >
                          <Image
                            src={productImage}
                            alt={productName}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          {/* Product name overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-[16px]">
                            <span className="text-white text-[16px] font-semibold">
                              {productName}
                            </span>
                          </div>
                          {/* Discount badge */}
                          {product.discountPercent && product.discountPercent > 0 && (
                            <div className={cn(
                              "absolute top-[12px] bg-[var(--color-primary)] text-white px-[10px] py-[4px] rounded-[8px] text-[13px] font-bold",
                              isRTL ? "right-[12px]" : "left-[12px]"
                            )}>
                              {`-${product.discountPercent}%`}
                            </div>
                          )}
                        </Link>
                      );
                    })}
                    {/* Duplicate for seamless loop */}
                    {specialOffers?.map((product) => {
                      const productName = localize(product.nameEn || product.name, product.nameAr);
                      const productImage = product.imageUrl || product.mainImage || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop';
                      return (
                        <Link
                          key={`dup-${product.id}`}
                          href={`/product/${product.id}`}
                          className="marquee-card w-[280px] h-[160px]"
                        >
                          <Image
                            src={productImage}
                            alt={productName}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-[16px]">
                            <span className="text-white text-[16px] font-semibold">
                              {productName}
                            </span>
                          </div>
                          {product.discountPercent && product.discountPercent > 0 && (
                            <div className={cn(
                              "absolute top-[12px] bg-[var(--color-primary)] text-white px-[10px] py-[4px] rounded-[8px] text-[13px] font-bold",
                              isRTL ? "right-[12px]" : "left-[12px]"
                            )}>
                              {`-${product.discountPercent}%`}
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Top Brands Section - Circular Logos */}
          <section className="mb-[48px]">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-[20px]">
              <h2 className="text-[24px] font-bold text-[var(--color-text-primary)] leading-none">
                {t('home.topBrands')}
              </h2>
              <Link
                href="/brands"
                className={cn(
                  "flex items-center gap-[4px] text-[14px] font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors group",
                  isRTL && "flex-row-reverse"
                )}
              >
                {t('common.allBrands')}
                <ChevronRight className={cn("w-[16px] h-[16px] group-hover:translate-x-0.5 transition-transform", isRTL && "rotate-180")} strokeWidth={2} />
              </Link>
            </div>

            {/* Circular Brand Logos */}
            <BrandLogos
              brands={companies}
              isLoading={isLoadingHome}
            />
          </section>

          {/* Spotlight Section - Featured Products (only show if has items) */}
          {spotlightProducts && spotlightProducts.length > 0 && (
            <ProductSection
              sectionId="spotlight"
              title={t('home.spotlight')}
              products={spotlightProducts}
              seeAllLink="/deals"
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
            />
          )}

          {/* Widget Sections - Recently Added, Best Selling, etc. */}
          {widgets.map((widget) => (
            widget.items && widget.items.length > 0 && (
              <ProductSection
                key={`${widget.type}-${widget.id}`}
                sectionId={`widget-${widget.type}-${widget.id}`}
                title={widget.title}
                titleAr={widget.titleAr}
                products={widget.items}
                seeAllLink={`/widget/${widget.id}`}
                onProductClick={handleProductClick}
                onAddToCart={handleAddToCart}
              />
            )
          ))}

          {/* Active Discounts Section - Use ProductSection like other widgets */}
          {discounts && discounts.length > 0 && (
            <ProductSection
              sectionId="discounts"
              title={t('home.activeDiscounts')}
              products={discounts.map(item => ({
                id: item.id,
                name: item.name,
                nameEn: item.name,
                nameAr: item.nameAr,
                price: item.price,
                originalPrice: item.originalPrice || undefined,
                discountPercent: item.discountPercent > 0 ? item.discountPercent : undefined,
                imageUrl: item.imageUrl,
                mainImage: item.imageUrl,
                bigUnit: item.bigUnit,
                smallUnit: item.smallUnit,
                bigUnitPrice: item.bigUnitPrice,
                smallUnitPrice: item.smallUnitPrice,
                bigUnitImageUrl: item.bigUnitImageUrl,
                smallUnitImageUrl: item.smallUnitImageUrl,
                // Required fields for ProductSummary
                isAvailable: true,
                isNew: false,
                categoryId: 0,
                hasQuantityDiscount: false,
              }))}
              seeAllLink="/discounts"
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
            />
          )}

          {/* Deals Shelf Section - Fallback to spotlight API (only show if has items) */}
          {spotlightItems && spotlightItems.length > 0 && (
            <ProductSection
              sectionId="deals"
              title={t('home.dealsShelf')}
              products={spotlightItems}
              seeAllLink="/deals"
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
            />
          )}
        </div>

        {/* Right sidebar - Location widget (desktop only, hidden when authenticated) */}
        {!isAuthenticated && (
          <aside className="hidden xl:block w-[320px] shrink-0">
            <LocationWidget />
          </aside>
        )}
      </div>
    </AppShell>
  );
}

/**
 * Location Widget - City confirmation with map
 * Only shown to non-authenticated users
 */
function LocationWidget() {
  const { t, isRTL } = useTranslations();
  const { tenant } = useTenant();
  const { isAuthenticated, openLoginModal } = useAuth();

  // Don't show widget if user is already logged in
  if (isAuthenticated) {
    return null;
  }

  // Get city name based on tenant config (could be from user location in future)
  const cityName = tenant.defaultCity || 'Cairo';
  const cityNameAr = tenant.defaultCityAr || 'القاهرة';

  const handleYesClick = () => {
    // Open login modal - user needs to sign in to confirm location
    openLoginModal();
  };

  const handleNoClick = () => {
    // Open login modal - user needs to sign in to change location
    openLoginModal();
  };

  return (
    <div className="sticky top-[76px] bg-white rounded-[20px] overflow-hidden">
      {/* Header */}
      <div className="p-[20px] pb-[12px]">
        <h4 className="text-[16px] font-bold text-[var(--color-text-primary)] mb-[4px]">
          {t('location.confirmCity').replace('{city}', isRTL ? cityNameAr : cityName)}
        </h4>
        <p className="text-[13px] text-[var(--color-gray-500)]">
          {t('location.productsDepend')}
        </p>
      </div>

      {/* Buttons */}
      <div className={cn("flex gap-[8px] px-[20px] pb-[16px]", isRTL && "flex-row-reverse")}>
        <button
          onClick={handleYesClick}
          className="flex-1 h-[40px] rounded-full text-white text-[14px] font-medium transition-colors hover:opacity-90"
          style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
        >
          {t('location.yesCorrect')}
        </button>
        <button
          onClick={handleNoClick}
          className="flex-1 h-[40px] rounded-full border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] text-[14px] font-medium hover:bg-[var(--color-bg-page)] transition-colors"
        >
          {t('location.noDifferent')}
        </button>
      </div>

      {/* Map */}
      <div className="relative h-[240px] bg-[#E8F4E8]">
        <Image
          src="https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&h=600&fit=crop"
          alt={`Map of ${isRTL ? cityNameAr : cityName}`}
          fill
          className="object-cover"
          unoptimized
        />
        {/* Map overlay with city marker */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white px-[14px] py-[6px] rounded-[8px] shadow-lg">
            <span className="text-[13px] font-medium text-[var(--color-text-primary)]">
              {isRTL ? cityNameAr : cityName}
            </span>
          </div>
        </div>
        {/* Map attribution */}
        <div className={cn(
          "absolute bottom-[8px] bg-white/90 px-[6px] py-[3px] rounded-[4px]",
          isRTL ? "left-[8px]" : "right-[8px]"
        )}>
          <span className="text-[10px] text-[var(--color-gray-500)]">Google Maps</span>
        </div>
      </div>
    </div>
  );
}
