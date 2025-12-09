'use client';

/**
 * Test Page - Product Card Unit Selection Variants
 *
 * This page showcases different design approaches for unit selection
 * to help choose the best UX pattern.
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';

// Mock data for testing
const mockProducts = [
  {
    id: 1,
    name: 'هوهوز شوكولاتة',
    nameEn: 'Hohos Chocolate',
    price: 100,
    bigUnitPrice: 800,
    smallUnitPrice: 100,
    bigUnitName: 'كرتونه 8',
    smallUnitName: 'علبه',
    image: 'https://via.placeholder.com/200x200/F5F5F7/333?text=Hohos',
  },
  {
    id: 2,
    name: 'ريدبول لايت',
    nameEn: 'Red Bull Light',
    price: 1200,
    bigUnitPrice: 1200,
    smallUnitPrice: null,
    bigUnitName: 'كرتونه',
    smallUnitName: null,
    image: 'https://via.placeholder.com/200x200/F5F5F7/333?text=RedBull',
  },
];

// Variant A: Pill Toggle with Animation
function VariantAPillToggle({ product }: { product: typeof mockProducts[0] }) {
  const [selectedUnit, setSelectedUnit] = useState<'small' | 'big'>('small');
  const hasMultipleUnits = product.smallUnitPrice && product.bigUnitPrice && product.smallUnitPrice !== product.bigUnitPrice;
  const currentPrice = selectedUnit === 'big' ? product.bigUnitPrice : (product.smallUnitPrice || product.bigUnitPrice);
  const unitName = selectedUnit === 'big' ? product.bigUnitName : (product.smallUnitName || product.bigUnitName);

  return (
    <div className="w-[180px] bg-white rounded-[20px] overflow-hidden shadow-sm">
      <div className="aspect-square bg-[#F5F5F7] m-[8px] rounded-[14px]" />
      <div className="p-[10px] pt-[6px]">
        <h3 className="text-[12px] font-medium text-[#1A1A1A] leading-[1.3] line-clamp-2 h-[32px] mb-[6px]">
          {product.name}
        </h3>

        {/* Unit Section - Always visible */}
        <div className="mb-[8px]">
          {hasMultipleUnits ? (
            <div className="relative flex h-[28px] bg-[#F5F5F7] rounded-full p-[3px]">
              {/* Sliding background */}
              <div
                className={cn(
                  "absolute top-[3px] h-[22px] w-[calc(50%-3px)] bg-white rounded-full shadow-sm transition-all duration-300 ease-out",
                  selectedUnit === 'big' ? "left-[calc(50%)]" : "left-[3px]"
                )}
              />
              <button
                onClick={() => setSelectedUnit('small')}
                className={cn(
                  "relative flex-1 text-[10px] font-medium transition-colors duration-200 z-10",
                  selectedUnit === 'small' ? "text-[#1A1A1A]" : "text-[#999]"
                )}
              >
                {product.smallUnitName}
              </button>
              <button
                onClick={() => setSelectedUnit('big')}
                className={cn(
                  "relative flex-1 text-[10px] font-medium transition-colors duration-200 z-10",
                  selectedUnit === 'big' ? "text-[#1A1A1A]" : "text-[#999]"
                )}
              >
                {product.bigUnitName}
              </button>
            </div>
          ) : (
            <div className="h-[28px] flex items-center justify-center bg-[#F5F5F7] rounded-full">
              <span className="text-[10px] font-medium text-[#666]">
                {product.bigUnitName || product.smallUnitName}
              </span>
            </div>
          )}
        </div>

        {/* Price Button */}
        <button className="w-full h-[36px] bg-[#FFEAE8] hover:bg-[#FFE0DD] rounded-full flex items-center justify-center gap-[4px] transition-colors">
          <span className="text-[14px] font-bold text-[#1A1A1A]">
            {currentPrice} ج.م
          </span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2.5V11.5M2.5 7H11.5" stroke="#F27D7D" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Variant B: Minimal Text Toggle
function VariantBTextToggle({ product }: { product: typeof mockProducts[0] }) {
  const [selectedUnit, setSelectedUnit] = useState<'small' | 'big'>('small');
  const hasMultipleUnits = product.smallUnitPrice && product.bigUnitPrice && product.smallUnitPrice !== product.bigUnitPrice;
  const currentPrice = selectedUnit === 'big' ? product.bigUnitPrice : (product.smallUnitPrice || product.bigUnitPrice);

  return (
    <div className="w-[180px] bg-white rounded-[20px] overflow-hidden shadow-sm">
      <div className="aspect-square bg-[#F5F5F7] m-[8px] rounded-[14px]" />
      <div className="p-[10px] pt-[6px]">
        <h3 className="text-[12px] font-medium text-[#1A1A1A] leading-[1.3] line-clamp-2 h-[32px] mb-[6px]">
          {product.name}
        </h3>

        {/* Unit Section */}
        <div className="mb-[8px] h-[20px] flex items-center justify-center gap-[8px]">
          {hasMultipleUnits ? (
            <>
              <button
                onClick={() => setSelectedUnit('small')}
                className={cn(
                  "text-[11px] font-medium transition-all duration-200 relative",
                  selectedUnit === 'small'
                    ? "text-[#FF4B12]"
                    : "text-[#999] hover:text-[#666]"
                )}
              >
                {product.smallUnitName}
                {selectedUnit === 'small' && (
                  <span className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-[#FF4B12] rounded-full" />
                )}
              </button>
              <span className="text-[#E0E0E0]">|</span>
              <button
                onClick={() => setSelectedUnit('big')}
                className={cn(
                  "text-[11px] font-medium transition-all duration-200 relative",
                  selectedUnit === 'big'
                    ? "text-[#FF4B12]"
                    : "text-[#999] hover:text-[#666]"
                )}
              >
                {product.bigUnitName}
                {selectedUnit === 'big' && (
                  <span className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-[#FF4B12] rounded-full" />
                )}
              </button>
            </>
          ) : (
            <span className="text-[11px] text-[#999]">
              {product.bigUnitName || product.smallUnitName}
            </span>
          )}
        </div>

        {/* Price Button */}
        <button className="w-full h-[36px] bg-[#FFEAE8] hover:bg-[#FFE0DD] rounded-full flex items-center justify-center gap-[4px] transition-colors">
          <span className="text-[14px] font-bold text-[#1A1A1A]">
            {currentPrice} ج.م
          </span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2.5V11.5M2.5 7H11.5" stroke="#F27D7D" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Variant C: Compact Chips
function VariantCChips({ product }: { product: typeof mockProducts[0] }) {
  const [selectedUnit, setSelectedUnit] = useState<'small' | 'big'>('small');
  const hasMultipleUnits = product.smallUnitPrice && product.bigUnitPrice && product.smallUnitPrice !== product.bigUnitPrice;
  const currentPrice = selectedUnit === 'big' ? product.bigUnitPrice : (product.smallUnitPrice || product.bigUnitPrice);

  return (
    <div className="w-[180px] bg-white rounded-[20px] overflow-hidden shadow-sm">
      <div className="aspect-square bg-[#F5F5F7] m-[8px] rounded-[14px]" />
      <div className="p-[10px] pt-[6px]">
        <h3 className="text-[12px] font-medium text-[#1A1A1A] leading-[1.3] line-clamp-2 h-[32px] mb-[6px]">
          {product.name}
        </h3>

        {/* Unit Section - Chips */}
        <div className="mb-[8px] flex gap-[6px] justify-center">
          {hasMultipleUnits ? (
            <>
              <button
                onClick={() => setSelectedUnit('small')}
                className={cn(
                  "px-[10px] py-[4px] rounded-full text-[10px] font-medium transition-all duration-200",
                  selectedUnit === 'small'
                    ? "bg-[#1A1A1A] text-white"
                    : "bg-[#F5F5F7] text-[#666] hover:bg-[#EAEAEA]"
                )}
              >
                {product.smallUnitName}
              </button>
              <button
                onClick={() => setSelectedUnit('big')}
                className={cn(
                  "px-[10px] py-[4px] rounded-full text-[10px] font-medium transition-all duration-200",
                  selectedUnit === 'big'
                    ? "bg-[#1A1A1A] text-white"
                    : "bg-[#F5F5F7] text-[#666] hover:bg-[#EAEAEA]"
                )}
              >
                {product.bigUnitName}
              </button>
            </>
          ) : (
            <span className="px-[10px] py-[4px] rounded-full text-[10px] font-medium bg-[#F5F5F7] text-[#666]">
              {product.bigUnitName || product.smallUnitName}
            </span>
          )}
        </div>

        {/* Price Button */}
        <button className="w-full h-[36px] bg-[#FFEAE8] hover:bg-[#FFE0DD] rounded-full flex items-center justify-center gap-[4px] transition-colors">
          <span className="text-[14px] font-bold text-[#1A1A1A]">
            {currentPrice} ج.م
          </span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2.5V11.5M2.5 7H11.5" stroke="#F27D7D" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Variant D: Integrated Price Toggle
function VariantDIntegrated({ product }: { product: typeof mockProducts[0] }) {
  const [selectedUnit, setSelectedUnit] = useState<'small' | 'big'>('small');
  const hasMultipleUnits = product.smallUnitPrice && product.bigUnitPrice && product.smallUnitPrice !== product.bigUnitPrice;
  const currentPrice = selectedUnit === 'big' ? product.bigUnitPrice : (product.smallUnitPrice || product.bigUnitPrice);
  const unitName = selectedUnit === 'big' ? product.bigUnitName : (product.smallUnitName || product.bigUnitName);

  return (
    <div className="w-[180px] bg-white rounded-[20px] overflow-hidden shadow-sm">
      <div className="aspect-square bg-[#F5F5F7] m-[8px] rounded-[14px]" />
      <div className="p-[10px] pt-[6px]">
        <h3 className="text-[12px] font-medium text-[#1A1A1A] leading-[1.3] line-clamp-2 h-[32px] mb-[6px]">
          {product.name}
        </h3>

        {/* Unit label */}
        <div className="mb-[8px] text-center">
          <span className="text-[10px] text-[#999]">{unitName}</span>
        </div>

        {/* Price with unit toggle */}
        <div className="flex gap-[4px]">
          {hasMultipleUnits && (
            <button
              onClick={() => setSelectedUnit(selectedUnit === 'small' ? 'big' : 'small')}
              className="w-[32px] h-[36px] bg-[#F5F5F7] hover:bg-[#EAEAEA] rounded-full flex items-center justify-center transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16" />
              </svg>
            </button>
          )}
          <button className="flex-1 h-[36px] bg-[#FFEAE8] hover:bg-[#FFE0DD] rounded-full flex items-center justify-center gap-[4px] transition-colors">
            <span className="text-[14px] font-bold text-[#1A1A1A]">
              {currentPrice} ج.م
            </span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2.5V11.5M2.5 7H11.5" stroke="#F27D7D" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TestCardsPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] p-8" dir="rtl">
      <h1 className="text-3xl font-bold mb-8 text-center">Unit Selection Variants</h1>

      {/* Variant A */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-[#FF4B12]">Variant A: Sliding Pill Toggle</h2>
        <p className="text-sm text-gray-600 mb-4">iOS-style segmented control with animated sliding background</p>
        <div className="flex gap-6 flex-wrap">
          {mockProducts.map(p => <VariantAPillToggle key={p.id} product={p} />)}
        </div>
      </section>

      {/* Variant B */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-[#FF4B12]">Variant B: Text Toggle with Underline</h2>
        <p className="text-sm text-gray-600 mb-4">Minimal text-based toggle with underline indicator</p>
        <div className="flex gap-6 flex-wrap">
          {mockProducts.map(p => <VariantBTextToggle key={p.id} product={p} />)}
        </div>
      </section>

      {/* Variant C */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-[#FF4B12]">Variant C: Compact Chips</h2>
        <p className="text-sm text-gray-600 mb-4">Small chip buttons with dark selected state</p>
        <div className="flex gap-6 flex-wrap">
          {mockProducts.map(p => <VariantCChips key={p.id} product={p} />)}
        </div>
      </section>

      {/* Variant D */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-[#FF4B12]">Variant D: Integrated Switch</h2>
        <p className="text-sm text-gray-600 mb-4">Unit switch button integrated next to price</p>
        <div className="flex gap-6 flex-wrap">
          {mockProducts.map(p => <VariantDIntegrated key={p.id} product={p} />)}
        </div>
      </section>

      <div className="mt-8 p-4 bg-white rounded-xl">
        <h3 className="font-semibold mb-2">Notes:</h3>
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
          <li>All variants show unit info for ALL products (single or multiple units)</li>
          <li>Card heights are consistent across all variants</li>
          <li>More spacing between elements</li>
          <li>Smooth transitions on all interactions</li>
        </ul>
      </div>
    </div>
  );
}
