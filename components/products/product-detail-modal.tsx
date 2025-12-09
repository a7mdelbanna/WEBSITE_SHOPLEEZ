'use client';

/**
 * Product Detail Modal - Pixel-Perfect Samokat Clone (Final)
 *
 * Key structural details from reference:
 * 1. LEFT COLUMN: TWO separate blocks
 *    - Image card (grey bg, large radius) - contains ONLY image + badge
 *    - "Что ещё пригодится" block (separate, below image)
 * 2. RIGHT COLUMN: Details + STICKY add-to-cart bar (right column width only)
 * 3. Collapsible sections with fade-out gradient when collapsed
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  description?: string;
  usage?: string;
  composition?: string;
  shelfLife?: string;
  storageConditions?: string;
  manufacturer?: string;
  quantity?: string;
  productType?: string;
  brand?: string;
  applicationArea?: string;
  relatedProducts?: RelatedProduct[];
}

interface RelatedProduct {
  id: number;
  name: string;
  nameAr: string;
  image: string;
  price: number;
  originalPrice?: number;
  weight?: string;
  badge?: {
    text: string;
    textAr: string;
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

  if (!isOpen || !product) return null;

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

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

  const handleAddToCart = () => {
    onAddToCart?.(product.id);
  };

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
          {/* Close button - top right corner */}
          <button
            onClick={onClose}
            className="absolute top-[16px] right-[16px] z-30 w-[32px] h-[32px] rounded-full flex items-center justify-center hover:bg-[#F5F5F5] transition-colors bg-white/80"
            aria-label="Закрыть"
          >
            <X className="w-[20px] h-[20px] text-[#666]" />
          </button>

          {/* Two-column layout - both columns scroll independently */}
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

            {/* LEFT COLUMN - Image + Related Products (scrolls independently) */}
            <div className="w-full md:w-[480px] shrink-0 p-[16px] space-y-[16px] overflow-y-auto">

              {/* Block 1: Image Card - ONLY image + badge */}
              <div className="relative bg-[#F5F5F5] rounded-[24px] overflow-hidden">
                  {/* Discount badge */}
                  {product.badge && (
                    <div
                      className={cn(
                        'absolute top-[16px] left-[16px] px-[12px] py-[6px] rounded-[8px] text-[13px] font-semibold text-white z-10',
                        product.badge.variant === 'discount' && 'bg-[#1F1F1F]',
                        product.badge.variant === 'tag' && 'bg-[#00B894]',
                        product.badge.variant === 'new' && 'bg-[#6C5CE7]'
                      )}
                    >
                      {product.badge.text}
                    </div>
                  )}

                  {/* Product image */}
                  <div className="relative aspect-square p-[32px]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain"
                      sizes="450px"
                      priority
                    />
                  </div>
                </div>

                {/* Block 2: "Что ещё пригодится" - SEPARATE from image */}
                {product.relatedProducts && product.relatedProducts.length > 0 && (
                  <div>
                    <h3 className="text-[16px] font-bold text-[#1A1A1A] mb-[12px] px-[4px]">
                      Что ещё пригодится
                    </h3>
                    <div className="flex gap-[10px] overflow-x-auto pb-[8px] scrollbar-hide">
                      {product.relatedProducts.map((related) => (
                        <div
                          key={related.id}
                          className="w-[140px] shrink-0 bg-white rounded-[16px] border border-[#F0F0F0] overflow-hidden"
                        >
                          {/* Card image */}
                          <div className="relative aspect-square bg-[#FAFAFA] rounded-t-[16px]">
                            <Image
                              src={related.image}
                              alt={related.name}
                              fill
                              className="object-contain p-[12px]"
                              sizes="140px"
                            />
                            {related.badge && (
                              <div className="absolute bottom-[8px] left-[8px] px-[8px] py-[3px] rounded-[6px] bg-[#1F1F1F] text-[11px] font-semibold text-white">
                                {related.badge.text}
                              </div>
                            )}
                          </div>
                          {/* Card content */}
                          <div className="p-[10px] pt-[8px]">
                            <p className="text-[12px] text-[#1A1A1A] leading-[1.3] line-clamp-2 h-[32px] mb-[4px]">
                              {related.name}
                            </p>
                            <p className="text-[11px] text-[#999] mb-[6px]">
                              {related.weight}
                            </p>
                            {/* Price row */}
                            <div className="flex items-center">
                              <div className="flex items-center gap-[4px] bg-[#FFF0F0] rounded-full px-[10px] py-[4px]">
                                {related.originalPrice && (
                                  <span className="text-[11px] text-[#BEBEBE] line-through">
                                    {related.originalPrice}
                                  </span>
                                )}
                                <span className="text-[13px] font-semibold text-[#1A1A1A]">
                                  {related.price} ₽
                                </span>
                                <span className="text-[#FF6B6B] text-[14px] ml-[2px]">+</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            {/* RIGHT COLUMN - Product Details with sticky bottom CTA */}
            <div className="flex-1 flex flex-col overflow-y-auto relative">
              {/* Scrollable details area */}
              <div className="flex-1 p-[24px] pr-[32px] pt-[24px] pb-[80px]">
                  {/* Product name */}
                  <h1 className="text-[22px] font-bold text-[#1A1A1A] leading-[1.25] mb-[4px] pr-[32px]">
                    {product.name}
                  </h1>

                  {/* Volume - lighter, smaller */}
                  {product.volume && (
                    <p className="text-[15px] text-[#999] mb-[14px]">{product.volume}</p>
                  )}

                  {/* Bullet points */}
                  {product.highlights && product.highlights.length > 0 && (
                    <ul className="mb-[14px] space-y-[4px]">
                      {product.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-[8px] text-[14px] text-[#1A1A1A] leading-[1.4]">
                          <span className="text-[#BEBEBE] mt-[8px] text-[4px]">●</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Share button - grey pill */}
                  <button className="inline-flex items-center gap-[6px] h-[34px] px-[14px] rounded-full bg-[#F5F5F5] text-[13px] text-[#1A1A1A] hover:bg-[#EBEBEB] transition-colors mb-[18px]">
                    <Share2 className="w-[14px] h-[14px]" />
                    Поделиться
                  </button>

                  {/* Description */}
                  {product.description && (
                    <p className="text-[14px] text-[#1A1A1A] leading-[1.65] mb-[16px]">
                      {product.description}
                    </p>
                  )}

                  {/* Collapsible: Применение */}
                  {product.usage && (
                    <CollapsibleSection
                      title="Применение"
                      content={product.usage}
                      isExpanded={expandedSections.has('usage')}
                      onToggle={() => toggleSection('usage')}
                    />
                  )}

                  {/* Collapsible: Состав */}
                  {product.composition && (
                    <CollapsibleSection
                      title="Состав"
                      content={product.composition}
                      isExpanded={expandedSections.has('composition')}
                      onToggle={() => toggleSection('composition')}
                    />
                  )}

                  {/* Additional details */}
                  <div className="border-t border-[#F0F0F0] pt-[14px] space-y-[12px] mt-[4px]">
                    {product.shelfLife && (
                      <div>
                        <p className="text-[12px] text-[#999] mb-[2px]">Срок хранения</p>
                        <p className="text-[14px] text-[#1A1A1A]">{product.shelfLife}</p>
                      </div>
                    )}
                    {product.storageConditions && (
                      <div>
                        <p className="text-[12px] text-[#999] mb-[2px]">Условия хранения</p>
                        <p className="text-[14px] text-[#1A1A1A]">{product.storageConditions}</p>
                      </div>
                    )}
                    {product.manufacturer && (
                      <div>
                        <p className="text-[12px] text-[#999] mb-[2px]">Производитель</p>
                        <p className="text-[14px] text-[#1A1A1A]">{product.manufacturer}</p>
                      </div>
                    )}
                    {product.quantity && (
                      <div>
                        <p className="text-[12px] text-[#999] mb-[2px]">Количество в упаковке</p>
                        <p className="text-[14px] text-[#1A1A1A]">{product.quantity}</p>
                      </div>
                    )}
                    {product.productType && (
                      <div>
                        <p className="text-[12px] text-[#999] mb-[2px]">Тип товара</p>
                        <p className="text-[14px] text-[#1A1A1A]">{product.productType}</p>
                      </div>
                    )}
                    {product.brand && (
                      <div>
                        <p className="text-[12px] text-[#999] mb-[2px]">Бренд</p>
                        <p className="text-[14px] text-[#1A1A1A]">{product.brand}</p>
                      </div>
                    )}
                    {product.applicationArea && (
                      <div>
                        <p className="text-[12px] text-[#999] mb-[2px]">Область применения</p>
                        <p className="text-[14px] text-[#1A1A1A]">{product.applicationArea}</p>
                      </div>
                    )}
                  </div>
                </div>

              {/* STICKY Add to Cart bar - FULL WIDTH of right column */}
              <div className="sticky bottom-0 left-0 right-0 bg-white px-[16px] py-[16px] z-10">
                {/* Full-width pink pill button */}
                <button
                  onClick={handleAddToCart}
                  className="w-full h-[56px] rounded-full bg-[#F95C78] hover:bg-[#E84D69] text-white text-[18px] font-semibold flex items-center justify-center gap-[8px] transition-colors"
                >
                  {hasDiscount && (
                    <span className="text-[16px] text-white/60 line-through">
                      {product.originalPrice}
                    </span>
                  )}
                  <span>{product.price} ₽</span>
                  <span className="text-[24px] font-normal ml-[6px]">+</span>
                </button>
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
