'use client';

/**
 * Product Detail Modal - Localized Version
 *
 * Key structural details:
 * 1. LEFT COLUMN: TWO separate blocks
 *    - Image card (grey bg, large radius) - contains ONLY image + badge
 *    - Related products block (separate, below image)
 * 2. RIGHT COLUMN: Details + STICKY add-to-cart bar (right column width only)
 * 3. Collapsible sections with fade-out gradient when collapsed
 * 4. Full Arabic/English localization support
 * 5. Fetches full product data and related products from API
 *
 * IMPORTANT: All hooks must be called before any conditional returns
 * to comply with React's Rules of Hooks.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { X, Share2, ChevronDown, ChevronUp, Loader2, Plus, Minus, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useTenant, useCurrency } from '@/lib/hooks/use-tenant';
import { useAuth } from '@/lib/contexts/auth-context';
import { formatPrice } from '@/lib/utils/format';
import { useProductById, useRelatedProducts } from '@/lib/services/products';
import { useCartStore, useLocalCartItems } from '@/lib/stores/cart-store';
import { getCartItemKey } from '@/lib/services/cart';
import { toast } from '@/lib/stores/toast-store';

/**
 * Unit info for modal display
 */
interface ProductUnitInfo {
  id: number;
  name: string;
  nameAr: string;
  amount: number;
  price: number;
  specialPrice?: number;  // Discounted price for this unit
  imageUrl?: string;
}

export interface ProductDetailData {
  id: number;
  name: string;
  nameAr?: string;
  image: string;
  images?: string[];
  price: number;
  originalPrice?: number;
  volume?: string;
  badge?: {
    text: string;
    textAr?: string;
    variant: 'discount' | 'tag' | 'new';
  };
  highlights?: string[];
  highlightsAr?: string[];
  description?: string;
  descriptionAr?: string;
  usage?: string;
  usageAr?: string;
  composition?: string;
  compositionAr?: string;
  shelfLife?: string;
  storageConditions?: string;
  storageConditionsAr?: string;
  manufacturer?: string;
  manufacturerAr?: string;
  quantity?: string;
  productType?: string;
  productTypeAr?: string;
  brand?: string;
  brandAr?: string;
  applicationArea?: string;
  applicationAreaAr?: string;
  relatedProducts?: RelatedProduct[];
  // Unit support
  bigUnit?: ProductUnitInfo;
  smallUnit?: ProductUnitInfo;
  bigUnitPrice?: number;
  smallUnitPrice?: number;
  bigUnitImageUrl?: string;
  smallUnitImageUrl?: string;
  // Stock & availability validation
  isAvailable?: boolean;
  itemAmount?: number;
  isMaximumAmountForUser?: boolean;
  maximumAmountForUser?: number;
}

interface RelatedProduct {
  id: number;
  name: string;
  nameAr?: string;
  image: string;
  price: number;
  originalPrice?: number;
  weight?: string;
  badge?: {
    text: string;
    textAr?: string;
    variant: 'discount' | 'tag' | 'new';
  };
  promoText?: string;
}

interface ProductDetailModalProps {
  product: ProductDetailData | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (productId: number) => void;
}

// Collapsible section with fade-out gradient
function CollapsibleSection({
  title,
  content,
  isExpanded,
  onToggle,
}: {
  title: string;
  content: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ borderTop: '1px solid var(--color-border-light)' }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-[12px] text-left"
      >
        <span className="text-[13px]" style={{ color: 'var(--color-text-primary)' }}>{title}</span>
        <ChevronUp
          className={cn(
            "w-[16px] h-[16px] transition-transform duration-200",
            !isExpanded && "rotate-180"
          )}
          style={{ color: 'var(--color-text-muted)' }}
        />
      </button>
      <div className="relative">
        <div
          className={cn(
            "text-[13px] leading-[1.6] overflow-hidden transition-all duration-200",
            isExpanded ? "max-h-[2000px] pb-[12px]" : "max-h-[60px]"
          )}
          style={{ color: 'var(--color-text-primary)' }}
        >
          {content}
        </div>
        {/* Fade-out gradient when collapsed */}
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-[40px] pointer-events-none" style={{ background: 'linear-gradient(to top, var(--color-bg-card), transparent)' }} />
        )}
      </div>
    </div>
  );
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  // ============================================================================
  // ALL HOOKS MUST BE CALLED FIRST (before any conditional returns)
  // ============================================================================

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [selectedUnit, setSelectedUnit] = useState<'small' | 'big'>('small');
  const { t, locale, isRTL } = useTranslations();
  const currency = useCurrency();
  const { requireAuth } = useAuth();

  // LOCAL-FIRST: Use local cart store instead of API
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

  // Fetch full product details from API
  const { data: fullProduct, isLoading: isLoadingProduct } = useProductById(
    product?.id || 0,
    isOpen && !!product?.id
  );

  // Fetch related products from API
  const { data: relatedProducts, isLoading: isLoadingRelated } = useRelatedProducts(
    product?.id || 0,
    isOpen && !!product?.id
  );

  // Computed values using useMemo (must be before early return)
  const displayProduct = useMemo(() => {
    if (!product) return null;

    const passedBigUnitName = product.bigUnit
      ? (locale === 'ar' ? (product.bigUnit.nameAr || product.bigUnit.name) : product.bigUnit.name)
      : undefined;
    const passedSmallUnitName = product.smallUnit
      ? (locale === 'ar' ? (product.smallUnit.nameAr || product.smallUnit.name) : product.smallUnit.name)
      : undefined;

    return {
      ...product,
      bigUnitName: passedBigUnitName,
      smallUnitName: passedSmallUnitName,
      ...(fullProduct ? {
        name: fullProduct.name,
        nameAr: fullProduct.nameAr,
        description: fullProduct.description,
        descriptionAr: fullProduct.descriptionAr,
        image: fullProduct.mainImage || product.image,
        price: fullProduct.price,
        brand: fullProduct.companyName,
        brandAr: fullProduct.companyNameAr,
        productType: fullProduct.categoryName,
        productTypeAr: fullProduct.categoryNameAr,
        bigUnitPrice: fullProduct.bigUnitPrice,
        smallUnitPrice: fullProduct.smallUnitPrice,
        bigUnitName: fullProduct.bigUnitName || passedBigUnitName,
        smallUnitName: fullProduct.smallUnitName || passedSmallUnitName,
        bigUnitImageUrl: fullProduct.bigUnitImageUrl,
        smallUnitImageUrl: fullProduct.smallUnitImageUrl,
        calories: fullProduct.calories,
        protein: fullProduct.protein,
        fat: fullProduct.fat,
        carbs: fullProduct.carbs,
      } : {}),
      relatedProducts: relatedProducts?.map(rp => ({
        id: rp.id,
        name: rp.name || rp.nameEn || '',
        nameAr: rp.nameAr,
        image: rp.imageUrl || rp.mainImage || '',
        price: rp.price,
        originalPrice: rp.originalPrice,
        weight: rp.volume || rp.weight,
        badge: rp.discountPercent ? {
          text: `-${rp.discountPercent}%`,
          textAr: `${rp.discountPercent}%-`,
          variant: 'discount' as const,
        } : undefined,
      })) || product.relatedProducts,
    };
  }, [product, fullProduct, relatedProducts, locale]);

  // Computed price/unit values
  const computedValues = useMemo(() => {
    if (!product || !displayProduct) {
      return {
        hasMultipleUnits: false,
        currentPrice: 0,
        currentImage: '',
        currentUnitName: '',
        hasDiscount: false,
        hasMultipleUnitsForCart: false,
        effectiveSelectedUnit: 'small' as const,
        currentUnitId: undefined as number | undefined,
        smallQty: 0,
        bigQty: 0,
        legacyQty: 0,
        cartQuantity: 0,
        isOutOfStock: false,
        isUnavailable: false,
        isAtMaxPerUserLimit: false,
        isAtStockLimit: false,
        isAtMaxQuantity: false,
        canAddToCart: false,
      };
    }

    const hasMultipleUnits = displayProduct.bigUnitPrice && displayProduct.smallUnitPrice &&
      displayProduct.bigUnitPrice !== displayProduct.smallUnitPrice;
    const currentPrice = selectedUnit === 'big'
      ? (displayProduct.bigUnitPrice || displayProduct.price)
      : (displayProduct.smallUnitPrice || displayProduct.price);
    const currentImage = selectedUnit === 'big'
      ? (displayProduct.bigUnitImageUrl || displayProduct.image)
      : (displayProduct.smallUnitImageUrl || displayProduct.image);
    const currentUnitName = selectedUnit === 'big'
      ? displayProduct.bigUnitName
      : displayProduct.smallUnitName;

    const hasDiscount = displayProduct.originalPrice && displayProduct.originalPrice > currentPrice;

    const hasMultipleUnitsForCart = product?.bigUnit && product?.smallUnit;
    const effectiveSelectedUnit = hasMultipleUnitsForCart
      ? selectedUnit
      : (product?.smallUnit ? 'small' : 'big');
    const currentUnitObj = effectiveSelectedUnit === 'big' ? product?.bigUnit : product?.smallUnit;
    const currentUnitId = currentUnitObj?.id;

    const smallQty = product?.smallUnit?.id ? getDisplayQuantity(product.id, product.smallUnit.id, undefined) : 0;
    const bigQty = product?.bigUnit?.id ? getDisplayQuantity(product.id, product.bigUnit.id, undefined) : 0;
    const legacyQty = product ? getDisplayQuantity(product.id, undefined, undefined) : 0;

    const cartQuantity = effectiveSelectedUnit === 'big'
      ? (bigQty || legacyQty)
      : (smallQty || legacyQty);

    const isOutOfStock = product?.itemAmount !== undefined && product.itemAmount <= 0;
    const isUnavailable = product?.isAvailable === false;

    const isAtMaxPerUserLimit = product?.isMaximumAmountForUser && product?.maximumAmountForUser
      ? cartQuantity >= product.maximumAmountForUser
      : false;

    const isAtStockLimit = product?.itemAmount !== undefined && product.itemAmount > 0
      ? cartQuantity >= product.itemAmount
      : false;

    const isAtMaxQuantity = isAtMaxPerUserLimit || isAtStockLimit;
    const canAddToCart = !isOutOfStock && !isUnavailable;

    return {
      hasMultipleUnits,
      currentPrice,
      currentImage,
      currentUnitName,
      hasDiscount,
      hasMultipleUnitsForCart,
      effectiveSelectedUnit,
      currentUnitId,
      smallQty,
      bigQty,
      legacyQty,
      cartQuantity,
      isOutOfStock,
      isUnavailable,
      isAtMaxPerUserLimit,
      isAtStockLimit,
      isAtMaxQuantity,
      canAddToCart,
    };
  }, [product, displayProduct, selectedUnit, getDisplayQuantity]);

  // Destructure computed values for easier access
  const {
    hasMultipleUnits,
    currentPrice,
    currentImage,
    currentUnitName,
    hasDiscount,
    effectiveSelectedUnit,
    currentUnitId,
    cartQuantity,
    isOutOfStock,
    isUnavailable,
    isAtMaxQuantity,
    canAddToCart,
  } = computedValues;

  // Toggle section handler
  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);

  // Handle add to cart - LOCAL ONLY, NO API call (following Flutter documentation)
  const handleAddToCart = useCallback(() => {
    if (!product || !displayProduct || !canAddToCart) return;

    requireAuth(() => {
      let unitObj = effectiveSelectedUnit === 'big' ? product.bigUnit : product.smallUnit;
      if (!unitObj) {
        unitObj = product.smallUnit || product.bigUnit;
      }

      const unitId = unitObj?.id;
      const discountPrice = unitObj?.specialPrice || displayProduct.originalPrice;

      console.log('[ProductModal] LOCAL add to cart:', {
        itemId: product.id,
        selectedUnit: effectiveSelectedUnit,
        unitId,
        price: currentPrice,
      });

      addItem({
        itemId: product.id,
        quantity: 1,
        customerUnitId: unitId,
        itemUnitId: unitId,
        normalPrice: currentPrice,
        itemPriceAfterDiscount: discountPrice,
        name: displayProduct.name,
        nameAr: displayProduct.nameAr,
        image: displayProduct.image,
        bigUnitId: product.bigUnit?.id,
        smallUnitId: product.smallUnit?.id,
        isMaximumAmountForUser: product.isMaximumAmountForUser,
        maximumAmountForUser: product.maximumAmountForUser,
      });

      toast.success('Added to cart', 'تمت الإضافة إلى السلة');
      onAddToCart?.(product.id);
    });
  }, [product, displayProduct, canAddToCart, effectiveSelectedUnit, currentPrice, addItem, requireAuth, onAddToCart]);

  // Handle quantity update - LOCAL ONLY, NO API call
  const handleUpdateQuantity = useCallback((newQuantity: number) => {
    if (!product) return;

    console.log('[ProductModal] LOCAL update quantity:', {
      productId: product.id,
      newQuantity,
      unitId: currentUnitId,
    });

    if (newQuantity <= 0) {
      removeItem(product.id, currentUnitId, undefined);
    } else {
      updateQuantity(product.id, currentUnitId, undefined, newQuantity);
    }
  }, [product, currentUnitId, updateQuantity, removeItem]);

  // Handle increment
  const handleIncrement = useCallback(() => {
    if (isAtMaxQuantity) {
      toast.error('Maximum quantity reached', 'تم الوصول للحد الأقصى');
      return;
    }
    if (cartQuantity === 0) {
      handleAddToCart();
    } else {
      handleUpdateQuantity(cartQuantity + 1);
    }
  }, [cartQuantity, isAtMaxQuantity, handleAddToCart, handleUpdateQuantity]);

  // Handle decrement
  const handleDecrement = useCallback(() => {
    if (cartQuantity > 0) {
      handleUpdateQuantity(cartQuantity - 1);
    }
  }, [cartQuantity, handleUpdateQuantity]);

  // Handle notify me
  const handleNotifyMe = useCallback(() => {
    toast.info('You will be notified when available', 'سيتم إعلامك عند توفره');
  }, []);

  // Effects (must be before early return)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    setSelectedUnit('small');
  }, [product?.id]);

  // ============================================================================
  // EARLY RETURN - Only after ALL hooks have been called
  // ============================================================================
  if (!isOpen || !product || !displayProduct) return null;

  // Localized getters
  const getName = () => locale === 'ar' ? (displayProduct.nameAr || displayProduct.name) : displayProduct.name;
  const getDescription = () => locale === 'ar' ? (displayProduct.descriptionAr || displayProduct.description) : displayProduct.description;
  const getUsage = () => locale === 'ar' ? (displayProduct.usageAr || displayProduct.usage) : displayProduct.usage;
  const getComposition = () => locale === 'ar' ? (displayProduct.compositionAr || displayProduct.composition) : displayProduct.composition;
  const getHighlights = () => locale === 'ar' ? (displayProduct.highlightsAr || displayProduct.highlights) : displayProduct.highlights;
  const getBadgeText = () => locale === 'ar' ? (displayProduct.badge?.textAr || displayProduct.badge?.text) : displayProduct.badge?.text;
  const getStorageConditions = () => locale === 'ar' ? (displayProduct.storageConditionsAr || displayProduct.storageConditions) : displayProduct.storageConditions;
  const getManufacturer = () => locale === 'ar' ? (displayProduct.manufacturerAr || displayProduct.manufacturer) : displayProduct.manufacturer;
  const getProductType = () => locale === 'ar' ? (displayProduct.productTypeAr || displayProduct.productType) : displayProduct.productType;
  const getBrand = () => locale === 'ar' ? (displayProduct.brandAr || displayProduct.brand) : displayProduct.brand;
  const getApplicationArea = () => locale === 'ar' ? (displayProduct.applicationAreaAr || displayProduct.applicationArea) : displayProduct.applicationArea;
  const getSmallUnitName = () => displayProduct.smallUnitName || t('product.smallUnit');
  const getBigUnitName = () => displayProduct.bigUnitName || t('product.bigUnit');

  const getRelatedName = (related: RelatedProduct) => locale === 'ar' ? (related.nameAr || related.name) : related.name;
  const getRelatedBadgeText = (related: RelatedProduct) => locale === 'ar' ? (related.badge?.textAr || related.badge?.text) : related.badge?.text;

  return (
    <>
      {/* Dark overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-[100]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal container - centered */}
      <div
        className="fixed inset-0 z-[101] flex items-center justify-center p-[16px] overflow-hidden"
        onClick={onClose}
      >
        {/* Modal box */}
        <div
          className="relative w-full max-w-[920px] max-h-[90vh] bg-white rounded-[20px] shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button - top right corner (RTL-aware) */}
          <button
            onClick={onClose}
            className={cn(
              "absolute top-[16px] z-30 w-[32px] h-[32px] rounded-full flex items-center justify-center transition-colors bg-white/80",
              isRTL ? "left-[16px]" : "right-[16px]"
            )}
            style={{ '--hover-bg': 'var(--color-bg-page)' } as React.CSSProperties}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-page)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'}
            aria-label={t('common.close')}
          >
            <X className="w-[20px] h-[20px]" style={{ color: 'var(--color-text-secondary)' }} />
          </button>

          {/* Two-column layout - both columns scroll independently */}
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

            {/* LEFT COLUMN - Image + Related Products (scrolls independently) */}
            <div className="w-full md:w-[480px] shrink-0 p-[16px] space-y-[16px] overflow-y-auto">

              {/* Block 1: Image Card - with unit toggle */}
              <div className="relative rounded-[24px] overflow-hidden" style={{ backgroundColor: 'var(--color-bg-page)' }}>
                  {/* Discount badge */}
                  {displayProduct.badge && (
                    <div
                      className={cn(
                        'absolute top-[16px] px-[12px] py-[6px] rounded-[8px] text-[13px] font-semibold text-white z-10',
                        isRTL ? 'right-[16px]' : 'left-[16px]'
                      )}
                      style={{
                        backgroundColor:
                          displayProduct.badge.variant === 'discount' ? 'var(--color-badge-discount)' :
                          displayProduct.badge.variant === 'tag' ? 'var(--color-badge-tag)' :
                          displayProduct.badge.variant === 'new' ? 'var(--color-badge-new)' :
                          'var(--color-badge-discount)'
                      }}
                    >
                      {getBadgeText()}
                    </div>
                  )}

                  {/* Loading indicator */}
                  {isLoadingProduct && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-20">
                      <Loader2 className="w-[32px] h-[32px] animate-spin" style={{ color: 'var(--color-primary)' }} />
                    </div>
                  )}

                  {/* Product image */}
                  <div className="relative aspect-square p-[32px]">
                    {currentImage ? (
                      <Image
                        src={currentImage}
                        alt={getName()}
                        fill
                        className="object-contain"
                        sizes="450px"
                        priority
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center rounded-[16px]" style={{ backgroundColor: 'var(--color-bg-input)' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>{t('common.noImage')}</span>
                      </div>
                    )}
                  </div>

                  {/* Premium Unit Toggle - Segmented Control with Prices */}
                  {hasMultipleUnits && (
                    <div className="absolute bottom-[16px] left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[320px]">
                      <div className="relative flex bg-white/95 backdrop-blur-md rounded-[16px] p-[4px] shadow-xl border border-white/20">
                        {/* Sliding Background */}
                        <div
                          className={cn(
                            "absolute top-[4px] bottom-[4px] w-[calc(50%-2px)] rounded-[12px] shadow-md transition-all duration-300 ease-out",
                            selectedUnit === 'big'
                              ? (isRTL ? "left-[4px]" : "left-[calc(50%+2px)]")
                              : (isRTL ? "left-[calc(50%+2px)]" : "left-[4px]")
                          )}
                          style={{ background: 'var(--gradient-primary)' }}
                        />

                        {/* Small Unit Option */}
                        <button
                          onClick={() => setSelectedUnit('small')}
                          className={cn(
                            "relative flex-1 flex flex-col items-center py-[10px] px-[8px] rounded-[12px] transition-all duration-300 z-10",
                            selectedUnit === 'small' ? "text-white" : ""
                          )}
                          style={{ color: selectedUnit === 'small' ? 'white' : 'var(--color-text-secondary)' }}
                        >
                          <span className={cn(
                            "text-[13px] font-semibold transition-colors duration-300"
                          )}
                          style={{ color: selectedUnit === 'small' ? 'white' : 'var(--color-text-primary)' }}>
                            {getSmallUnitName()}
                          </span>
                          <span className={cn(
                            "text-[12px] font-bold mt-[2px] transition-colors duration-300"
                          )}
                          style={{ color: selectedUnit === 'small' ? 'rgba(255, 255, 255, 0.9)' : 'var(--color-primary)' }}>
                            {formatPrice(displayProduct.smallUnitPrice || displayProduct.price, currency, locale)}
                          </span>
                        </button>

                        {/* Big Unit Option */}
                        <button
                          onClick={() => setSelectedUnit('big')}
                          className={cn(
                            "relative flex-1 flex flex-col items-center py-[10px] px-[8px] rounded-[12px] transition-all duration-300 z-10",
                            selectedUnit === 'big' ? "text-white" : ""
                          )}
                          style={{ color: selectedUnit === 'big' ? 'white' : 'var(--color-text-secondary)' }}
                        >
                          <span className={cn(
                            "text-[13px] font-semibold transition-colors duration-300"
                          )}
                          style={{ color: selectedUnit === 'big' ? 'white' : 'var(--color-text-primary)' }}>
                            {getBigUnitName()}
                          </span>
                          <span className={cn(
                            "text-[12px] font-bold mt-[2px] transition-colors duration-300"
                          )}
                          style={{ color: selectedUnit === 'big' ? 'rgba(255, 255, 255, 0.9)' : 'var(--color-primary)' }}>
                            {formatPrice(displayProduct.bigUnitPrice || displayProduct.price, currency, locale)}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Single unit indicator - Clean pill design */}
                  {!hasMultipleUnits && currentUnitName && (
                    <div className="absolute bottom-[16px] left-1/2 -translate-x-1/2">
                      <div className="backdrop-blur-md rounded-[12px] px-[20px] py-[10px] shadow-xl border border-white/20" style={{ background: 'var(--gradient-primary)' }}>
                        <span className="text-[13px] font-semibold text-white">
                          {currentUnitName}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Block 2: Related Products - SEPARATE from image */}
                {displayProduct.relatedProducts && displayProduct.relatedProducts.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <h3
                      className={cn(
                        "text-[16px] font-bold",
                        isRTL && "text-right"
                      )}
                      style={{ marginBottom: '16px', color: 'var(--color-text-primary)' }}
                    >
                      {t('product.relatedProducts')}
                    </h3>
                    {isLoadingRelated ? (
                      <div className="flex items-center justify-center" style={{ padding: '24px 0' }}>
                        <Loader2 className="w-[24px] h-[24px] animate-spin" style={{ color: 'var(--color-primary)' }} />
                      </div>
                    ) : (
                      <div className="flex overflow-x-auto scrollbar-hide" style={{ gap: '12px', paddingBottom: '12px' }}>
                        {displayProduct.relatedProducts.map((related) => (
                          <div
                            key={related.id}
                            className="shrink-0 rounded-[16px] overflow-hidden"
                            style={{ width: '160px', backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-light)' }}
                          >
                            {/* Card image */}
                            <div className="relative aspect-square rounded-t-[16px]" style={{ backgroundColor: 'var(--color-bg-page)' }}>
                              {related.image ? (
                                <Image
                                  src={related.image}
                                  alt={getRelatedName(related)}
                                  fill
                                  className="object-contain"
                                  style={{ padding: '16px' }}
                                  sizes="160px"
                                  unoptimized
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-[12px]" style={{ color: 'var(--color-gray-300)' }}>{t('common.noImage')}</span>
                                </div>
                              )}
                              {related.badge && (
                                <div className={cn(
                                  "absolute px-[8px] py-[3px] rounded-[6px] text-[11px] font-semibold text-white",
                                  isRTL ? "right-[8px]" : "left-[8px]"
                                )} style={{ bottom: '10px', backgroundColor: 'var(--color-badge-discount)' }}>
                                  {getRelatedBadgeText(related)}
                                </div>
                              )}
                            </div>
                            {/* Card content */}
                            <div style={{ padding: '12px', paddingTop: '10px' }}>
                              <p
                                className={cn(
                                  "text-[13px] leading-[1.3] line-clamp-2",
                                  isRTL && "text-right"
                                )}
                                style={{ height: '34px', marginBottom: '8px', color: 'var(--color-text-primary)' }}
                              >
                                {getRelatedName(related)}
                              </p>
                              {/* Price row */}
                              <div className={cn("flex items-center", isRTL && "justify-end")}>
                                <div
                                  className="flex items-center rounded-full"
                                  style={{ gap: '6px', padding: '6px 12px', backgroundColor: 'var(--color-primary-light)' }}
                                >
                                  {related.originalPrice && (
                                    <span className="text-[11px] line-through" style={{ color: 'var(--color-text-muted)' }}>
                                      {formatPrice(related.originalPrice, currency, locale)}
                                    </span>
                                  )}
                                  <span className="text-[14px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                                    {formatPrice(related.price, currency, locale)}
                                  </span>
                                  <span className="text-[16px]" style={{ color: 'var(--color-primary)' }}>+</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

            {/* RIGHT COLUMN - Product Details with sticky bottom CTA */}
            <div className="flex-1 flex flex-col overflow-y-auto relative">
              {/* Scrollable details area */}
              <div className={cn(
                "flex-1 p-[24px] pt-[24px] pb-[80px]",
                isRTL ? "pl-[32px]" : "pr-[32px]"
              )}>
                  {/* Product name */}
                  <h1
                    className={cn(
                      "text-[22px] font-bold leading-[1.25]",
                      isRTL ? "text-right pl-[32px]" : "pr-[32px]"
                    )}
                    style={{ marginBottom: '20px', color: 'var(--color-text-primary)' }}
                  >
                    {getName()}
                  </h1>

                  {/* Share button - grey pill */}
                  <button
                    className={cn(
                      "inline-flex items-center gap-[8px] rounded-full text-[13px] transition-colors",
                      isRTL && "flex-row-reverse"
                    )}
                    style={{
                      height: '40px',
                      paddingLeft: '18px',
                      paddingRight: '18px',
                      marginBottom: '24px',
                      backgroundColor: 'var(--color-bg-page)',
                      color: 'var(--color-text-primary)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-page)'}
                  >
                    <Share2 className="w-[16px] h-[16px]" />
                    {t('product.share')}
                  </button>

                  {/* Volume - lighter, smaller */}
                  {product.volume && (
                    <p className={cn(
                      "text-[15px] mb-[14px]",
                      isRTL && "text-right"
                    )}
                    style={{ color: 'var(--color-text-muted)' }}>
                      {product.volume}
                    </p>
                  )}

                  {/* Bullet points */}
                  {getHighlights() && getHighlights()!.length > 0 && (
                    <ul className="mb-[14px] space-y-[4px]">
                      {getHighlights()!.map((highlight, idx) => (
                        <li key={idx} className={cn(
                          "flex items-start gap-[8px] text-[14px] leading-[1.4]",
                          isRTL && "flex-row-reverse text-right"
                        )}
                        style={{ color: 'var(--color-text-primary)' }}>
                          <span className="mt-[8px] text-[4px]" style={{ color: 'var(--color-text-muted)' }}>●</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Description */}
                  {getDescription() && (
                    <p className={cn(
                      "text-[14px] leading-[1.65] mb-[16px]",
                      isRTL && "text-right"
                    )}
                    style={{ color: 'var(--color-text-primary)' }}>
                      {getDescription()}
                    </p>
                  )}

                  {/* Collapsible: Usage */}
                  {getUsage() && (
                    <CollapsibleSection
                      title={t('product.usage')}
                      content={getUsage()!}
                      isExpanded={expandedSections.has('usage')}
                      onToggle={() => toggleSection('usage')}
                    />
                  )}

                  {/* Collapsible: Composition */}
                  {getComposition() && (
                    <CollapsibleSection
                      title={t('product.composition')}
                      content={getComposition()!}
                      isExpanded={expandedSections.has('composition')}
                      onToggle={() => toggleSection('composition')}
                    />
                  )}

                  {/* Additional details */}
                  <div className="pt-[14px] space-y-[12px] mt-[4px]" style={{ borderTop: '1px solid var(--color-border-light)' }}>
                    {product.shelfLife && (
                      <div className={isRTL ? "text-right" : ""}>
                        <p className="text-[12px] mb-[2px]" style={{ color: 'var(--color-text-muted)' }}>{t('product.shelfLife')}</p>
                        <p className="text-[14px]" style={{ color: 'var(--color-text-primary)' }}>{product.shelfLife}</p>
                      </div>
                    )}
                    {getStorageConditions() && (
                      <div className={isRTL ? "text-right" : ""}>
                        <p className="text-[12px] mb-[2px]" style={{ color: 'var(--color-text-muted)' }}>{t('product.storageConditions')}</p>
                        <p className="text-[14px]" style={{ color: 'var(--color-text-primary)' }}>{getStorageConditions()}</p>
                      </div>
                    )}
                    {getManufacturer() && (
                      <div className={isRTL ? "text-right" : ""}>
                        <p className="text-[12px] mb-[2px]" style={{ color: 'var(--color-text-muted)' }}>{t('product.manufacturer')}</p>
                        <p className="text-[14px]" style={{ color: 'var(--color-text-primary)' }}>{getManufacturer()}</p>
                      </div>
                    )}
                    {product.quantity && (
                      <div className={isRTL ? "text-right" : ""}>
                        <p className="text-[12px] mb-[2px]" style={{ color: 'var(--color-text-muted)' }}>{t('product.quantityInPackage')}</p>
                        <p className="text-[14px]" style={{ color: 'var(--color-text-primary)' }}>{product.quantity}</p>
                      </div>
                    )}
                    {getProductType() && (
                      <div className={isRTL ? "text-right" : ""}>
                        <p className="text-[12px] mb-[2px]" style={{ color: 'var(--color-text-muted)' }}>{t('product.productType')}</p>
                        <p className="text-[14px]" style={{ color: 'var(--color-text-primary)' }}>{getProductType()}</p>
                      </div>
                    )}
                    {getBrand() && (
                      <div className={isRTL ? "text-right" : ""}>
                        <p className="text-[12px] mb-[2px]" style={{ color: 'var(--color-text-muted)' }}>{t('product.brand')}</p>
                        <p className="text-[14px]" style={{ color: 'var(--color-text-primary)' }}>{getBrand()}</p>
                      </div>
                    )}
                    {getApplicationArea() && (
                      <div className={isRTL ? "text-right" : ""}>
                        <p className="text-[12px] mb-[2px]" style={{ color: 'var(--color-text-muted)' }}>{t('product.applicationArea')}</p>
                        <p className="text-[14px]" style={{ color: 'var(--color-text-primary)' }}>{getApplicationArea()}</p>
                      </div>
                    )}
                  </div>

                  {/* Nutrition Info */}
                  {(displayProduct.calories || displayProduct.protein || displayProduct.fat || displayProduct.carbs) && (
                    <div className="pt-[14px] mt-[4px]" style={{ borderTop: '1px solid var(--color-border-light)' }}>
                      <h4 className={cn(
                        "text-[14px] font-semibold mb-[12px]",
                        isRTL && "text-right"
                      )}
                      style={{ color: 'var(--color-text-primary)' }}>
                        {t('product.nutritionInfo')}
                      </h4>
                      <div className="grid grid-cols-4 gap-[8px]">
                        {displayProduct.calories !== undefined && displayProduct.calories > 0 && (
                          <div className="rounded-[12px] p-[12px] text-center" style={{ backgroundColor: 'var(--color-bg-page)' }}>
                            <p className="text-[18px] font-bold" style={{ color: 'var(--color-text-primary)' }}>{displayProduct.calories}</p>
                            <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{t('product.calories')}</p>
                          </div>
                        )}
                        {displayProduct.protein !== undefined && displayProduct.protein > 0 && (
                          <div className="rounded-[12px] p-[12px] text-center" style={{ backgroundColor: 'var(--color-bg-page)' }}>
                            <p className="text-[18px] font-bold" style={{ color: 'var(--color-text-primary)' }}>{displayProduct.protein}g</p>
                            <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{t('product.protein')}</p>
                          </div>
                        )}
                        {displayProduct.fat !== undefined && displayProduct.fat > 0 && (
                          <div className="rounded-[12px] p-[12px] text-center" style={{ backgroundColor: 'var(--color-bg-page)' }}>
                            <p className="text-[18px] font-bold" style={{ color: 'var(--color-text-primary)' }}>{displayProduct.fat}g</p>
                            <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{t('product.fat')}</p>
                          </div>
                        )}
                        {displayProduct.carbs !== undefined && displayProduct.carbs > 0 && (
                          <div className="rounded-[12px] p-[12px] text-center" style={{ backgroundColor: 'var(--color-bg-page)' }}>
                            <p className="text-[18px] font-bold" style={{ color: 'var(--color-text-primary)' }}>{displayProduct.carbs}g</p>
                            <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{t('product.carbs')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              {/* STICKY Add to Cart bar - FULL WIDTH of right column */}
              <div className="sticky bottom-0 left-0 right-0 px-[16px] py-[16px] z-10" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                {/* Out of Stock - Show Notify Me Button */}
                {(isOutOfStock || isUnavailable) ? (
                  <button
                    onClick={handleNotifyMe}
                    className="w-full h-[56px] rounded-full text-[18px] font-semibold flex items-center justify-center gap-[8px] transition-colors"
                    style={{
                      backgroundColor: 'var(--color-bg-input)',
                      color: 'var(--color-text-primary)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-input)'}
                  >
                    <Bell className="w-[20px] h-[20px]" />
                    <span>{isRTL ? 'أعلمني عند التوفر' : 'Notify Me'}</span>
                  </button>
                ) : cartQuantity > 0 ? (
                  /* In Cart - Show Quantity Stepper */
                  <div className="flex items-center gap-[12px]">
                    {/* Price display */}
                    <div className={cn("flex-1 flex items-center", isRTL ? "flex-row-reverse justify-end" : "justify-start")}>
                      {hasDiscount && (
                        <span className="text-[14px] line-through mr-[8px]" style={{ color: 'var(--color-text-muted)' }}>
                          {formatPrice(displayProduct.originalPrice!, currency, locale)}
                        </span>
                      )}
                      <span className="text-[20px] font-bold" style={{ color: 'var(--color-primary)' }}>
                        {formatPrice(currentPrice * cartQuantity, currency, locale)}
                      </span>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center rounded-full overflow-hidden" style={{ background: 'var(--gradient-primary)' }}>
                      {/* Minus Button */}
                      <button
                        onClick={handleDecrement}
                        className="w-[56px] h-[56px] flex items-center justify-center text-white hover:bg-black/10 transition-colors"
                      >
                        {cartQuantity === 1 ? (
                          <X className="w-[22px] h-[22px]" />
                        ) : (
                          <Minus className="w-[22px] h-[22px]" />
                        )}
                      </button>

                      {/* Quantity Display */}
                      <span className="min-w-[48px] text-center text-[20px] font-bold text-white">
                        {cartQuantity}
                      </span>

                      {/* Plus Button */}
                      <button
                        onClick={handleIncrement}
                        disabled={isAtMaxQuantity}
                        className={cn(
                          "w-[56px] h-[56px] flex items-center justify-center text-white transition-colors",
                          isAtMaxQuantity ? "opacity-40 cursor-not-allowed" : "hover:bg-black/10"
                        )}
                        title={isAtMaxQuantity ? (isRTL ? 'تم الوصول للحد الأقصى' : 'Maximum quantity reached') : undefined}
                      >
                        <Plus className="w-[22px] h-[22px]" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Not in Cart - Show Add Button */
                  <button
                    onClick={handleAddToCart}
                    className="w-full h-[56px] rounded-full text-white text-[18px] font-semibold flex items-center justify-center gap-[8px] transition-colors"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
                    {hasDiscount && (
                      <span className="text-[16px] text-white/60 line-through">
                        {formatPrice(displayProduct.originalPrice!, currency, locale)}
                      </span>
                    )}
                    <span>{formatPrice(currentPrice, currency, locale)}</span>
                    <span className={cn("text-[24px] font-normal", isRTL ? "mr-[6px]" : "ml-[6px]")}>+</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Hook to manage product detail modal state
 */
export function useProductDetailModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetailData | null>(null);

  const openModal = (product: ProductDetailData) => {
    setSelectedProduct(product);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  return {
    isOpen,
    selectedProduct,
    openModal,
    closeModal,
  };
}

export default ProductDetailModal;
