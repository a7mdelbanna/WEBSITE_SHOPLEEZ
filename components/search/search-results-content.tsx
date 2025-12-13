'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Loader2, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useSearchProductsPaginated } from '@/lib/services/products';
import { ProductCard } from '@/components/products/product-card';
import { ProductDetailModal, useProductDetailModal, type ProductDetailData } from '@/components/products/product-detail-modal';
import { useLocalCartItems, useCartStore } from '@/lib/stores/cart-store';
import { getCartItemKey } from '@/lib/services/cart';
import { toast } from '@/lib/stores/toast-store';
import { cn } from '@/lib/utils';
import type { ProductSummary } from '@/types/product';
import type { AddToCartRequest } from '@/types/cart';

export function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isRTL } = useTranslations();
  const query = searchParams.get('q') || '';
  const [page, setPage] = useState(1);
  const pageSize = 24;

  // Product detail modal
  const { isOpen, selectedProduct, openModal, closeModal } = useProductDetailModal();

  // Cart integration
  const localCartItems = useLocalCartItems();
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  // Fetch search results
  const { data, isLoading, error } = useSearchProductsPaginated(query, page, pageSize, true);

  // Reset to page 1 when query changes
  useEffect(() => {
    setPage(1);
  }, [query]);

  // Get cart quantity for a product
  const getCartQuantity = (product: ProductSummary): number => {
    const unit = product.smallUnit || product.bigUnit;
    const key = getCartItemKey(product.id, unit?.id, undefined);
    const cartItem = localCartItems.find(item =>
      getCartItemKey(item.itemId, item.selectedUnitId, item.selectedFlavorId) === key
    );
    return cartItem?.quantity || 0;
  };

  // Handle add to cart
  const handleAddToCart = (product: ProductSummary) => {
    const selectedUnit = product.smallUnit || product.bigUnit;
    if (!selectedUnit) return;

    const request: AddToCartRequest = {
      itemId: product.id,
      quantity: 1,
      customerUnitId: selectedUnit.id,
      itemUnitId: selectedUnit.id,
      normalPrice: selectedUnit.price,
      itemPriceAfterDiscount: selectedUnit.discountPrice,
      name: product.name,
      nameAr: product.nameAr,
      image: product.mainImage || product.imageUrl,
      bigUnitId: product.bigUnit?.id,
      smallUnitId: product.smallUnit?.id,
      isMaximumAmountForUser: product.isMaximumAmountForUser,
      maximumAmountForUser: product.maximumAmountForUser,
    };

    addItem(request);
  };

  // Handle quantity update
  const handleUpdateQuantity = (product: ProductSummary, newQuantity: number) => {
    const selectedUnit = product.smallUnit || product.bigUnit;
    if (!selectedUnit) return;

    if (newQuantity <= 0) {
      removeItem(product.id, selectedUnit.id, undefined);
    } else {
      updateQuantity(product.id, selectedUnit.id, undefined, newQuantity);
    }
  };

  // Handle product click - open modal
  const handleProductClick = (product: ProductSummary) => {
    // Convert ProductSummary to ProductDetailData format
    const selectedUnit = product.smallUnit || product.bigUnit;
    const productDetail: ProductDetailData = {
      id: product.id,
      name: product.name || product.nameEn || '',
      nameAr: product.nameAr,
      image: product.mainImage || product.imageUrl || '',
      price: selectedUnit?.discountPrice || selectedUnit?.price || product.price,
      originalPrice: selectedUnit?.discountPrice ? selectedUnit.price : undefined,
      bigUnit: product.bigUnit,
      smallUnit: product.smallUnit,
      bigUnitPrice: product.bigUnitPrice,
      smallUnitPrice: product.smallUnitPrice,
      bigUnitImageUrl: product.bigUnitImageUrl,
      smallUnitImageUrl: product.smallUnitImageUrl,
      isAvailable: product.itemAmount && product.itemAmount > 0,
      itemAmount: product.itemAmount,
      isMaximumAmountForUser: product.isMaximumAmountForUser,
      maximumAmountForUser: product.maximumAmountForUser,
    };
    openModal(productDetail);
  };

  // Handle modal add to cart callback
  const handleModalAddToCart = (_productId: number) => {
    toast.success('Added to cart', 'تمت الإضافة إلى السلة');
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    if (!data) return [];
    const { totalPages } = data;
    const pages: number[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push(-1); // Ellipsis
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const items = data?.items || [];
  const totalCount = data?.totalCount || 0;

  return (
    <>
      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isOpen}
        onClose={closeModal}
        onAddToCart={handleModalAddToCart}
      />

      <div className="flex-1 min-w-0 bg-white rounded-2xl px-6 py-6 mx-2 my-2">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F5F5F7] hover:bg-[#ECECEC] transition-colors"
        >
          <BackIcon className="w-5 h-5 text-[#1A1A1A]" />
        </button>
        <div className="flex items-center gap-2">
          <Search className="w-6 h-6 text-[var(--color-primary)]" />
          <h1 className="text-[28px] font-bold text-[#1A1A1A]">
            {isRTL ? 'نتائج البحث' : 'Search Results'}
          </h1>
        </div>
      </div>

      {/* Search Query Display */}
      {query && (
        <div className="mb-6">
          <h2 className="text-[20px] leading-tight">
            <span className="text-[#9CA3AF] font-light">
              {isRTL ? 'نتائج عن' : 'Results for'}
            </span>{' '}
            <span className="text-[#1A1A1A] font-bold">"{query}"</span>
          </h2>
          {!isLoading && (
            <p className="text-[14px] text-[#6B7280] mt-1">
              {totalCount} {isRTL ? 'منتج' : totalCount === 1 ? 'product' : 'products'} {isRTL ? 'تم العثور عليها' : 'found'}
            </p>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
          <p className="ml-3 text-[#6B7280]">
            {isRTL ? 'جاري البحث...' : 'Searching...'}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && items.length === 0 && query && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 rounded-full bg-[#F5F5F7] flex items-center justify-center mb-6">
            <Search className="w-12 h-12 text-[#9CA3AF]" />
          </div>
          <h2 className="text-[20px] font-semibold text-[#1A1A1A] mb-2">
            {isRTL ? 'لا توجد نتائج' : 'No results found'}
          </h2>
          <p className="text-[14px] text-[#6B7280] text-center max-w-md mb-6">
            {isRTL
              ? `لم نتمكن من العثور على أي منتجات تطابق "${query}". جرب كلمات مفتاحية مختلفة.`
              : `We couldn't find any products matching "${query}". Try different keywords.`}
          </p>
          <Link
            href="/"
            className="px-6 py-3 rounded-full text-white font-medium"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
          </Link>
        </div>
      )}

      {/* No Query State */}
      {!query && (
        <div className="flex flex-col items-center justify-center py-20">
          <Search className="w-16 h-16 text-[#D1D5DB] mb-4" />
          <p className="text-[16px] text-[#6B7280]">
            {isRTL ? 'أدخل كلمة بحث للبدء' : 'Enter a search term to begin'}
          </p>
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && items.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {items.map((product) => {
              const cartQuantity = getCartQuantity(product);
              const selectedUnit = product.smallUnit || product.bigUnit;

              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  nameAr={product.nameAr}
                  image={product.mainImage || product.imageUrl || ''}
                  price={selectedUnit?.discountPrice || selectedUnit?.price || product.price}
                  originalPrice={selectedUnit?.discountPrice ? selectedUnit.price : undefined}
                  isAvailable={product.itemAmount && product.itemAmount > 0}
                  cartQuantity={cartQuantity}
                  onAddToCart={() => handleAddToCart(product)}
                  onUpdateQuantity={(qty) => handleUpdateQuantity(product, qty)}
                  onClick={() => handleProductClick(product)}
                />
              );
            })}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={!data.hasPreviousPage}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#F5F5F7] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
              </button>

              {getPageNumbers().map((pageNum, idx) => {
                if (pageNum === -1) {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-2 text-[#9CA3AF]">
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={cn(
                      "w-10 h-10 rounded-full text-[14px] font-medium transition-colors",
                      page === pageNum
                        ? "text-white"
                        : "text-[#1A1A1A] hover:bg-[#F5F5F7]"
                    )}
                    style={page === pageNum ? { backgroundColor: 'var(--color-primary)' } : undefined}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={!data.hasNextPage}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#F5F5F7] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className={cn("w-5 h-5", isRTL && "rotate-180")} />
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </>
  );
}
