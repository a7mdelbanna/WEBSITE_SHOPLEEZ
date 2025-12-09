'use client';

/**
 * Home Page - Exact Samokat Design from Figma
 *
 * Sections:
 * 1. Доставка от 15 минут - Hero cards
 * 2. Акции - Promotional cards
 * 3. Выгодная полка - Product deals
 */

import { AppShell } from '@/components/layout';
import { ProductCard, ProductScroll } from '@/components/products/product-card';
import { ProductDetailModal, useProductDetailModal, type ProductDetailData } from '@/components/products/product-detail-modal';
import { CarouselWithIndicators } from '@/components/ui/carousel-indicators';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Hero delivery cards data
const DELIVERY_CARDS = [
  {
    id: 1,
    title: 'Блюда от шефа Василия Емельяненко',
    image: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=600&h=400&fit=crop',
    bgColor: 'bg-gradient-to-br from-amber-700 to-amber-900',
  },
  {
    id: 2,
    title: 'Промокод на 3000 ₽ за перенос номера в Билайн',
    image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&h=400&fit=crop',
    bgColor: 'bg-gradient-to-br from-slate-700 to-slate-900',
    badge: 'Реклама',
  },
  {
    id: 3,
    title: 'Если в ванной мало места',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&h=400&fit=crop',
    bgColor: 'bg-gradient-to-br from-stone-300 to-stone-400',
  },
  {
    id: 4,
    title: 'Кино, снеки и напитки',
    image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=600&h=400&fit=crop',
    bgColor: 'bg-gradient-to-br from-amber-600 to-amber-800',
  },
];

// Vertical Banner Section - Modern Bento Layout
const BENTO_BANNERS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=800&fit=crop',
    alt: 'Special offers',
    gridClass: 'col-span-2 row-span-2', // Large featured banner
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=400&fit=crop',
    alt: 'Flash sale',
    gridClass: 'col-span-1 row-span-1',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=600&h=400&fit=crop',
    alt: 'New arrivals',
    gridClass: 'col-span-1 row-span-1',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
    alt: 'Weekend deals',
    gridClass: 'col-span-2 row-span-1', // Wide banner
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&h=600&fit=crop',
    alt: 'Categories',
    gridClass: 'col-span-1 row-span-1',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop',
    alt: 'Best sellers',
    gridClass: 'col-span-1 row-span-1',
  },
];

// Minimal scroll banners - Clean modern cards
const BRAND_BANNERS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=360&fit=crop',
    alt: 'Premium collection',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=360&fit=crop',
    alt: 'Smart watches',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=360&fit=crop',
    alt: 'Audio gear',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=360&fit=crop',
    alt: 'Photography',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=360&fit=crop',
    alt: 'Fashion',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&h=360&fit=crop',
    alt: 'Skincare',
  },
];

// Auto-scrolling marquee banners
const MARQUEE_BANNERS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=250&fit=crop',
    alt: 'Flash deals',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop',
    alt: 'Special offers',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=250&fit=crop',
    alt: 'New arrivals',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop',
    alt: 'Trending',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop',
    alt: 'Weekend sale',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400&h=250&fit=crop',
    alt: 'Best sellers',
  },
];

// Products for "Выгодная полка" section (Samokat reference style)
// Extended with full product details for the modal
const DEALS_PRODUCTS: ProductDetailData[] = [
  {
    id: 1,
    name: 'Адвент-календарь Самокат Beauty Rituals',
    nameAr: 'Адвент-календарь Самокат Beauty Rituals',
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&h=400&fit=crop',
    price: 2999,
    originalPrice: 3999,
    volume: '',
    badge: { text: '-25%', textAr: '-25%', variant: 'discount' as const },
    highlights: [
      '24 косметических продукта',
      'Эксклюзивные средства Самокат',
      'Подарочная упаковка',
    ],
    description: 'Адвент-календарь с 24 косметическими продуктами для ежедневного ухода. Идеальный подарок к новому году.',
    brand: 'Самокат',
    productType: 'набор',
  },
  {
    id: 2,
    name: 'Гель для душа Самокат, Saffron Spark',
    nameAr: 'Гель для душа Самокат, Saffron Spark',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
    price: 379,
    originalPrice: 423,
    volume: '300 мл',
    badge: { text: '-10%', textAr: '-10%', variant: 'discount' as const },
    highlights: [
      'С экстрактом шафрана',
      'Увлажняющая формула',
      'Приятный восточный аромат',
    ],
    description: 'Гель для душа с уникальным ароматом шафрана и специй. Бережно очищает кожу, не пересушивая её.',
    usage: 'Нанесите на влажную кожу, вспеньте и тщательно смойте водой.',
    brand: 'Самокат',
    productType: 'гель для душа',
    shelfLife: '24 месяца',
  },
  {
    id: 3,
    name: 'Одноразовые бритвы Самокат, 5 лезвий',
    nameAr: 'Одноразовые бритвы Самокат, 5 лезвий',
    image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop',
    price: 299,
    originalPrice: 379,
    volume: '3 шт.',
    badge: { text: '-21%', textAr: '-21%', variant: 'discount' as const },
    highlights: [
      '5 острых лезвий',
      'Увлажняющая полоска',
      'Эргономичная ручка',
    ],
    description: 'Одноразовые бритвы с 5 лезвиями для гладкого бритья. Увлажняющая полоска с алоэ вера.',
    quantity: '3 шт.',
    brand: 'Самокат',
    productType: 'бритвы',
  },
  {
    id: 4,
    name: 'Лосьон-шейк для тела Самокат Dewy Repair, увлажняющий, с ароматом земляники',
    nameAr: 'Лосьон-шейк для тела Самокат Dewy Repair',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop',
    price: 319,
    originalPrice: 371,
    volume: '150 мл',
    badge: { text: '-14%', textAr: '-14%', variant: 'discount' as const },
    highlights: [
      'С экстрактом клубники, маслами и пантенолом',
      'Можно использовать после загара',
      'Приятный земляничный аромат',
    ],
    description: 'Спрей легко наносится, быстро впитывается и защищает кожу от сухости. Экстракт клубники в составе способствует регенерации кожи и сужению пор, успокаивает и увлажняет кожу. Масло авокадо обладает антиоксидантными свойствами, ниацинамид — способствует выравниванию текстуры кожи и уменьшению пигментации. Пантенол и бисаболол обладают заживляющими свойствами и повышают эластичность. У спрея приятный земляничный аромат. Можно использовать после загара.',
    usage: 'Хорошо встряхните флакон, чтобы смешать две фазы. Нанесите спрей на предварительно очищенную кожу. Дождитесь естественного высыхания или распределите средство массирующими движениями до полного впитывания.',
    composition: 'Aqua, Paraffinum Liquidum, Isododecane, Isopropyl Myristate, Polysorbate-20, Fragaria Vesca Fruit Extract(экстракт клубники), Cetearyl Alcohol, Potassium Cetyl Phosphate, Macadamia Ternifolia Seed Oil, Persea Gratissima (Avocado) Oil, Prunus Amygdalus Dulcis (Sweet Almond) Oil, Parfum...',
    shelfLife: '37 месяцев',
    storageConditions: 'При температуре от +5°C до +25°C',
    manufacturer: 'ООО Мыловаренная мануфактура Куафер, Россия',
    quantity: '1.0 шт.',
    productType: 'лосьон',
    brand: 'Самокат',
    applicationArea: 'для тела',
    relatedProducts: [
      {
        id: 101,
        name: 'Бальзам для губ Самокат, Cherry Blossom',
        nameAr: 'Бальзам для губ',
        image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop',
        price: 199,
        weight: '12 мл',
      },
      {
        id: 102,
        name: 'Крем-спрей для волос Самокат',
        nameAr: 'Крем-спрей для волос',
        image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&h=400&fit=crop',
        price: 419,
        originalPrice: 600,
        weight: '250 мл',
        badge: { text: '-30%', textAr: '-30%', variant: 'discount' as const },
      },
      {
        id: 103,
        name: 'Гель для умывания Самокат, Pimple Killer',
        nameAr: 'Гель для умывания',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
        price: 299,
        weight: '150 мл',
        promoText: 'От воспалений',
      },
    ],
  },
  {
    id: 5,
    name: 'Скраб для тела Самокат Mint Berry',
    nameAr: 'Скраб для тела Самокат Mint Berry',
    image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=400&h=400&fit=crop',
    price: 399,
    originalPrice: 499,
    volume: '300 мл',
    badge: { text: '-20%', textAr: '-20%', variant: 'discount' as const },
    highlights: [
      'Натуральные скрабирующие частицы',
      'Мятно-ягодный аромат',
      'Увлажняет и тонизирует',
    ],
    description: 'Скраб для тела с натуральными скрабирующими частицами и освежающим ароматом мяты и лесных ягод.',
    brand: 'Самокат',
    productType: 'скраб',
  },
  {
    id: 6,
    name: 'Крем для рук увлажняющий Самокат',
    nameAr: 'Крем для рук увлажняющий Самокат',
    image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&h=400&fit=crop',
    price: 189,
    originalPrice: 249,
    volume: '75 мл',
    badge: { text: '-24%', textAr: '-24%', variant: 'discount' as const },
    highlights: [
      'Интенсивное увлажнение',
      'Быстро впитывается',
      'Не оставляет липкости',
    ],
    description: 'Крем для рук с интенсивным увлажнением. Быстро впитывается и не оставляет липкой пленки.',
    brand: 'Самокат',
    productType: 'крем для рук',
  },
  {
    id: 7,
    name: 'Маска для лица тканевая Самокат',
    nameAr: 'Маска для лица тканевая Самокат',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=400&fit=crop',
    price: 99,
    originalPrice: 149,
    volume: '1 шт.',
    badge: { text: '-33%', textAr: '-33%', variant: 'discount' as const },
    highlights: [
      'Глубокое увлажнение',
      'Тканевая основа',
      '15 минут для эффекта',
    ],
    description: 'Тканевая маска для глубокого увлажнения кожи лица. Результат за 15 минут.',
    brand: 'Самокат',
    productType: 'маска',
  },
];

export default function HomePage() {
  const { isOpen, selectedProduct, openModal, closeModal } = useProductDetailModal();

  const handleAddToCart = (productId: number) => {
    console.log('Add to cart:', productId);
  };

  const handleProductClick = (product: ProductDetailData) => {
    openModal(product);
  };

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

          {/* "Доставка от 15 минут" Section */}
          <section className="mb-[48px]">
            {/* Section Header - Samokat style: light "Доставка" + bold "от 15 минут" */}
            <div className="pb-[32px]">
              <h1 className="text-[32px] leading-tight">
                <span className="text-[#9CA3AF] font-light">Доставка</span>{' '}
                <span className="text-[#1A1A1A] font-bold">от 15 минут</span>
              </h1>
            </div>

            {/* 4-Column Static Grid - IMAGE ONLY BANNERS */}
            <div className="grid grid-cols-4 gap-[16px] pt-[8px]">
              {DELIVERY_CARDS.map((card) => (
                <Link
                  key={card.id}
                  href="#"
                  className="group relative aspect-[3/4] rounded-[20px] overflow-hidden hover:scale-[1.02] transition-transform"
                >
                  {/* Image only - text is baked into the image by designer */}
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover"
                  />
                  {/* "Реклама" badge - ONLY allowed overlay for sponsored content */}
                  {card.badge && (
                    <div className="absolute bottom-[16px] left-[16px] bg-white/85 backdrop-blur-sm px-[12px] py-[6px] rounded-full flex items-center gap-[6px]">
                      <svg className="w-[14px] h-[14px] text-[#6B7280]" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                        <text x="12" y="16" textAnchor="middle" fontSize="12" fill="currentColor">i</text>
                      </svg>
                      <span className="text-[#6B7280] text-[12px] font-normal">{card.badge}</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>

            {/* Navigation arrow - positioned outside grid on right */}
            <button className="absolute right-0 top-1/2 -translate-y-1/2 w-[40px] h-[40px] rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform hidden">
              <ChevronRight className="w-[20px] h-[20px] text-[#1A1A1A]" strokeWidth={2} />
            </button>
          </section>

          {/* Modern Bento Banner Section */}
          <section className="mb-[56px]">
            {/* Section Header with "See All" link */}
            <div className="flex items-center justify-between mb-[32px]">
              <h2 className="text-[28px] font-bold text-[#1A1A1A] leading-none">
                Специальные предложения
              </h2>
              <Link
                href="#"
                className="flex items-center gap-[6px] text-[15px] font-semibold text-[#FF4B12] hover:text-[#E63E1C] transition-colors group"
              >
                Смотреть все
                <ChevronRight className="w-[18px] h-[18px] group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </Link>
            </div>

            {/* Bento Grid Layout - Modern Vertical Design */}
            <div className="bento-grid grid grid-cols-4 gap-[16px] auto-rows-[180px]">
              {BENTO_BANNERS.map((banner, index) => (
                <Link
                  key={banner.id}
                  href="#"
                  className={`
                    bento-card group relative
                    ${banner.gridClass}
                    animate-fade-in-up
                  `}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  {/* Image */}
                  <Image
                    src={banner.image}
                    alt={banner.alt}
                    fill
                    className="object-cover"
                  />

                  {/* Shine effect overlay */}
                  <div className="bento-shine" />

                  {/* Subtle gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              ))}
            </div>
          </section>

          {/* Auto-Scroll Marquee Banner Section */}
          <section className="mb-[56px]">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-[32px]">
              <h2 className="text-[28px] font-bold text-[#1A1A1A] leading-none">
                Популярные категории
              </h2>
              <Link
                href="#"
                className="flex items-center gap-[6px] text-[15px] font-semibold text-[#FF4B12] hover:text-[#E63E1C] transition-colors group"
              >
                Все категории
                <ChevronRight className="w-[18px] h-[18px] group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </Link>
            </div>

            {/* Marquee Container - Auto-scrolling banners */}
            <div className="marquee-container">
              <div className="marquee-track">
                {/* First set of banners */}
                {MARQUEE_BANNERS.map((banner) => (
                  <Link
                    key={banner.id}
                    href="#"
                    className="marquee-card w-[280px] h-[160px]"
                  >
                    <Image
                      src={banner.image}
                      alt={banner.alt}
                      fill
                      className="object-cover"
                    />
                  </Link>
                ))}
                {/* Duplicate set for seamless loop */}
                {MARQUEE_BANNERS.map((banner) => (
                  <Link
                    key={`dup-${banner.id}`}
                    href="#"
                    className="marquee-card w-[280px] h-[160px]"
                  >
                    <Image
                      src={banner.image}
                      alt={banner.alt}
                      fill
                      className="object-cover"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Minimal Scroll - Clean Modern Brands */}
          <section className="mb-[56px]">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-[24px]">
              <h2 className="text-[28px] font-bold text-[#1A1A1A] leading-none">
                Топ бренды
              </h2>
              <Link
                href="#"
                className="flex items-center gap-[6px] text-[15px] font-semibold text-[#1A1A1A] hover:text-[#FF4B12] transition-colors group"
              >
                Все бренды
                <ChevronRight className="w-[18px] h-[18px] group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
              </Link>
            </div>

            {/* Modern Carousel with Dash Indicators */}
            <CarouselWithIndicators itemWidth={300} gap={20}>
              {BRAND_BANNERS.map((banner) => (
                <Link
                  key={banner.id}
                  href="#"
                  className="carousel-card"
                >
                  <Image
                    src={banner.image}
                    alt={banner.alt}
                    fill
                    className="object-cover"
                  />
                </Link>
              ))}
            </CarouselWithIndicators>
          </section>

          {/* "Выгодная полка" Section - Samokat Reference Style */}
          <section className="mb-[48px] group">
            <div className="flex items-center justify-between mb-[24px]">
              <h2 className="text-[28px] font-bold text-[#1A1A1A] leading-none">Выгодная полка</h2>
              <Link
                href="#"
                className="flex items-center gap-[4px] text-[15px] font-medium text-[#1A1A1A] hover:text-[#FF4B12] transition-colors"
              >
                Больше
                <ChevronRight className="w-[18px] h-[18px]" strokeWidth={2} />
              </Link>
            </div>

            {/* Product Scroll - compact cards to fit 5 in view */}
            <ProductScroll>
              {DEALS_PRODUCTS.map((product) => (
                <div key={product.id} className="w-[140px] shrink-0 snap-start">
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    nameAr={product.nameAr || product.name}
                    image={product.image}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    weight={product.volume}
                    badge={product.badge ? {
                      text: product.badge.text,
                      textAr: product.badge.textAr || product.badge.text,
                      variant: product.badge.variant,
                    } : undefined}
                    onAddToCart={() => handleAddToCart(product.id)}
                    onClick={() => handleProductClick(product)}
                  />
                </div>
              ))}
            </ProductScroll>
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
