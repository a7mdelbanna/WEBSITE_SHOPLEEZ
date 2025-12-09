'use client';

/**
 * Sidebar Component - Category Navigation
 *
 * Features:
 * - Category images (40x40 rounded)
 * - Parent categories with images
 * - Subcategories as text-only links (indented)
 * - White container with rounded corners (from AppShell)
 * - API integration for dynamic categories
 * - RTL support
 */

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useCategories } from '@/lib/services';
import { cn } from '@/lib/utils';
import type { Category, CategoryNavItem } from '@/types/category';
import { Skeleton } from '@/components/ui/skeleton';

interface SidebarProps {
  categories?: CategoryNavItem[];
  activeCategoryId?: number;
  onClose?: () => void;
}

/**
 * Featured sections data (store-specific, could be from API in future)
 */
const getFeaturedSections = (t: (key: string) => string) => [
  {
    id: 'featured',
    name: t('sidebar.pickedForYou'),
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop',
    href: '/featured',
  },
  {
    id: 'store-brand',
    name: t('sidebar.fromStore'),
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=80&h=80&fit=crop',
    href: '/brand',
  },
  {
    id: 'ready-food',
    name: t('sidebar.readyFood'),
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=80&h=80&fit=crop',
    href: '/ready-food',
    subcategories: [
      { id: 'new-hits', name: t('sidebar.newAndHits'), href: '/ready-food/new' },
      { id: 'all-ready', name: t('sidebar.allReadyFood'), href: '/ready-food/all' },
      { id: 'combo', name: t('sidebar.comboSets'), href: '/ready-food/combo' },
      { id: 'hot', name: t('sidebar.hotItems'), href: '/ready-food/hot' },
      { id: 'street', name: t('sidebar.streetFood'), href: '/ready-food/street' },
      { id: 'desserts', name: t('sidebar.dessertsAndPastries'), href: '/ready-food/desserts' },
      { id: 'drinks', name: t('sidebar.drinks'), href: '/ready-food/drinks' },
    ],
  },
];

/**
 * Category skeleton for loading state
 */
function CategorySkeleton() {
  return (
    <div className="flex items-center gap-[12px] px-[16px] py-[6px]">
      <Skeleton className="w-[40px] h-[40px] rounded-[10px]" />
      <Skeleton className="h-[14px] w-[120px]" />
    </div>
  );
}

export function Sidebar({
  categories: propCategories,
  activeCategoryId,
  onClose,
}: SidebarProps) {
  const { t, isRTL, locale } = useTranslations();

  // Fetch categories from API if not provided via props
  const { data: apiCategories, isLoading } = useCategories();

  // Use prop categories if provided, otherwise use API categories
  const categories = propCategories || apiCategories;

  // Get featured sections with translations
  const featuredSections = getFeaturedSections(t);

  /**
   * Get localized category name with proper fallback
   * - Arabic locale: use nameAr first, fallback to name
   * - English locale: use name first, fallback to nameAr
   */
  const getCategoryName = (category: Category | CategoryNavItem): string => {
    const name = category.name || '';
    const nameAr = 'nameAr' in category ? category.nameAr : '';

    if (locale === 'ar') {
      // Arabic: prefer nameAr, fallback to name
      return nameAr || name || 'Unnamed Category';
    }
    // English: prefer name, fallback to nameAr
    return name || nameAr || 'Unnamed Category';
  };

  return (
    <nav className="py-[8px]">
      {/* Featured sections */}
      {featuredSections.map((section) => (
        <div key={section.id}>
          <Link
            href={section.href}
            onClick={onClose}
            className="flex items-center gap-[12px] px-[16px] py-[6px] transition-colors hover:bg-[#F5F5F5]"
          >
            {/* Section image - 40x40 rounded */}
            <div className="w-[40px] h-[40px] rounded-[10px] overflow-hidden bg-[#F5F5F5] shrink-0">
              <Image
                src={section.image}
                alt={section.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <span className="text-[14px] font-medium text-[#1A1A1A] leading-[1.2]">
              {section.name}
            </span>
          </Link>

          {/* Subcategories - text only, indented */}
          {section.subcategories && (
            <div className={cn(
              "py-[4px]",
              isRTL ? "pr-[68px]" : "pl-[68px]"
            )}>
              {section.subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={sub.href}
                  onClick={onClose}
                  className="block py-[6px] text-[13px] !text-[#666666] hover:!text-[#1A1A1A] transition-colors"
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

      {/* Section title */}
      <div className="px-[16px] py-[8px]">
        <span className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-wide">
          {t('sidebar.categories')}
        </span>
      </div>

      {/* Loading state */}
      {isLoading && (
        <>
          <CategorySkeleton />
          <CategorySkeleton />
          <CategorySkeleton />
          <CategorySkeleton />
          <CategorySkeleton />
        </>
      )}

      {/* Main categories from API */}
      {categories?.map((category) => {
        const isActive = category.id === activeCategoryId;
        const categoryName = getCategoryName(category);
        const categoryImage = category.imageUrl || category.iconUrl ||
          `https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=80&h=80&fit=crop`;

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
                src={categoryImage}
                alt={categoryName}
                width={40}
                height={40}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <span className="text-[14px] font-medium text-[#1A1A1A] leading-[1.2]">
              {categoryName}
            </span>
          </Link>
        );
      })}

      {/* Empty state */}
      {!isLoading && (!categories || categories.length === 0) && (
        <div className="px-[16px] py-[24px] text-center">
          <p className="text-[14px] text-[#9CA3AF]">
            {t('common.noResults')}
          </p>
        </div>
      )}
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
  const { isRTL } = useTranslations();

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
