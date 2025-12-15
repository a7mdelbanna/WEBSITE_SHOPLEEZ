'use client';

/**
 * Sidebar Component - Category Navigation
 *
 * Features:
 * - Category images (40x40 rounded)
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
  const { t, locale } = useTranslations();

  // Fetch categories from API if not provided via props
  const { data: apiCategories, isLoading } = useCategories();

  // Use prop categories if provided, otherwise use API categories
  const categories = propCategories || apiCategories;

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
      {/* Section title */}
      <div className="px-[16px] py-[8px]">
        <span className="text-[12px] font-semibold text-[var(--color-gray-400)] uppercase tracking-wide">
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
        // Use Number() to handle potential type mismatch (string vs number)
        const isActive = Number(category.id) === Number(activeCategoryId);
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
              'hover:bg-[var(--color-bg-input)]'
            )}
          >
            {/* Category image - 40x40 rounded */}
            <div className="w-[40px] h-[40px] rounded-[10px] overflow-hidden bg-[var(--color-bg-input)] shrink-0">
              <Image
                src={categoryImage}
                alt={categoryName}
                width={40}
                height={40}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <span
              className={cn(
                'text-[14px] font-bold leading-[1.2]',
                isActive
                  ? 'text-[#D0D0D0]'
                  : 'text-[var(--color-text-primary)]'
              )}
            >
              {categoryName}
            </span>
          </Link>
        );
      })}

      {/* Empty state */}
      {!isLoading && (!categories || categories.length === 0) && (
        <div className="px-[16px] py-[24px] text-center">
          <p className="text-[14px] text-[var(--color-gray-400)]">
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
