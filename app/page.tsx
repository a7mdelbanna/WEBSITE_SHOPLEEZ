'use client';

/**
 * Home Page - Exact Samokat Design
 *
 * Features:
 * - Gray background (#F5F5F5)
 * - White rounded container for main content
 * - Filter tabs as PLAIN TEXT (no borders/pills)
 * - Location widget with map
 */

import { AppShell } from '@/components/layout';
import { ProductCard, ProductScroll } from '@/components/products/product-card';
import { useTenant, useLocalization } from '@/lib/hooks/use-tenant';
import { SlidersHorizontal } from 'lucide-react';
import Image from 'next/image';

// Products for "Выгодная полка" section (horizontal scroll)
const DEALS_PRODUCTS = [
  {
    id: 1,
    name: 'Мусака Йуми',
    nameAr: 'Мусака Йуми',
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=400&fit=crop',
    price: 314,
    originalPrice: 379,
    weight: '290 г',
    promoText: 'Дарим 4 снежинки',
    promoTextAr: 'Дарим 4 снежинки',
    badge: { text: 'Комбо', textAr: 'Комбо', variant: 'tag' as const },
  },
  {
    id: 2,
    name: 'Котлеты по-грузински Creative Kitchen',
    nameAr: 'Котлеты по-грузински',
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=400&fit=crop',
    price: 349,
    originalPrice: 499,
    weight: '270 г',
    promoText: 'Участвует в акции',
    promoTextAr: 'Участвует в акции',
    badge: { text: '-30%', textAr: '-30%', variant: 'discount' as const },
  },
];

// Products for "Новинки готовой еды" section (grid)
const NEW_FOOD_PRODUCTS = [
  {
    id: 3,
    name: 'Уха Архангельская Самокат',
    nameAr: 'Уха Архангельская',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop',
    price: 405,
    weight: '300 г',
    promoText: 'Блюдо от шефа',
    promoTextAr: 'Блюдо от шефа',
  },
  {
    id: 4,
    name: 'Борщ с вишней Самокат',
    nameAr: 'Борщ с вишней',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop',
    price: 365,
    weight: '300 г',
    promoText: 'Блюдо от шефа',
    promoTextAr: 'Блюдо от шефа',
  },
  {
    id: 5,
    name: 'Минтай под соусом бешамель',
    nameAr: 'Минтай под соусом',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=400&fit=crop',
    price: 415,
    weight: '255 г',
    promoText: 'Блюдо от шефа',
    promoTextAr: 'Блюдо от шефа',
  },
  {
    id: 6,
    name: 'Кокосовая меренга Самокат',
    nameAr: 'Кокосовая меренга',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&h=400&fit=crop',
    price: 169,
    weight: '50 г',
  },
  {
    id: 7,
    name: 'Круассан Самокат, с малиной',
    nameAr: 'Круассан с малиной',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop',
    price: 209,
    weight: '100 г',
  },
  {
    id: 8,
    name: 'Пирожное Чизкейк классический',
    nameAr: 'Чизкейк классический',
    image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400&h=400&fit=crop',
    price: 189,
    weight: '110 г',
    promoText: 'Дарим 4 снежинки',
    promoTextAr: 'Дарим 4 снежинки',
  },
  {
    id: 9,
    name: 'Фиш энд чипс, жареные',
    nameAr: 'Фиш энд чипс',
    image: 'https://images.unsplash.com/photo-1579208030886-b937da0925dc?w=400&h=400&fit=crop',
    price: 269,
    weight: '120 г',
    promoText: 'Привезём горячим',
    promoTextAr: 'Привезём горячим',
  },
  {
    id: 10,
    name: 'Минибагет с чесночным маслом',
    nameAr: 'Минибагет',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
    price: 119,
    weight: '150 г',
    promoText: 'Привезём горячим',
    promoTextAr: 'Привезём горячим',
  },
];

export default function HomePage() {
  const { tenant } = useTenant();
  const { t, isRTL } = useLocalization();

  const handleAddToCart = (productId: number) => {
    console.log('Add to cart:', productId);
  };

  const handleProductClick = (productId: number) => {
    console.log('Product clicked:', productId);
  };

  return (
    <AppShell cartCount={3}>
      <div className="flex gap-[12px]">
        {/* Main content - white rounded container */}
        <div className="flex-1 min-w-0 bg-white rounded-[20px] p-[24px]">
          {/* Breadcrumb */}
          <nav className="mb-[12px] text-[13px] text-[#999999]">
            Главная
          </nav>

          {/* Page title */}
          <h1 className="text-[24px] font-bold text-[#1A1A1A] mb-[12px]">
            Новинки и хиты
          </h1>

          {/* Main filter tabs - PLAIN TEXT, no pills */}
          <div className="flex items-center gap-[16px] mb-[16px]">
            <button className="text-[14px] font-medium text-[#1A1A1A] hover:text-[#666666] transition-colors">
              Новинки готовой еды
            </button>
            <button className="text-[14px] font-medium text-[#1A1A1A] hover:text-[#666666] transition-colors">
              Хиты
            </button>
          </div>

          {/* Secondary filter row - icon + plain text */}
          <div className="flex items-center gap-[16px] mb-[28px]">
            <button className="flex items-center justify-center w-[20px] h-[20px] text-[#1A1A1A] hover:text-[#666666] transition-colors">
              <SlidersHorizontal className="w-[18px] h-[18px]" />
            </button>
            <button className="text-[14px] font-medium text-[#1A1A1A] hover:text-[#666666] transition-colors">
              Цена
            </button>
            <button className="text-[14px] font-medium text-[#1A1A1A] hover:text-[#666666] transition-colors">
              Без сахара
            </button>
            <button className="text-[14px] font-medium text-[#1A1A1A] hover:text-[#666666] transition-colors">
              Неострый вкус
            </button>
          </div>

          {/* "Выгодная полка" Section */}
          <section className="mb-[32px]">
            <h2 className="text-[20px] font-bold text-[#1A1A1A] mb-[16px]">
              Выгодная полка
            </h2>
            <ProductScroll>
              {DEALS_PRODUCTS.map((product) => (
                <div key={product.id} className="w-[180px] shrink-0">
                  <ProductCard
                    {...product}
                    onAddToCart={() => handleAddToCart(product.id)}
                    onClick={() => handleProductClick(product.id)}
                  />
                </div>
              ))}
            </ProductScroll>
          </section>

          {/* "Новинки готовой еды" Section */}
          <section className="mb-[32px]">
            <h2 className="text-[20px] font-bold text-[#1A1A1A] mb-[16px]">
              Новинки готовой еды
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[8px]">
              {NEW_FOOD_PRODUCTS.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  onAddToCart={() => handleAddToCart(product.id)}
                  onClick={() => handleProductClick(product.id)}
                />
              ))}
            </div>
          </section>
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
 * Location Widget - Exact Samokat style with map
 */
function LocationWidget() {
  return (
    <div className="sticky top-[76px] bg-white rounded-[20px] overflow-hidden">
      {/* Header */}
      <div className="p-[20px] pb-[12px]">
        <h4 className="text-[16px] font-bold text-[#1A1A1A] mb-[4px]">
          Ваш город Москва?
        </h4>
        <p className="text-[13px] text-[#666666]">
          Товары и акции зависят от адреса
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-[8px] px-[20px] pb-[16px]">
        <button className="flex-1 h-[40px] rounded-full bg-[#FF4B12] text-white text-[14px] font-medium hover:bg-[#E64400] transition-colors">
          Да, верно
        </button>
        <button className="flex-1 h-[40px] rounded-full border border-[#E5E5E5] bg-white text-[#1A1A1A] text-[14px] font-medium hover:bg-[#F5F5F5] transition-colors">
          Нет, другой
        </button>
      </div>

      {/* Map */}
      <div className="relative h-[240px] bg-[#E8F4E8]">
        <Image
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=600&fit=crop"
          alt="Map of Moscow"
          fill
          className="object-cover"
        />
        {/* Map overlay with city marker */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white px-[14px] py-[6px] rounded-[8px] shadow-lg">
            <span className="text-[13px] font-medium text-[#1A1A1A]">Москва</span>
          </div>
        </div>
        {/* 2GIS attribution */}
        <div className="absolute bottom-[8px] right-[8px] bg-white/90 px-[6px] py-[3px] rounded-[4px]">
          <span className="text-[10px] text-[#666666]">2ГИС</span>
        </div>
      </div>
    </div>
  );
}
