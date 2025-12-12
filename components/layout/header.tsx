'use client';

/**
 * Header Component - Search with Results Dropdown
 *
 * Features:
 * - Real-time search with 1-second debounce (Flutter parity)
 * - Search results dropdown with ProductCards
 * - Cart quantity controls with stock validation
 * - RTL support
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, User, Menu, X, MessageCircle, Globe, LogOut, Loader2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useTenant, useCurrency } from '@/lib/hooks/use-tenant';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useAuth } from '@/lib/contexts/auth-context';
import { useSearchProducts } from '@/lib/services/products';
import { useCartStore, useLocalCartItems } from '@/lib/stores/cart-store';
import { getCartItemKey } from '@/lib/services/cart';
import { toast } from '@/lib/stores/toast-store';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import { FloatingCart } from './floating-cart';
import type { ProductSummary } from '@/types/product';

interface HeaderProps {
  onMenuClick?: () => void;
}

/**
 * Custom hook for debouncing a value
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { tenant, locale, setLocale } = useTenant();
  const { t, isRTL, localize } = useTranslations();
  const currency = useCurrency();
  const { isAuthenticated, user, openLoginModal, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  // Debounce search query (1 second like Flutter)
  const debouncedQuery = useDebounce(searchQuery, 1000);

  // Search products
  const { data: searchResults, isLoading: isSearching } = useSearchProducts(
    debouncedQuery,
    searchFocused && debouncedQuery.length >= 2
  );

  // LOCAL-FIRST: Cart operations
  const localCartItems = useLocalCartItems();
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  // Create a map using 3-field key (itemId-unitId-flavorId) to cart quantity
  const quantityMap = useMemo(() => {
    const map = new Map<string, number>();
    localCartItems.forEach(item => {
      const key = getCartItemKey(item.itemId, item.selectedUnitId, item.selectedFlavorId);
      const existing = map.get(key) || 0;
      map.set(key, existing + item.quantity);
    });
    return map;
  }, [localCartItems]);

  // Get display quantity for a specific product+unit combination
  const getDisplayQuantity = useCallback((productId: number, unitId?: number, flavorId?: number): number => {
    const key = getCartItemKey(productId, unitId, flavorId);
    return quantityMap.get(key) || 0;
  }, [quantityMap]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled automatically via debounce
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setSearchFocused(false);
    }, 200); // Slightly longer to allow click on results
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const toggleLocale = () => {
    setLocale(locale === 'ar' ? 'en' : 'ar');
  };

  // Handle add to cart from search results
  const handleAddToCart = useCallback((product: ProductSummary) => {
    const selectedUnit = product.smallUnit || product.bigUnit;
    const unitId = selectedUnit?.id;
    const unitPrice = selectedUnit?.price || product.price;

    addItem({
      itemId: product.id,
      quantity: 1,
      customerUnitId: unitId,
      itemUnitId: unitId,
      normalPrice: unitPrice,
      itemPriceAfterDiscount: product.discountPrice,
      name: product.name,
      nameAr: product.nameAr,
      image: product.imageUrl || product.mainImage || '',
      bigUnitId: product.bigUnit?.id,
      smallUnitId: product.smallUnit?.id,
      isMaximumAmountForUser: product.isMaximumAmountForUser,
      maximumAmountForUser: product.maximumAmountForUser,
    });

    toast.success('Added to cart', 'تمت الإضافة إلى السلة');
  }, [addItem]);

  // Handle quantity update from search results
  const handleUpdateQuantity = useCallback((product: ProductSummary, newQuantity: number) => {
    const selectedUnit = product.smallUnit || product.bigUnit;
    const unitId = selectedUnit?.id;

    if (newQuantity <= 0) {
      removeItem(product.id, unitId, undefined);
    } else {
      updateQuantity(product.id, unitId, undefined, newQuantity);
    }
  }, [updateQuantity, removeItem]);

  // Get store name based on locale
  const storeName = localize(tenant.name);

  // Check if showing search results
  const showResults = searchFocused && debouncedQuery.length >= 2;
  const hasResults = searchResults && searchResults.length > 0;

  return (
    <>
      {/* Dimming overlay */}
      {searchFocused && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setSearchFocused(false)}
          aria-hidden="true"
        />
      )}

      {/* Floating search when focused - breaks out of header */}
      {searchFocused && (
        <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-[14px] px-[12px]">
          {/* Search Input */}
          <form onSubmit={handleSearch} className="w-full max-w-[640px]">
            <div className="flex h-[48px] items-center rounded-full bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] px-[20px]">
              {isSearching ? (
                <Loader2 className="h-[20px] w-[20px] shrink-0 text-[#9E9E9E] animate-spin" />
              ) : (
                <Search className="h-[20px] w-[20px] shrink-0 text-[#9E9E9E]" />
              )}
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={handleSearchBlur}
                autoFocus
                placeholder={t('common.searchPlaceholder')}
                className="flex-1 bg-transparent px-[16px] text-[15px] text-[#1A1A1A] placeholder-[#9E9E9E] outline-none border-none focus:ring-0"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="flex h-[24px] w-[24px] items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors"
                >
                  <X className="h-[16px] w-[16px] text-[#9E9E9E]" />
                </button>
              )}
            </div>
          </form>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="w-full max-w-[640px] mt-[8px] bg-white rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden max-h-[70vh] overflow-y-auto">
              {isSearching && !hasResults ? (
                <div className="flex items-center justify-center py-[32px]">
                  <Loader2 className="h-[24px] w-[24px] text-[var(--color-primary)] animate-spin" />
                </div>
              ) : hasResults ? (
                <div className="divide-y divide-[#F0F0F0]">
                  {searchResults.map((product) => {
                    // Get cart quantity for this product
                    const selectedUnit = product.smallUnit || product.bigUnit;
                    const unitId = selectedUnit?.id;
                    const legacyQty = getDisplayQuantity(product.id, undefined, undefined);
                    const unitQty = unitId ? getDisplayQuantity(product.id, unitId, undefined) : 0;
                    const cartQuantity = unitQty || legacyQty;

                    // Stock validation
                    const isOutOfStock = product.itemAmount !== undefined && product.itemAmount <= 0;
                    const isAtMaxPerUserLimit = product.isMaximumAmountForUser && product.maximumAmountForUser
                      ? cartQuantity >= product.maximumAmountForUser
                      : false;
                    const isAtStockLimit = product.itemAmount !== undefined && product.itemAmount > 0
                      ? cartQuantity >= product.itemAmount
                      : false;
                    const isAtMaxQuantity = isAtMaxPerUserLimit || isAtStockLimit;

                    const displayName = isRTL ? (product.nameAr || product.name) : product.name;
                    const displayPrice = selectedUnit?.price || product.price;

                    return (
                      <SearchResultItem
                        key={product.id}
                        product={product}
                        displayName={displayName}
                        displayPrice={displayPrice}
                        cartQuantity={cartQuantity}
                        isOutOfStock={isOutOfStock}
                        isAtMaxQuantity={isAtMaxQuantity}
                        isRTL={isRTL}
                        currency={currency}
                        locale={locale}
                        onAddToCart={() => handleAddToCart(product)}
                        onUpdateQuantity={(qty) => handleUpdateQuantity(product, qty)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-[32px] text-[#9CA3AF]">
                  <Search className="h-[32px] w-[32px] mb-[12px]" />
                  <p className="text-[15px]">
                    {isRTL ? 'لا توجد نتائج' : 'No results found'}
                  </p>
                  <p className="text-[13px] mt-[4px]">
                    {isRTL ? `لم نجد نتائج لـ "${debouncedQuery}"` : `No results for "${debouncedQuery}"`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <header className="sticky top-0 mx-[12px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] rounded-b-[20px] z-30">
        <div className="flex h-[76px] items-center justify-between px-[24px]">
          {/* Left: Logo */}
          <div className="flex items-center shrink-0">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className={cn(
                "flex h-[40px] w-[40px] items-center justify-center rounded-full hover:bg-[#F5F5F5] lg:hidden transition-colors",
                isRTL ? "ml-[8px]" : "mr-[8px]"
              )}
              aria-label={t('common.openMenu')}
            >
              <Menu className="h-[24px] w-[24px] text-[#1A1A1A]" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-[10px]">
              <div className="w-[40px] h-[40px] rounded-full bg-[var(--color-brand)] flex items-center justify-center flex-shrink-0">
                <div className="w-[20px] h-[20px] rounded-full border-[3px] border-white" />
              </div>
              <span className="hidden text-[22px] font-bold text-[var(--color-brand)] lg:block tracking-[-0.02em] leading-none">
                {storeName}
              </span>
            </Link>
          </div>

          {/* Center: Search bar - hidden when focused (replaced by floating version) */}
          <form
            onSubmit={handleSearch}
            className={cn(
              "hidden flex-1 md:flex justify-center mx-[40px] lg:mx-[80px]",
              searchFocused && "invisible"
            )}
          >
            <div className="flex h-[48px] w-full max-w-[640px] items-center rounded-full bg-[#F7F7F7] px-[20px]">
              <Search className="h-[20px] w-[20px] shrink-0 text-[#9E9E9E]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder={t('common.searchPlaceholder')}
                className="flex-1 bg-transparent px-[16px] text-[15px] text-[#1A1A1A] placeholder-[#9E9E9E] outline-none border-none focus:ring-0"
              />
            </div>
          </form>

          {/* Right: Language + Login + Chat */}
          <div className="flex items-center gap-[10px] shrink-0">
            {/* Language Toggle */}
            <button
              onClick={toggleLocale}
              className="flex h-[44px] items-center gap-[6px] rounded-full bg-[#F5F5F7] px-[16px] text-[#1A1A1A] transition-colors hover:bg-[#ECECEC]"
              title={locale === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
            >
              <Globe className="h-[18px] w-[18px]" strokeWidth={2} />
              <span className="text-[14px] font-medium leading-none">
                {locale === 'ar' ? 'EN' : 'عربي'}
              </span>
            </button>

            {/* Login/User Button */}
            {isAuthenticated ? (
              // Logged in - show user name with logout option
              <div className="flex items-center gap-[8px]">
                <div className="flex h-[48px] items-center gap-[10px] rounded-full bg-[#F5F5F7] px-[20px] text-[#1A1A1A]">
                  <div
                    className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-white text-[12px] font-bold"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    {user?.firstName?.charAt(0)?.toUpperCase() || <User className="h-[16px] w-[16px]" />}
                  </div>
                  <span className="text-[15px] font-medium leading-none max-w-[100px] truncate">
                    {user?.firstName || (isRTL ? 'مرحباً' : 'Welcome')}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center justify-center w-[40px] h-[40px] rounded-full hover:bg-[#F5F5F7] transition-colors"
                  title={t('common.logout')}
                >
                  <LogOut className="h-[18px] w-[18px] text-[#6B7280]" strokeWidth={2} />
                </button>
              </div>
            ) : (
              // Not logged in - show login button
              <button
                onClick={openLoginModal}
                className="flex h-[48px] items-center gap-[10px] rounded-full bg-[#F5F5F7] px-[20px] text-[#1A1A1A] transition-colors hover:bg-[#ECECEC]"
              >
                <User className="h-[20px] w-[20px]" strokeWidth={2} />
                <span className="text-[15px] font-medium leading-none">
                  {t('common.login')}
                </span>
              </button>
            )}

            {/* Floating Cart with Hover Preview */}
            <FloatingCart />

            {/* Chat Support */}
            <button
              className="flex items-center justify-center w-[48px] h-[48px] bg-[#F5F5F7] rounded-full transition-colors hover:bg-[#ECECEC]"
              aria-label={t('common.supportChat')}
            >
              <MessageCircle className="h-[20px] w-[20px] text-[#1A1A1A]" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="px-[24px] pb-[16px] md:hidden">
          <form onSubmit={handleSearch}>
            <div className="flex h-[44px] items-center rounded-full bg-[#F7F7F7] px-[18px]">
              <Search className="h-[18px] w-[18px] shrink-0 text-[#9E9E9E]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder={t('common.searchPlaceholder')}
                className="flex-1 bg-transparent px-[14px] text-[15px] text-[#1A1A1A] placeholder-[#9E9E9E] outline-none border-none focus:ring-0"
              />
            </div>
          </form>
        </div>
      </header>
    </>
  );
}

/**
 * Search Result Item Component
 * Shows product with cart controls
 */
interface SearchResultItemProps {
  product: ProductSummary;
  displayName: string;
  displayPrice: number;
  cartQuantity: number;
  isOutOfStock: boolean;
  isAtMaxQuantity: boolean;
  isRTL: boolean;
  currency: {
    locale: string;
    code: string;
    symbol: string;
    symbolEn: string;
    position: 'before' | 'after';
    decimalPlaces: number;
  };
  locale: 'en' | 'ar';
  onAddToCart: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

function SearchResultItem({
  product,
  displayName,
  displayPrice,
  cartQuantity,
  isOutOfStock,
  isAtMaxQuantity,
  isRTL,
  currency,
  locale,
  onAddToCart,
  onUpdateQuantity,
}: SearchResultItemProps) {
  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAtMaxQuantity) {
      toast.error('Maximum quantity reached', 'تم الوصول للحد الأقصى');
      return;
    }
    if (cartQuantity === 0) {
      onAddToCart();
    } else {
      onUpdateQuantity(cartQuantity + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartQuantity > 0) {
      onUpdateQuantity(cartQuantity - 1);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-[12px] p-[12px] hover:bg-[#F9FAFB] transition-colors cursor-pointer",
        isRTL && "flex-row-reverse"
      )}
    >
      {/* Product Image */}
      <div className="w-[60px] h-[60px] rounded-[12px] bg-[#F5F5F7] overflow-hidden flex-shrink-0">
        {product.imageUrl || product.mainImage ? (
          <Image
            src={product.imageUrl || product.mainImage || ''}
            alt={displayName}
            width={60}
            height={60}
            className="w-full h-full object-contain"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="w-[24px] h-[24px] text-[#D1D5DB]" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
        <p className="text-[14px] font-medium text-[#1A1A1A] line-clamp-1">
          {displayName}
        </p>
        <p className="text-[15px] font-bold mt-[4px]" style={{ color: 'var(--color-primary)' }}>
          {formatPrice(displayPrice, currency, locale)}
        </p>
      </div>

      {/* Cart Controls */}
      <div className="flex-shrink-0">
        {isOutOfStock ? (
          <span className="text-[12px] text-[#9CA3AF] px-[12px] py-[8px] bg-[#F0F0F0] rounded-full">
            {isRTL ? 'نفذ' : 'Out'}
          </span>
        ) : cartQuantity > 0 ? (
          /* Quantity Stepper */
          <div className="flex items-center rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-primary)' }}>
            <button
              onClick={handleDecrement}
              className="w-[36px] h-[36px] flex items-center justify-center text-white hover:bg-black/10 transition-colors"
            >
              {cartQuantity === 1 ? (
                <X className="w-[16px] h-[16px]" />
              ) : (
                <Minus className="w-[16px] h-[16px]" />
              )}
            </button>
            <span className="min-w-[28px] text-center text-[14px] font-bold text-white">
              {cartQuantity}
            </span>
            <button
              onClick={handleIncrement}
              disabled={isAtMaxQuantity}
              className={cn(
                "w-[36px] h-[36px] flex items-center justify-center text-white transition-colors",
                isAtMaxQuantity ? "opacity-40 cursor-not-allowed" : "hover:bg-black/10"
              )}
            >
              <Plus className="w-[16px] h-[16px]" />
            </button>
          </div>
        ) : (
          /* Add Button */
          <button
            onClick={handleIncrement}
            className="w-[36px] h-[36px] flex items-center justify-center rounded-full text-white transition-colors"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Plus className="w-[18px] h-[18px]" />
          </button>
        )}
      </div>
    </div>
  );
}
