'use client';

/**
 * Sidebar Component - Exact Samokat Design
 *
 * Features:
 * - Smaller category images (40x40 rounded)
 * - Parent categories with images
 * - Subcategories as text-only links (indented)
 * - White container with rounded corners (from AppShell)
 */

import Link from 'next/link';
import Image from 'next/image';
import { useLocalization } from '@/lib/hooks/use-tenant';
import { cn } from '@/lib/utils';
import type { CategoryNavItem } from '@/types/category';

interface SidebarProps {
  categories?: CategoryNavItem[];
  activeCategoryId?: number;
  onClose?: () => void;
}

// Top featured categories with images (like Samokat's "Собрали для вас", "От Самоката", "Готовая еда")
const FEATURED_CATEGORIES = [
  {
    id: 'featured',
    name: 'Собрали для вас',
    nameAr: 'اخترنا لك',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop',
    href: '/featured',
  },
  {
    id: 'samokat',
    name: 'От Самоката',
    nameAr: 'من سامكات',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=80&h=80&fit=crop',
    href: '/brand',
  },
  {
    id: 'ready-food',
    name: 'Готовая еда',
    nameAr: 'طعام جاهز',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=80&h=80&fit=crop',
    href: '/ready-food',
    subcategories: [
      { id: 'new-hits', name: 'Новинки и хиты', nameAr: 'جديد ومميز', href: '/ready-food/new' },
      { id: 'all-ready', name: 'Вся готовая еда', nameAr: 'كل الطعام الجاهز', href: '/ready-food/all' },
      { id: 'combo', name: 'Комбо-наборы', nameAr: 'وجبات كومبو', href: '/ready-food/combo' },
      { id: 'hot', name: 'Всё горячее', nameAr: 'ساخن', href: '/ready-food/hot' },
      { id: 'pinsky', name: 'Меню от Pinskiy&Co', nameAr: 'قائمة Pinskiy&Co', href: '/ready-food/pinsky' },
      { id: 'restaurants', name: 'Из ресторанов и кафе', nameAr: 'من المطاعم والمقاهي', href: '/ready-food/restaurants' },
      { id: 'street', name: 'Стритфуд', nameAr: 'ستريت فود', href: '/ready-food/street' },
      { id: 'desserts', name: 'Десерты и выпечка', nameAr: 'حلويات ومخبوزات', href: '/ready-food/desserts' },
      { id: 'drinks', name: 'Напитки', nameAr: 'مشروبات', href: '/ready-food/drinks' },
    ],
  },
];

// Main product categories with images
const MAIN_CATEGORIES = [
  {
    id: 1,
    name: 'Овощи и фрукты',
    nameAr: 'خضروات وفواكه',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=80&h=80&fit=crop',
  },
  {
    id: 2,
    name: 'Молоко, яйца и сыр',
    nameAr: 'حليب وبيض وجبن',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=80&h=80&fit=crop',
  },
  {
    id: 3,
    name: 'Хлеб и выпечка',
    nameAr: 'خبز ومخبوزات',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=80&h=80&fit=crop',
  },
  {
    id: 4,
    name: 'Мясо и рыба',
    nameAr: 'لحوم وأسماك',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=80&h=80&fit=crop',
  },
  {
    id: 5,
    name: 'Морозилка',
    nameAr: 'مجمدات',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=80&h=80&fit=crop',
  },
  {
    id: 6,
    name: 'Вода и напитки',
    nameAr: 'مياه ومشروبات',
    image: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=80&h=80&fit=crop',
  },
  {
    id: 7,
    name: 'Сладкое',
    nameAr: 'حلويات',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=80&h=80&fit=crop',
  },
];

export function Sidebar({
  categories,
  activeCategoryId,
  onClose,
}: SidebarProps) {
  const { isRTL } = useLocalization();

  return (
    <nav className="py-[8px]">
      {/* Featured categories */}
      {FEATURED_CATEGORIES.map((category) => (
        <div key={category.id}>
          <Link
            href={category.href}
            onClick={onClose}
            className="flex items-center gap-[12px] px-[16px] py-[6px] transition-colors hover:bg-[#F5F5F5]"
          >
            {/* Category image - 40x40 rounded */}
            <div className="w-[40px] h-[40px] rounded-[10px] overflow-hidden bg-[#F5F5F5] shrink-0">
              <Image
                src={category.image}
                alt={category.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[14px] font-medium text-[#1A1A1A] leading-[1.2]">
              {category.name}
            </span>
          </Link>

          {/* Subcategories - text only, indented */}
          {category.subcategories && (
            <div className="pl-[68px] py-[4px]">
              {category.subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={sub.href}
                  onClick={onClose}
                  className="block py-[6px] text-[13px] text-[#666666] hover:text-[#1A1A1A] transition-colors"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Divider */}
      <div className="my-[8px] mx-[16px] border-t border-[#F0F0F0]" />

      {/* Main categories */}
      {MAIN_CATEGORIES.map((category) => {
        const isActive = category.id === activeCategoryId;

        return (
          <Link
            key={category.id}
            href={`/category/${category.id}`}
            onClick={onClose}
            className={cn(
              'flex items-center gap-[12px] px-[16px] py-[6px] transition-colors',
              isActive ? 'bg-[#F5F5F5]' : 'hover:bg-[#F5F5F5]'
            )}
          >
            {/* Category image - 40x40 rounded */}
            <div className="w-[40px] h-[40px] rounded-[10px] overflow-hidden bg-[#F5F5F5] shrink-0">
              <Image
                src={category.image}
                alt={category.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[14px] font-medium text-[#1A1A1A] leading-[1.2]">
              {category.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Mobile sidebar with overlay
 */
export function MobileSidebar({
  isOpen,
  onClose,
  ...props
}: SidebarProps & { isOpen: boolean }) {
  const { isRTL } = useLocalization();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar panel */}
      <div
        className={cn(
          'fixed top-0 bottom-0 z-50 w-[280px] bg-white shadow-xl lg:hidden',
          'overflow-y-auto',
          isRTL ? 'right-0 animate-slide-in-right' : 'left-0 animate-slide-in-left'
        )}
      >
        <div className="pt-[12px]">
          <Sidebar {...props} onClose={onClose} />
        </div>
      </div>
    </>
  );
}
