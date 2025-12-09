'use client';

/**
 * Category Page - Samokat Style
 *
 * Shows products in a category with clean layout:
 * - Breadcrumb navigation
 * - Filter pills
 * - Horizontal scrolling product rows OR grid
 */

import { use } from 'react';
import { AppShell } from '@/components/layout';
import { ProductCard, ProductScroll, ProductGrid } from '@/components/products/product-card';
import { useLocalization } from '@/lib/hooks/use-tenant';
import { ChevronLeft, ChevronRight, MapPin, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

// Demo products
const DEMO_PRODUCTS = [
  {
    id: 1,
    name: 'Fresh Milk 1L',
    nameAr: 'حليب طازج 1 لتر',
    image: '/placeholder-product.svg',
    price: 25,
    originalPrice: 30,
    weight: '1 Liter',
    badge: { text: '-17%', textAr: '-17%', variant: 'discount' as const },
  },
  {
    id: 2,
    name: 'Eggs Pack of 30',
    nameAr: 'بيض 30 حبة',
    image: '/placeholder-product.svg',
    price: 85,
    weight: '30 pieces',
  },
  {
    id: 3,
    name: 'White Cheese 500g',
    nameAr: 'جبنة بيضاء 500 جرام',
    image: '/placeholder-product.svg',
    price: 45,
    originalPrice: 55,
    weight: '500g',
    promoText: 'Buy 2 get 10% off',
    promoTextAr: 'اشتر 2 واحصل على خصم 10%',
    badge: { text: 'Combo', textAr: 'كومبو', variant: 'tag' as const },
  },
  {
    id: 4,
    name: 'Tomatoes 1kg',
    nameAr: 'طماطم 1 كيلو',
    image: '/placeholder-product.svg',
    price: 15,
    weight: '1 kg',
  },
  {
    id: 5,
    name: 'Bread Loaf',
    nameAr: 'رغيف خبز',
    image: '/placeholder-product.svg',
    price: 8,
    weight: '400g',
    badge: { text: 'New', textAr: 'جديد', variant: 'new' as const },
  },
  {
    id: 6,
    name: 'Chicken Breast 1kg',
    nameAr: 'صدور دجاج 1 كيلو',
    image: '/placeholder-product.svg',
    price: 120,
    originalPrice: 140,
    weight: '1 kg',
    badge: { text: '-14%', textAr: '-14%', variant: 'discount' as const },
  },
  {
    id: 7,
    name: 'Orange Juice 1L',
    nameAr: 'عصير برتقال 1 لتر',
    image: '/placeholder-product.svg',
    price: 35,
    weight: '1 Liter',
  },
  {
    id: 8,
    name: 'Yogurt 400g',
    nameAr: 'زبادي 400 جرام',
    image: '/placeholder-product.svg',
    price: 12,
    weight: '400g',
  },
  {
    id: 9,
    name: 'Butter 200g',
    nameAr: 'زبدة 200 جرام',
    image: '/placeholder-product.svg',
    price: 42,
    originalPrice: 48,
    weight: '200g',
    badge: { text: '-12%', textAr: '-12%', variant: 'discount' as const },
  },
  {
    id: 10,
    name: 'Rice 5kg',
    nameAr: 'أرز 5 كيلو',
    image: '/placeholder-product.svg',
    price: 95,
    weight: '5 kg',
  },
  {
    id: 11,
    name: 'Pasta 500g',
    nameAr: 'مكرونة 500 جرام',
    image: '/placeholder-product.svg',
    price: 18,
    weight: '500g',
  },
  {
    id: 12,
    name: 'Olive Oil 1L',
    nameAr: 'زيت زيتون 1 لتر',
    image: '/placeholder-product.svg',
    price: 85,
    originalPrice: 95,
    weight: '1 Liter',
    badge: { text: '-10%', textAr: '-10%', variant: 'discount' as const },
  },
];

// Category names
const CATEGORY_NAMES: Record<string, { en: string; ar: string }> = {
  '1': { en: 'Featured', ar: 'مميز' },
  '2': { en: 'From Store', ar: 'من المتجر' },
  '3': { en: 'Ready Food', ar: 'طعام جاهز' },
  '4': { en: 'Fruits & Vegetables', ar: 'فواكه وخضروات' },
  '5': { en: 'Dairy & Eggs', ar: 'ألبان وبيض' },
  '6': { en: 'Bakery', ar: 'مخبوزات' },
  '7': { en: 'Meat & Fish', ar: 'لحوم وأسماك' },
  '8': { en: 'Frozen', ar: 'مجمدات' },
  '9': { en: 'Beverages', ar: 'مشروبات' },
  '10': { en: 'Sweets', ar: 'حلويات' },
  'offers': { en: 'Special Offers', ar: 'عروض خاصة' },
  'featured': { en: 'Featured', ar: 'مميز' },
};

interface CategoryPageProps {
  params: Promise<{ id: string }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { id } = use(params);
  const { t, isRTL } = useLocalization();

  const categoryName = CATEGORY_NAMES[id] || { en: 'Category', ar: 'فئة' };
  const displayName = isRTL ? categoryName.ar : categoryName.en;

  const handleAddToCart = (productId: number) => {
    console.log('Add to cart:', productId);
  };

  const handleProductClick = (productId: number) => {
    console.log('Product clicked:', productId);
  };

  return (
    <AppShell activeCategoryId={parseInt(id) || undefined}>
      <div className="flex">
        {/* Main content */}
        <div className="flex-1 min-w-0 p-4 lg:p-6">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-[#FF4D6A] transition-colors">
              {isRTL ? 'الرئيسية' : 'Home'}
            </Link>
            {isRTL ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="text-gray-700">{displayName}</span>
          </nav>

          {/* Category title */}
          <h1 className="mb-6 text-2xl font-bold text-gray-900">{displayName}</h1>

          {/* Filter pills - 36px height, rounded full */}
          <div className="flex flex-wrap gap-[8px] mb-[24px]">
            <button className="flex items-center gap-[8px] h-[36px] px-[16px] rounded-full text-[14px] font-medium bg-white border border-[#E5E5E5] text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors">
              <SlidersHorizontal className="w-[16px] h-[16px]" />
              {t('Filters', 'فلاتر')}
            </button>
            <button className="h-[36px] px-[16px] rounded-full text-[14px] font-medium bg-white border border-[#E5E5E5] text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors">
              {t('Price', 'السعر')}
            </button>
            <button className="h-[36px] px-[16px] rounded-full text-[14px] font-medium bg-white border border-[#E5E5E5] text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors">
              {t('Brand', 'العلامة التجارية')}
            </button>
            <button className="h-[36px] px-[16px] rounded-full text-[14px] font-medium bg-white border border-[#E5E5E5] text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors">
              {t('On Sale', 'عروض')}
            </button>
          </div>

          {/* Products - Horizontal scroll rows */}
          <section className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {t('Popular in', 'الأكثر شعبية في')} {displayName}
            </h3>
            <ProductScroll>
              {DEMO_PRODUCTS.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  onAddToCart={() => handleAddToCart(product.id)}
                  onClick={() => handleProductClick(product.id)}
                />
              ))}
            </ProductScroll>
          </section>

          {/* All Products Grid */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {t('All Products', 'جميع المنتجات')}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {DEMO_PRODUCTS.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  className="w-full"
                  onAddToCart={() => handleAddToCart(product.id)}
                  onClick={() => handleProductClick(product.id)}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Right sidebar - Location widget (desktop only) */}
        <aside className="hidden xl:block w-[320px] shrink-0 p-4 lg:p-6">
          <LocationWidget isRTL={isRTL} />
        </aside>
      </div>
    </AppShell>
  );
}

/**
 * Location Widget - Samokat style
 */
function LocationWidget({ isRTL }: { isRTL: boolean }) {
  return (
    <div className="sticky top-20 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#FF4D6A] flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 mb-1">
            {isRTL ? 'ما هو موقعك؟' : 'Your location?'}
          </h4>
          <p className="text-sm text-gray-500">
            {isRTL
              ? 'المنتجات والأسعار تعتمد على العنوان'
              : 'Products and prices depend on address'
            }
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 h-10 rounded-full bg-[#FF4D6A] text-white text-sm font-medium hover:bg-[#E64460] transition-colors">
          {isRTL ? 'نعم، صحيح' : 'Yes, correct'}
        </button>
        <button className="flex-1 h-10 rounded-full border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
          {isRTL ? 'لا، تغيير' : 'No, change'}
        </button>
      </div>

      {/* Placeholder map */}
      <div className="mt-4 h-[200px] rounded-xl bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400 text-sm">
          {isRTL ? 'خريطة الموقع' : 'Location Map'}
        </span>
      </div>
    </div>
  );
}
