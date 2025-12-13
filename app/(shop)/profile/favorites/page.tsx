'use client';

/**
 * Favorites Page
 *
 * Displays user's favorite items in a product grid.
 * Features:
 * - Product grid (2 cols mobile, 4 cols desktop)
 * - Remove from favorites on heart tap
 * - Add to cart functionality
 * - Empty state with CTA
 * - RTL support
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Loader2,
  HeartOff,
} from 'lucide-react';
import { AppShell } from '@/components/layout';
import { ProductCard } from '@/components/products/product-card';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useAuth } from '@/lib/contexts/auth-context';
import { useFavorites, useRemoveFromFavorites } from '@/lib/services/favorites';
import { useCartStore } from '@/lib/stores/cart-store';
import { cn } from '@/lib/utils';
import type { FavoriteItemData } from '@/types/profile';
import type { CartItem } from '@/types/cart';

export default function FavoritesPage() {
  const router = useRouter();
  const { isRTL } = useTranslations();
  const { isAuthenticated, isLoading: authLoading, openLoginModal } = useAuth();

  // Fetch favorites
  const { data: favoritesData, isLoading } = useFavorites();
  const favorites = favoritesData?.data || [];
  const removeMutation = useRemoveFromFavorites();

  // Cart store for add to cart
  const { addItem, localCart } = useCartStore();
  const cartItems: CartItem[] = localCart.items;

  // Redirect if not authenticated
  useEffect(() => {
    // Don't redirect while still checking authentication
    if (authLoading) return;

    if (!isAuthenticated) {
      openLoginModal();
      router.push('/profile');
    }
  }, [isAuthenticated, openLoginModal, router]);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  // Handle remove from favorites
  const handleRemove = async (itemId: number) => {
    try {
      await removeMutation.mutateAsync(itemId);
    } catch (error) {
      console.error('Remove favorite error:', error);
    }
  };

  // Handle add to cart
  const handleAddToCart = (item: FavoriteItemData) => {
    addItem({
      itemId: item.id || 0,
      name: item.nameEn || '',
      nameAr: item.nameAr || '',
      image: item.itemImageUrl || '',
      quantity: 1,
      normalPrice: item.smallUnitPrice || item.bigUnitPrice || 0,
      discountedPrice: item.smallUnitSpecialPrice || item.bigUnitSpecialPrice,
      itemUnitId: item.smallUnit?.id || item.bigUnit?.id,
    });
  };

  // Get cart quantity for item
  const getCartQuantity = (itemId: number): number => {
    const cartItem = cartItems.find((ci: CartItem) => ci.itemId === itemId);
    return cartItem?.quantity || 0;
  };

  return (
    <AppShell>
      <div className="flex-1 min-w-0 bg-[#F5F5F7] px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/profile"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-[#F0F0F0] transition-colors"
          >
            <BackIcon className="w-5 h-5 text-[#1A1A1A]" />
          </Link>
          <h1 className="text-[24px] font-bold text-[#1A1A1A]">
            {isRTL ? 'المفضلة' : 'Favorites'}
          </h1>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
            <p className="mt-4 text-[#6B7280]">
              {isRTL ? 'جاري التحميل...' : 'Loading...'}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && favorites.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[20px]">
            <div className="w-24 h-24 rounded-full bg-[#F5F5F7] flex items-center justify-center mb-6">
              <HeartOff className="w-12 h-12 text-[#9CA3AF]" />
            </div>
            <h2 className="text-[20px] font-semibold text-[#1A1A1A] mb-2">
              {isRTL ? 'لا توجد مفضلات' : 'No favorites yet'}
            </h2>
            <p className="text-[14px] text-[#6B7280] mb-6 text-center max-w-sm">
              {isRTL
                ? 'ابدأ بإضافة منتجات لقائمة المفضلة الخاصة بك'
                : 'Start adding products to your favorites list'}
            </p>
            <Link
              href="/"
              className="px-6 py-3 rounded-full text-white font-medium"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {isRTL ? 'تصفح المنتجات' : 'Browse Products'}
            </Link>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && favorites.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {favorites.map((item) => (
              <div key={item.id} className="relative">
                {/* Remove from favorites button */}
                <button
                  onClick={() => handleRemove(item.id || 0)}
                  disabled={removeMutation.isPending}
                  className={cn(
                    "absolute top-2 z-10 w-8 h-8 rounded-full bg-white shadow-md",
                    "flex items-center justify-center hover:bg-[#FEE2E2] transition-colors",
                    "disabled:opacity-50",
                    isRTL ? "left-2" : "right-2"
                  )}
                >
                  <Heart className="w-4 h-4 text-[#F44336] fill-[#F44336]" />
                </button>

                <ProductCard
                  id={item.id || 0}
                  name={item.nameEn || ''}
                  nameAr={item.nameAr || ''}
                  image={item.itemImageUrl || '/placeholder-product.png'}
                  price={item.smallUnitPrice || item.bigUnitPrice || 0}
                  originalPrice={
                    (item.smallUnitSpecialPrice && item.smallUnitSpecialPrice < (item.smallUnitPrice || 0))
                      ? item.smallUnitPrice
                      : (item.bigUnitSpecialPrice && item.bigUnitSpecialPrice < (item.bigUnitPrice || 0))
                        ? item.bigUnitPrice
                        : undefined
                  }
                  isAvailable={(item.itemAmount2 || 0) > 0}
                  itemAmount={item.itemAmount2}
                  onAddToCart={() => handleAddToCart(item)}
                  cartQuantity={getCartQuantity(item.id || 0)}
                  smallUnit={item.smallUnit ? {
                    id: item.smallUnit.id || 0,
                    name: item.smallUnit.unitNameEN || '',
                    nameAr: item.smallUnit.unitNameAR || '',
                    amount: item.smallUnit.unitAmount || 1,
                    price: item.smallUnitPrice || 0,
                    specialPrice: item.smallUnitSpecialPrice,
                  } : undefined}
                  bigUnit={item.bigUnit ? {
                    id: item.bigUnit.id || 0,
                    name: item.bigUnit.unitNameEN || '',
                    nameAr: item.bigUnit.unitNameAR || '',
                    amount: item.bigUnit.unitAmount || 1,
                    price: item.bigUnitPrice || 0,
                    specialPrice: item.bigUnitSpecialPrice,
                  } : undefined}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
