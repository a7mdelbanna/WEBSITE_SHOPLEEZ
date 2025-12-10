'use client';

/**
 * CategoryFilters Component - Samokat Style Filter Tags
 *
 * Displays filter tags based on store settings:
 * - If requireSubCategoryForItem: Show subcategory tags
 * - If requireCompanyForItem: Show company/brand tags
 * - If both: Show subcategory tags (priority)
 * - If neither: Show just the filter and price buttons
 *
 * Design reference: Samokat category page filter pills
 */

import { SlidersHorizontal } from 'lucide-react';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useStoreSettings } from '@/lib/services/store-settings';
import { useSubCategories, useCompaniesByCategory } from '@/lib/services/categories';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryFiltersProps {
  categoryId: number;
  selectedFilterId?: number | null;
  onFilterSelect: (filterId: number | null, filterType: 'subcategory' | 'company' | null) => void;
  className?: string;
}

/**
 * Filter Tag Button - Samokat style pill
 */
function FilterTag({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-[44px] px-[24px] rounded-full text-[15px] font-medium whitespace-nowrap',
        'transition-colors duration-200 shrink-0',
        isSelected
          ? 'text-white'
          : 'bg-[#F0F0F0] text-[var(--color-text-primary)] hover:bg-[#E8E8E8]'
      )}
      style={isSelected ? { backgroundColor: 'var(--color-primary)' } : undefined}
    >
      {label}
    </button>
  );
}

/**
 * Loading skeleton for filter tags
 */
function FilterTagsSkeleton() {
  return (
    <div className="flex gap-[8px]">
      <Skeleton className="h-[36px] w-[80px] rounded-full" />
      <Skeleton className="h-[36px] w-[100px] rounded-full" />
      <Skeleton className="h-[36px] w-[90px] rounded-full" />
      <Skeleton className="h-[36px] w-[70px] rounded-full" />
    </div>
  );
}

export function CategoryFilters({
  categoryId,
  selectedFilterId,
  onFilterSelect,
  className,
}: CategoryFiltersProps) {
  const { t, localize } = useTranslations();

  // Fetch store settings to determine which filter type to show
  const { data: storeSettings, isLoading: settingsLoading } = useStoreSettings();

  // Determine which filter type to show based on store settings
  const showSubcategories = storeSettings?.requireSubCategoryForItem ?? false;
  const showCompanies = (storeSettings?.requireCompanyForItem ?? false) && !showSubcategories;

  // Fetch filter data based on settings
  const {
    data: subcategories,
    isLoading: subcategoriesLoading,
  } = useSubCategories(categoryId, showSubcategories);

  const {
    data: companies,
    isLoading: companiesLoading,
  } = useCompaniesByCategory(categoryId, showCompanies);

  // Loading state
  const isLoading = settingsLoading || (showSubcategories && subcategoriesLoading) || (showCompanies && companiesLoading);

  // Determine filter type and data
  const filterType: 'subcategory' | 'company' | null = showSubcategories ? 'subcategory' : (showCompanies ? 'company' : null);
  const filters = showSubcategories ? subcategories : (showCompanies ? companies : []);

  // Handle filter click
  const handleFilterClick = (filterId: number | null) => {
    if (filterId === selectedFilterId) {
      // Clicking selected filter deselects it (show all)
      onFilterSelect(null, null);
    } else {
      onFilterSelect(filterId, filterType);
    }
  };

  return (
    <div className={cn('flex flex-col gap-[16px]', className)}>
      {/* Row 1: Filter Tags (subcategories or companies) */}
      {!isLoading && filters && filters.length > 0 && (
        <div className="flex items-center gap-[10px] overflow-x-auto scrollbar-hide pb-1">
          {/* All option - selected by default */}
          <FilterTag
            label={t('common.all')}
            isSelected={selectedFilterId === null}
            onClick={() => handleFilterClick(null)}
          />

          {/* Dynamic filter tags */}
          {filters.map((filter) => (
            <FilterTag
              key={filter.id}
              label={localize(filter.name, filter.nameAr)}
              isSelected={selectedFilterId === filter.id}
              onClick={() => handleFilterClick(filter.id)}
            />
          ))}
        </div>
      )}

      {/* Loading state for tags */}
      {isLoading && <FilterTagsSkeleton />}

      {/* Row 2: Filter Icon and Price buttons */}
      <div className="flex items-center gap-[10px]">
        {/* Filter Icon Button */}
        <button
          className={cn(
            'flex items-center justify-center h-[44px] w-[44px] rounded-full shrink-0',
            'bg-[#F0F0F0] text-[var(--color-text-primary)]',
            'hover:bg-[#E8E8E8] transition-colors duration-200'
          )}
        >
          <SlidersHorizontal className="w-[20px] h-[20px]" />
        </button>

        {/* Price Filter Button */}
        <button
          className={cn(
            'h-[44px] px-[24px] rounded-full shrink-0',
            'bg-[#F0F0F0] text-[var(--color-text-primary)]',
            'hover:bg-[#E8E8E8] transition-colors duration-200',
            'text-[15px] font-medium'
          )}
        >
          {t('category.price')}
        </button>
      </div>
    </div>
  );
}

export default CategoryFilters;
