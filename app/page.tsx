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
import { useHomePage, useSpecialOffers, useSpotlightItems } from '@/lib/services';
import { cn } from '@/lib/utils';
import { isBannersSection, isCompaniesSection, isSpotlightSection } from '@/types/home';

export default function HomePage() {
  const { t, isRTL, localize } = useTranslations();
  const { isOpen, selectedProduct, openModal, closeModal } = useProductDetailModal();

  // Fetch home page data from API
  const { data: homeData, isLoading: isLoadingHome } = useHomePage();
  const { data: specialOffers, isLoading: isLoadingOffers } = useSpecialOffers();
  const { data: spotlightItems } = useSpotlightItems();

  const handleAddToCart = (productId: number) => {
    console.log('Add to cart:', productId);
  };

  const handleProductClick = (product: ProductDetailData) => {
    openModal(product);
  };

  // Extract sections from home data using type guards
  const bannersSection = homeData?.orderedSections?.find(isBannersSection);
  const companiesSection = homeData?.orderedSections?.find(isCompaniesSection);
  const spotlightSection = homeData?.orderedSections?.find(isSpotlightSection);

  const heroBanners = bannersSection?.data || [];
  const companies = companiesSection?.data || homeData?.companies || [];
  const spotlightProducts = spotlightSection?.data || [];

  // Get widgets and discounts from home data
  const widgets = homeData?.widgets || [];
  const discounts = homeData?.discounts || [];

  return (
    <AppShell cartCount={3}>
      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isOpen}
        onClose={closeModal}
        onAddToCart={handleAddToCart}
      />
      <div className="flex gap-[12px]">
        {/* Main content - white rounded container */}
        <div className="flex-1 min-w-0 bg-white rounded-[20px] p-[32px]">

          {/* Hero Section - Delivery Info */}
          <section className="mb-[48px]">
            {/* Section Header - Light first word + Bold rest */}
            <div className="pb-[32px]">
              <h1 className="text-[32px] leading-tight">
                <span className="text-[#9CA3AF] font-light">{t('home.deliveryTitle')}</span>{' '}
                <span className="text-[#1A1A1A] font-bold">{t('home.deliverySubtitle')}</span>
              </h1>
            </div>

            {/* Banner Grid - IMAGE ONLY BANNERS */}
            {isLoadingHome ? (
              <div className="grid grid-cols-4 gap-[16px] pt-[8px]">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="aspect-[3/4] rounded-[20px]" />
                ))}
              </div>
            ) : heroBanners.length > 0 ? (
              <div className="grid grid-cols-4 gap-[16px] pt-[8px]">
                {heroBanners.slice(0, 4).map((banner) => (
                  <Link
                    key={banner.id}
                    href={banner.linkValue || '#'}
                    className="group relative aspect-[3/4] rounded-[20px] overflow-hidden hover:scale-[1.02] transition-transform"
                  >
                    <Image
                      src={isRTL && banner.imageUrlAr ? banner.imageUrlAr : banner.imageUrl}
                      alt={localize(banner.title || '', banner.titleAr || '')}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </Link>
                ))}
              </div>
            ) : (
              // Placeholder when no banners available
              <div className="grid grid-cols-4 gap-[16px] pt-[8px]">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] rounded-[20px] bg-gradient-to-br from-[#F5F5F7] to-[#E5E5E5] flex items-center justify-center"
                  >
                    <span className="text-[#9CA3AF] text-sm">{t('common.comingSoon')}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Navigation arrow - positioned outside grid on right */}
            <button className={cn(
              "absolute top-1/2 -translate-y-1/2 w-[40px] h-[40px] rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform hidden",
              isRTL ? "-left-[20px]" : "-right-[20px]"
            )}>
              <ChevronRight className={cn("w-[20px] h-[20px] text-[#1A1A1A]", isRTL && "rotate-180")} strokeWidth={2} />
            </button>
          </section>

          {/* Special Offers Section - Marquee Scroll */}
          {(isLoadingOffers || (specialOffers && specialOffers.length > 0)) && (
            <section className="mb-[56px]">
              {/* Section Header with "See All" link */}
              <div className="flex items-center justify-between mb-[32px]">
                <h2 className="text-[28px] font-bold text-[#1A1A1A] leading-none">
                  {t('home.specialOffers')}
                </h2>
                <Link
                  href="/offers"
                  className={cn(
                    "flex items-center gap-[6px] text-[15px] font-semibold text-[#FF4B12] hover:text-[#E63E1C] transition-colors group",
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
                              "absolute top-[12px] bg-[#FF4B12] text-white px-[10px] py-[4px] rounded-[8px] text-[13px] font-bold",
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
                              "absolute top-[12px] bg-[#FF4B12] text-white px-[10px] py-[4px] rounded-[8px] text-[13px] font-bold",
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
              <h2 className="text-[24px] font-bold text-[#1A1A1A] leading-none">
                {t('home.topBrands')}
              </h2>
              <Link
                href="/brands"
                className={cn(
                  "flex items-center gap-[4px] text-[14px] font-medium text-[#1A1A1A] hover:text-[#FF4B12] transition-colors group",
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
              title={t('home.spotlight')}
              products={spotlightProducts}
              seeAllLink="/spotlight"
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
            />
          )}

          {/* Widget Sections - Recently Added, Best Selling, etc. */}
          {widgets.map((widget) => (
            widget.items && widget.items.length > 0 && (
              <ProductSection
                key={`${widget.type}-${widget.id}`}
                title={widget.title}
                titleAr={widget.titleAr}
                products={widget.items}
                seeAllLink={`/widget/${widget.id}`}
                onProductClick={handleProductClick}
                onAddToCart={handleAddToCart}
              />
            )
          ))}

          {/* Active Discounts Section */}
          {discounts && discounts.length > 0 && (
            <section className="mb-[48px]">
              <div className="flex items-center justify-between mb-[20px]">
                <h2 className="text-[24px] font-bold text-[#1A1A1A] leading-none">
                  {t('home.activeDiscounts')}
                </h2>
                <Link
                  href="/discounts"
                  className={cn(
                    "flex items-center gap-[4px] text-[14px] font-medium text-[#FF4B12] hover:text-[#E63E1C] transition-colors",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  {t('common.seeAll')}
                  <ChevronRight className={cn("w-[16px] h-[16px]", isRTL && "rotate-180")} strokeWidth={2} />
                </Link>
              </div>

              <ProductScroll>
                {discounts.map((item) => (
                  <div key={item.id} className="w-[140px] shrink-0 snap-start">
                    <ProductCard
                      id={item.id}
                      name={item.name}
                      nameAr={item.nameAr}
                      image={item.imageUrl}
                      price={item.price}
                      originalPrice={item.originalPrice}
                      badge={{
                        text: `-${item.discountPercent}%`,
                        textAr: `${item.discountPercent}%-`,
                        variant: 'discount' as const,
                      }}
                      onAddToCart={() => handleAddToCart(item.id)}
                      onClick={() => handleProductClick({
                        id: item.id,
                        name: item.name,
                        nameAr: item.nameAr,
                        image: item.imageUrl,
                        price: item.price,
                        originalPrice: item.originalPrice,
                      })}
                    />
                  </div>
                ))}
              </ProductScroll>
            </section>
          )}

          {/* Deals Shelf Section - Fallback to spotlight API (only show if has items) */}
          {spotlightItems && spotlightItems.length > 0 && (
            <ProductSection
              title={t('home.dealsShelf')}
              products={spotlightItems}
              seeAllLink="/deals"
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
            />
          )}
        </div>

        {/* Right sidebar - Location widget (desktop only) */}
        <aside className="hidden xl:block w-[320px] shrink-0">
          <LocationWidget />
        </aside>
      </div>
    </AppShell>
  );
}

/**
 * Location Widget - City confirmation with map
 */
function LocationWidget() {
  const { t, isRTL } = useTranslations();
  const { tenant } = useTenant();

  // Get city name based on tenant config (could be from user location in future)
  const cityName = tenant.defaultCity || 'Cairo';
  const cityNameAr = tenant.defaultCityAr || 'القاهرة';

  return (
    <div className="sticky top-[76px] bg-white rounded-[20px] overflow-hidden">
      {/* Header */}
      <div className="p-[20px] pb-[12px]">
        <h4 className="text-[16px] font-bold text-[#1A1A1A] mb-[4px]">
          {t('location.confirmCity').replace('{city}', isRTL ? cityNameAr : cityName)}
        </h4>
        <p className="text-[13px] text-[#666666]">
          {t('location.productsDepend')}
        </p>
      </div>

      {/* Buttons */}
      <div className={cn("flex gap-[8px] px-[20px] pb-[16px]", isRTL && "flex-row-reverse")}>
        <button className="flex-1 h-[40px] rounded-full bg-[#FF4B12] text-white text-[14px] font-medium hover:bg-[#E64400] transition-colors">
          {t('location.yesCorrect')}
        </button>
        <button className="flex-1 h-[40px] rounded-full border border-[#E5E5E5] bg-white text-[#1A1A1A] text-[14px] font-medium hover:bg-[#F5F5F5] transition-colors">
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
            <span className="text-[13px] font-medium text-[#1A1A1A]">
              {isRTL ? cityNameAr : cityName}
            </span>
          </div>
        </div>
        {/* Map attribution */}
        <div className={cn(
          "absolute bottom-[8px] bg-white/90 px-[6px] py-[3px] rounded-[4px]",
          isRTL ? "left-[8px]" : "right-[8px]"
        )}>
          <span className="text-[10px] text-[#666666]">Google Maps</span>
        </div>
      </div>
    </div>
  );
}
