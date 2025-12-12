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
    <div className="border-t border-[#F0F0F0]">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-[12px] text-left"
      >
        <span className="text-[13px] text-[#1A1A1A]">{title}</span>
        <ChevronUp
          className={cn(
            "w-[16px] h-[16px] text-[#999] transition-transform duration-200",
            !isExpanded && "rotate-180"
          )}
        />
      </button>
      <div className="relative">
        <div
          className={cn(
            "text-[13px] text-[#1A1A1A] leading-[1.6] overflow-hidden transition-all duration-200",
            isExpanded ? "max-h-[2000px] pb-[12px]" : "max-h-[60px]"
          )}
        >
          {content}
        </div>
        {/* Fade-out gradient when collapsed */}
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-[40px] bg-gradient-to-t from-white to-transparent pointer-events-none" />
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

  // Reset selected unit when product changes
  useEffect(() => {
    setSelectedUnit('small');
  }, [product?.id]);

  if (!isOpen || !product) return null;

  // Merge API data with passed product data (API takes precedence)
  // Extract unit names from passed product's unit objects if available
  const passedBigUnitName = product.bigUnit
    ? (locale === 'ar' ? (product.bigUnit.nameAr || product.bigUnit.name) : product.bigUnit.name)
    : undefined;
  const passedSmallUnitName = product.smallUnit
    ? (locale === 'ar' ? (product.smallUnit.nameAr || product.smallUnit.name) : product.smallUnit.name)
    : undefined;

  const displayProduct = {
    ...product,
    // Use unit names from passed product if available
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
      // Unit info - override with API data if available
      bigUnitPrice: fullProduct.bigUnitPrice,
      smallUnitPrice: fullProduct.smallUnitPrice,
      bigUnitName: fullProduct.bigUnitName || passedBigUnitName,
      smallUnitName: fullProduct.smallUnitName || passedSmallUnitName,
      bigUnitImageUrl: fullProduct.bigUnitImageUrl,
      smallUnitImageUrl: fullProduct.smallUnitImageUrl,
      // Nutrition
      calories: fullProduct.calories,
      protein: fullProduct.protein,
      fat: fullProduct.fat,
      carbs: fullProduct.carbs,
    } : {}),
    // Add related products from API
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

  // Get current price based on selected unit
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

  // Compute cart quantity based on selected unit - matching ProductCard logic
  const hasMultipleUnitsForCart = product?.bigUnit && product?.smallUnit;
  const effectiveSelectedUnit = hasMultipleUnitsForCart
    ? selectedUnit
    : (product?.smallUnit ? 'small' : 'big');
  const currentUnitObj = effectiveSelectedUnit === 'big' ? product?.bigUnit : product?.smallUnit;
  const currentUnitId = currentUnitObj?.id;

  // Get per-unit quantities using 3-field matching from LOCAL store
  const smallQty = product?.smallUnit?.id ? getDisplayQuantity(product.id, product.smallUnit.id, undefined) : 0;
  const bigQty = product?.bigUnit?.id ? getDisplayQuantity(product.id, product.bigUnit.id, undefined) : 0;
  const legacyQty = product ? getDisplayQuantity(product.id, undefined, undefined) : 0;

  // Cart quantity for current selected unit
  const cartQuantity = effectiveSelectedUnit === 'big'
    ? (bigQty || legacyQty)
    : (smallQty || legacyQty);

  // Check if out of stock
  const isOutOfStock = product?.itemAmount !== undefined && product.itemAmount <= 0;
  const isUnavailable = product?.isAvailable === false;

  // Check if maximum quantity reached (from any source)
  // 1. Per-user limit: isMaximumAmountForUser && cartQuantity >= maximumAmountForUser
  // 2. Stock limit: itemAmount > 0 && cartQuantity >= itemAmount
  const isAtMaxPerUserLimit = product?.isMaximumAmountForUser && product?.maximumAmountForUser
    ? cartQuantity >= product.maximumAmountForUser
    : false;

  const isAtStockLimit = product?.itemAmount !== undefined && product.itemAmount > 0
    ? cartQuantity >= product.itemAmount
    : false;

  const isAtMaxQuantity = isAtMaxPerUserLimit || isAtStockLimit;

  // Check if product can be added to cart
  const canAddToCart = !isOutOfStock && !isUnavailable;

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  // Handle add to cart - LOCAL ONLY, NO API call (following Flutter documentation)
  const handleAddToCart = useCallback(() => {
    if (!product || !canAddToCart) return;

    requireAuth(() => {
      // Get unit info based on selection, with fallbacks
      let unitObj = effectiveSelectedUnit === 'big' ? product.bigUnit : product.smallUnit;

      // Fallback: if selected unit doesn't exist, try the other one
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

      // Add to LOCAL cart (instant, no API call)
      addItem({
        itemId: product.id,
        quantity: 1,
        customerUnitId: unitId,
        itemUnitId: unitId,
        normalPrice: currentPrice,
        itemPriceAfterDiscount: discountPrice,
        // Product metadata for display in cart
        name: displayProduct.name,
        nameAr: displayProduct.nameAr,
        image: displayProduct.image,
        // Discount limits
        bigUnitId: product.bigUnit?.id,
        smallUnitId: product.smallUnit?.id,
        // Maximum quantity limits
        isMaximumAmountForUser: product.isMaximumAmountForUser,
        maximumAmountForUser: product.maximumAmountForUser,
      });

      // Show success toast
      toast.success('Added to cart', 'تمت الإضافة إلى السلة');
      // Also call the optional callback for any additional handling
      onAddToCart?.(product.id);
    });
  }, [product, canAddToCart, effectiveSelectedUnit, displayProduct, currentPrice, addItem, requireAuth, onAddToCart]);

  // Handle quantity update - LOCAL ONLY, NO API call
  const handleUpdateQuantity = useCallback((newQuantity: number) => {
    if (!product) return;

    const unitId = currentUnitId;

    console.log('[ProductModal] LOCAL update quantity:', {
      productId: product.id,
      newQuantity,
      unitId,
    });

    if (newQuantity <= 0) {
      removeItem(product.id, unitId, undefined);
    } else {
      updateQuantity(product.id, unitId, undefined, newQuantity);
    }
  }, [product, currentUnitId, updateQuantity, removeItem]);

  // Handle increment
  const handleIncrement = useCallback(() => {
    if (isAtMaxQuantity) {
      toast.error(
        'Maximum quantity reached',
        'تم الوصول للحد الأقصى'
      );
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

  // Localized getters - use displayProduct which has merged API data
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
              "absolute top-[16px] z-30 w-[32px] h-[32px] rounded-full flex items-center justify-center hover:bg-[#F5F5F5] transition-colors bg-white/80",
              isRTL ? "left-[16px]" : "right-[16px]"
            )}
            aria-label={t('common.close')}
          >
            <X className="w-[20px] h-[20px] text-[#666]" />
          </button>

          {/* Two-column layout - both columns scroll independently */}
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

            {/* LEFT COLUMN - Image + Related Products (scrolls independently) */}
            <div className="w-full md:w-[480px] shrink-0 p-[16px] space-y-[16px] overflow-y-auto">

              {/* Block 1: Image Card - with unit toggle */}
              <div className="relative bg-[#F5F5F5] rounded-[24px] overflow-hidden">
                  {/* Discount badge */}
                  {displayProduct.badge && (
                    <div
                      className={cn(
                        'absolute top-[16px] px-[12px] py-[6px] rounded-[8px] text-[13px] font-semibold text-white z-10',
                        isRTL ? 'right-[16px]' : 'left-[16px]',
                        displayProduct.badge.variant === 'discount' && 'bg-[#1F1F1F]',
                        displayProduct.badge.variant === 'tag' && 'bg-[#00B894]',
                        displayProduct.badge.variant === 'new' && 'bg-[#6C5CE7]'
                      )}
                    >
                      {getBadgeText()}
                    </div>
                  )}

                  {/* Loading indicator */}
                  {isLoadingProduct && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-20">
                      <Loader2 className="w-[32px] h-[32px] text-[#FF4B12] animate-spin" />
                    </div>
                  )}

                  {/* Product image */}
                  <div className="relative aspect-square p-[32px]">
                    <Image
                      src={currentImage}
                      alt={getName()}
                      fill
                      className="object-contain"
                      sizes="450px"
                      priority
                      unoptimized
                    />
                  </div>

                  {/* Premium Unit Toggle - Segmented Control with Prices */}
                  {hasMultipleUnits && (
                    <div className="absolute bottom-[16px] left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[320px]">
                      <div className="relative flex bg-white/95 backdrop-blur-md rounded-[16px] p-[4px] shadow-xl border border-white/20">
                        {/* Sliding Background */}
                        <div
                          className={cn(
                            "absolute top-[4px] bottom-[4px] w-[calc(50%-2px)] rounded-[12px] bg-gradient-to-r from-[#FF4B12] to-[#FF6B3D] shadow-md transition-all duration-300 ease-out",
                            selectedUnit === 'big'
                              ? (isRTL ? "left-[4px]" : "left-[calc(50%+2px)]")
                              : (isRTL ? "left-[calc(50%+2px)]" : "left-[4px]")
                          )}
                        />

                        {/* Small Unit Option */}
                        <button
                          onClick={() => setSelectedUnit('small')}
                          className={cn(
                            "relative flex-1 flex flex-col items-center py-[10px] px-[8px] rounded-[12px] transition-all duration-300 z-10",
                            selectedUnit === 'small' ? "text-white" : "text-[#666]"
                          )}
                        >
                          <span className={cn(
                            "text-[13px] font-semibold transition-colors duration-300",
                            selectedUnit === 'small' ? "text-white" : "text-[#1A1A1A]"
                          )}>
                            {getSmallUnitName()}
                          </span>
                          <span className={cn(
                            "text-[12px] font-bold mt-[2px] transition-colors duration-300",
                            selectedUnit === 'small' ? "text-white/90" : "text-[#FF4B12]"
                          )}>
                            {formatPrice(displayProduct.smallUnitPrice || displayProduct.price, currency, locale)}
                          </span>
                        </button>

                        {/* Big Unit Option */}
                        <button
                          onClick={() => setSelectedUnit('big')}
                          className={cn(
                            "relative flex-1 flex flex-col items-center py-[10px] px-[8px] rounded-[12px] transition-all duration-300 z-10",
                            selectedUnit === 'big' ? "text-white" : "text-[#666]"
                          )}
                        >
                          <span className={cn(
                            "text-[13px] font-semibold transition-colors duration-300",
                            selectedUnit === 'big' ? "text-white" : "text-[#1A1A1A]"
                          )}>
                            {getBigUnitName()}
                          </span>
                          <span className={cn(
                            "text-[12px] font-bold mt-[2px] transition-colors duration-300",
                            selectedUnit === 'big' ? "text-white/90" : "text-[#FF4B12]"
                          )}>
                            {formatPrice(displayProduct.bigUnitPrice || displayProduct.price, currency, locale)}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Single unit indicator - Clean pill design */}
                  {!hasMultipleUnits && currentUnitName && (
                    <div className="absolute bottom-[16px] left-1/2 -translate-x-1/2">
                      <div className="bg-white/95 backdrop-blur-md rounded-[12px] px-[20px] py-[10px] shadow-xl border border-white/20">
                        <span className="text-[13px] font-semibold text-[#1A1A1A]">
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
                        "text-[16px] font-bold text-[#1A1A1A]",
                        isRTL && "text-right"
                      )}
                      style={{ marginBottom: '16px' }}
                    >
                      {t('product.relatedProducts')}
                    </h3>
                    {isLoadingRelated ? (
                      <div className="flex items-center justify-center" style={{ padding: '24px 0' }}>
                        <Loader2 className="w-[24px] h-[24px] text-[#FF4B12] animate-spin" />
                      </div>
                    ) : (
                      <div className="flex overflow-x-auto scrollbar-hide" style={{ gap: '12px', paddingBottom: '12px' }}>
                        {displayProduct.relatedProducts.map((related) => (
                          <div
                            key={related.id}
                            className="shrink-0 bg-white rounded-[16px] border border-[#F0F0F0] overflow-hidden"
                            style={{ width: '160px' }}
                          >
                            {/* Card image */}
                            <div className="relative aspect-square bg-[#FAFAFA] rounded-t-[16px]">
                              <Image
                                src={related.image}
                                alt={getRelatedName(related)}
                                fill
                                className="object-contain"
                                style={{ padding: '16px' }}
                                sizes="160px"
                                unoptimized
                              />
                              {related.badge && (
                                <div className={cn(
                                  "absolute px-[8px] py-[3px] rounded-[6px] bg-[#1F1F1F] text-[11px] font-semibold text-white",
                                  isRTL ? "right-[8px]" : "left-[8px]"
                                )} style={{ bottom: '10px' }}>
                                  {getRelatedBadgeText(related)}
                                </div>
                              )}
                            </div>
                            {/* Card content */}
                            <div style={{ padding: '12px', paddingTop: '10px' }}>
                              <p
                                className={cn(
                                  "text-[13px] text-[#1A1A1A] leading-[1.3] line-clamp-2",
                                  isRTL && "text-right"
                                )}
                                style={{ height: '34px', marginBottom: '8px' }}
                              >
                                {getRelatedName(related)}
                              </p>
                              {/* Price row */}
                              <div className={cn("flex items-center", isRTL && "justify-end")}>
                                <div
                                  className="flex items-center bg-[#FFF0F0] rounded-full"
                                  style={{ gap: '6px', padding: '6px 12px' }}
                                >
                                  {related.originalPrice && (
                                    <span className="text-[11px] text-[#BEBEBE] line-through">
                                      {formatPrice(related.originalPrice, currency, locale)}
                                    </span>
                                  )}
                                  <span className="text-[14px] font-semibold text-[#1A1A1A]">
                                    {formatPrice(related.price, currency, locale)}
                                  </span>
                                  <span className="text-[#FF6B6B] text-[16px]">+</span>
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
                      "text-[22px] font-bold text-[#1A1A1A] leading-[1.25]",
                      isRTL ? "text-right pl-[32px]" : "pr-[32px]"
                    )}
                    style={{ marginBottom: '20px' }}
                  >
                    {getName()}
                  </h1>

                  {/* Share button - grey pill */}
                  <button
                    className={cn(
                      "inline-flex items-center gap-[8px] rounded-full bg-[#F5F5F5] text-[13px] text-[#1A1A1A] hover:bg-[#EBEBEB] transition-colors",
                      isRTL && "flex-row-reverse"
                    )}
                    style={{ height: '40px', paddingLeft: '18px', paddingRight: '18px', marginBottom: '24px' }}
                  >
                    <Share2 className="w-[16px] h-[16px]" />
                    {t('product.share')}
                  </button>

                  {/* Volume - lighter, smaller */}
                  {product.volume && (
                    <p className={cn(
                      "text-[15px] text-[#999] mb-[14px]",
                      isRTL && "text-right"
                    )}>
                      {product.volume}
                    </p>
                  )}

                  {/* Bullet points */}
                  {getHighlights() && getHighlights()!.length > 0 && (
                    <ul className="mb-[14px] space-y-[4px]">
                      {getHighlights()!.map((highlight, idx) => (
                        <li key={idx} className={cn(
                          "flex items-start gap-[8px] text-[14px] text-[#1A1A1A] leading-[1.4]",
                          isRTL && "flex-row-reverse text-right"
                        )}>
                          <span className="text-[#BEBEBE] mt-[8px] text-[4px]">●</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Description */}
                  {getDescription() && (
                    <p className={cn(
                      "text-[14px] text-[#1A1A1A] leading-[1.65] mb-[16px]",
                      isRTL && "text-right"
                    )}>
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
                  <div className="border-t border-[#F0F0F0] pt-[14px] space-y-[12px] mt-[4px]">
                    {product.shelfLife && (
                      <div className={isRTL ? "text-right" : ""}>
                        <p className="text-[12px] text-[#999] mb-[2px]">{t('product.shelfLife')}</p>
                        <p className="text-[14px] text-[#1A1A1A]">{product.shelfLife}</p>
                      </div>
                    )}
                    {getStorageConditions() && (
                      <div className={isRTL ? "text-right" : ""}>
                        <p className="text-[12px] text-[#999] mb-[2px]">{t('product.storageConditions')}</p>
                        <p className="text-[14px] text-[#1A1A1A]">{getStorageConditions()}</p>
                      </div>
                    )}
                    {getManufacturer() && (
                      <div className={isRTL ? "text-right" : ""}>
                        <p className="text-[12px] text-[#999] mb-[2px]">{t('product.manufacturer')}</p>
                        <p className="text-[14px] text-[#1A1A1A]">{getManufacturer()}</p>
                      </div>
                    )}
                    {product.quantity && (
                      <div className={isRTL ? "text-right" : ""}>
                        <p className="text-[12px] text-[#999] mb-[2px]">{t('product.quantityInPackage')}</p>
                        <p className="text-[14px] text-[#1A1A1A]">{product.quantity}</p>
                      </div>
                    )}
                    {getProductType() && (
                      <div className={isRTL ? "text-right" : ""}>
                        <p className="text-[12px] text-[#999] mb-[2px]">{t('product.productType')}</p>
                        <p className="text-[14px] text-[#1A1A1A]">{getProductType()}</p>
                      </div>
                    )}
                    {getBrand() && (
                      <div className={isRTL ? "text-right" : ""}>
                        <p className="text-[12px] text-[#999] mb-[2px]">{t('product.brand')}</p>
                        <p className="text-[14px] text-[#1A1A1A]">{getBrand()}</p>
                      </div>
                    )}
                    {getApplicationArea() && (
                      <div className={isRTL ? "text-right" : ""}>
                        <p className="text-[12px] text-[#999] mb-[2px]">{t('product.applicationArea')}</p>
                        <p className="text-[14px] text-[#1A1A1A]">{getApplicationArea()}</p>
                      </div>
                    )}
                  </div>

                  {/* Nutrition Info */}
                  {(displayProduct.calories || displayProduct.protein || displayProduct.fat || displayProduct.carbs) && (
                    <div className="border-t border-[#F0F0F0] pt-[14px] mt-[4px]">
                      <h4 className={cn(
                        "text-[14px] font-semibold text-[#1A1A1A] mb-[12px]",
                        isRTL && "text-right"
                      )}>
                        {t('product.nutritionInfo')}
                      </h4>
                      <div className="grid grid-cols-4 gap-[8px]">
                        {displayProduct.calories !== undefined && displayProduct.calories > 0 && (
                          <div className="bg-[#F5F5F7] rounded-[12px] p-[12px] text-center">
                            <p className="text-[18px] font-bold text-[#1A1A1A]">{displayProduct.calories}</p>
                            <p className="text-[11px] text-[#999]">{t('product.calories')}</p>
                          </div>
                        )}
                        {displayProduct.protein !== undefined && displayProduct.protein > 0 && (
                          <div className="bg-[#F5F5F7] rounded-[12px] p-[12px] text-center">
                            <p className="text-[18px] font-bold text-[#1A1A1A]">{displayProduct.protein}g</p>
                            <p className="text-[11px] text-[#999]">{t('product.protein')}</p>
                          </div>
                        )}
                        {displayProduct.fat !== undefined && displayProduct.fat > 0 && (
                          <div className="bg-[#F5F5F7] rounded-[12px] p-[12px] text-center">
                            <p className="text-[18px] font-bold text-[#1A1A1A]">{displayProduct.fat}g</p>
                            <p className="text-[11px] text-[#999]">{t('product.fat')}</p>
                          </div>
                        )}
                        {displayProduct.carbs !== undefined && displayProduct.carbs > 0 && (
                          <div className="bg-[#F5F5F7] rounded-[12px] p-[12px] text-center">
                            <p className="text-[18px] font-bold text-[#1A1A1A]">{displayProduct.carbs}g</p>
                            <p className="text-[11px] text-[#999]">{t('product.carbs')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              {/* STICKY Add to Cart bar - FULL WIDTH of right column */}
              <div className="sticky bottom-0 left-0 right-0 bg-white px-[16px] py-[16px] z-10">
                {/* Out of Stock - Show Notify Me Button */}
                {(isOutOfStock || isUnavailable) ? (
                  <button
                    onClick={handleNotifyMe}
                    className="w-full h-[56px] rounded-full bg-[#F0F0F0] text-[#1A1A1A] text-[18px] font-semibold flex items-center justify-center gap-[8px] transition-colors hover:bg-[#E5E5E5]"
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
                        <span className="text-[14px] text-[#9CA3AF] line-through mr-[8px]">
                          {formatPrice(displayProduct.originalPrice!, currency, locale)}
                        </span>
                      )}
                      <span className="text-[20px] font-bold" style={{ color: 'var(--color-primary)' }}>
                        {formatPrice(currentPrice * cartQuantity, currency, locale)}
                      </span>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center rounded-full overflow-hidden" style={{ background: 'linear-gradient(to right, #FF4B12, #FF6B3D)' }}>
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
                    style={{ background: 'linear-gradient(to right, #FF4B12, #FF6B3D)' }}
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
