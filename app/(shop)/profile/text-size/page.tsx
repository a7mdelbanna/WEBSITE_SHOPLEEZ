'use client';

/**
 * Text Size Settings Page
 *
 * Allows user to adjust text size for accessibility.
 * Features:
 * - Slider (0.8x - 1.5x)
 * - Preview text samples
 * - Preset buttons (Small, Default, Large, Extra Large)
 * - Apply/Reset buttons
 * - Persists to localStorage
 * - RTL support
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Type,
  Minus,
  Plus,
} from 'lucide-react';
import { AppShell } from '@/components/layout';
import { useTranslations } from '@/lib/hooks/use-translations';
import { cn } from '@/lib/utils';

const TEXT_SCALE_KEY = 'shopleez_text_scale';
const DEFAULT_SCALE = 1;
const MIN_SCALE = 0.8;
const MAX_SCALE = 1.5;
const STEP = 0.1;

const PRESETS = [
  { scale: 0.85, labelEn: 'Small', labelAr: 'صغير' },
  { scale: 1.0, labelEn: 'Default', labelAr: 'افتراضي' },
  { scale: 1.15, labelEn: 'Large', labelAr: 'كبير' },
  { scale: 1.35, labelEn: 'Extra Large', labelAr: 'كبير جداً' },
];

export default function TextSizePage() {
  const router = useRouter();
  const { isRTL } = useTranslations();

  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [savedScale, setSavedScale] = useState(DEFAULT_SCALE);

  // Load saved scale on mount
  useEffect(() => {
    const saved = localStorage.getItem(TEXT_SCALE_KEY);
    if (saved) {
      const value = parseFloat(saved);
      if (!isNaN(value) && value >= MIN_SCALE && value <= MAX_SCALE) {
        setScale(value);
        setSavedScale(value);
      }
    }
  }, []);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  // Handle scale change
  const handleScaleChange = (newScale: number) => {
    const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
    const roundedScale = Math.round(clampedScale * 10) / 10;
    setScale(roundedScale);
  };

  // Handle apply
  const handleApply = () => {
    localStorage.setItem(TEXT_SCALE_KEY, String(scale));
    setSavedScale(scale);
    // Update CSS variable
    document.documentElement.style.setProperty('--text-scale', String(scale));
    router.push('/profile');
  };

  // Handle reset
  const handleReset = () => {
    setScale(DEFAULT_SCALE);
  };

  const hasChanges = scale !== savedScale;

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
            {isRTL ? 'حجم النص' : 'Text Size'}
          </h1>
        </div>

        {/* Preview Card */}
        <div className="bg-white rounded-[20px] p-6 mb-6">
          <h2 className={cn(
            "text-[14px] font-semibold text-[#6B7280] mb-4",
            isRTL && "text-right"
          )}>
            {isRTL ? 'معاينة' : 'Preview'}
          </h2>

          <div className="space-y-3" style={{ fontSize: `${scale * 100}%` }}>
            <p className={cn("text-[16px] font-bold text-[#1A1A1A]", isRTL && "text-right")}>
              {isRTL ? 'عنوان المنتج' : 'Product Title'}
            </p>
            <p className={cn("text-[14px] text-[#6B7280]", isRTL && "text-right")}>
              {isRTL
                ? 'هذا نص تجريبي يوضح كيف سيبدو النص في التطبيق.'
                : 'This is sample text showing how text will appear in the app.'}
            </p>
            <p className={cn("text-[12px] text-[#9CA3AF]", isRTL && "text-right")}>
              {isRTL ? '٢٥ جنيه مصري' : '25 EGP'}
            </p>
          </div>
        </div>

        {/* Slider Control */}
        <div className="bg-white rounded-[20px] p-6 mb-6">
          <div className={cn("flex items-center justify-between mb-4", isRTL && "flex-row-reverse")}>
            <span className="text-[14px] font-medium text-[#1A1A1A]">
              {isRTL ? 'حجم النص' : 'Text Size'}
            </span>
            <span className="text-[14px] font-bold text-[var(--color-primary)]">
              {Math.round(scale * 100)}%
            </span>
          </div>

          {/* Slider */}
          <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
            <button
              onClick={() => handleScaleChange(scale - STEP)}
              disabled={scale <= MIN_SCALE}
              className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center disabled:opacity-50"
            >
              <Minus className="w-5 h-5 text-[#1A1A1A]" />
            </button>

            <input
              type="range"
              min={MIN_SCALE}
              max={MAX_SCALE}
              step={STEP}
              value={scale}
              onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-[#E5E7EB] rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-5
                [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-[var(--color-primary)]
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-md"
              style={{ direction: 'ltr' }}
            />

            <button
              onClick={() => handleScaleChange(scale + STEP)}
              disabled={scale >= MAX_SCALE}
              className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center disabled:opacity-50"
            >
              <Plus className="w-5 h-5 text-[#1A1A1A]" />
            </button>
          </div>
        </div>

        {/* Presets */}
        <div className="bg-white rounded-[20px] p-6 mb-6">
          <h2 className={cn(
            "text-[14px] font-semibold text-[#6B7280] mb-4",
            isRTL && "text-right"
          )}>
            {isRTL ? 'أحجام سريعة' : 'Quick Sizes'}
          </h2>

          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((preset) => {
              const isActive = Math.abs(scale - preset.scale) < 0.05;
              return (
                <button
                  key={preset.scale}
                  onClick={() => handleScaleChange(preset.scale)}
                  className={cn(
                    "py-3 rounded-[10px] text-[12px] font-medium transition-all",
                    isActive
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[#F5F5F7] text-[#1A1A1A] hover:bg-[#ECECEC]"
                  )}
                >
                  {isRTL ? preset.labelAr : preset.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-4 rounded-[12px] bg-[#F5F5F7] text-[#1A1A1A] text-[16px] font-semibold hover:bg-[#ECECEC] transition-colors"
          >
            {isRTL ? 'إعادة تعيين' : 'Reset'}
          </button>
          <button
            onClick={handleApply}
            className={cn(
              "flex-1 py-4 rounded-[12px] text-[16px] font-semibold transition-all",
              hasChanges
                ? "bg-[var(--color-primary)] text-white hover:opacity-90"
                : "bg-[#D1D5DB] text-white cursor-not-allowed"
            )}
            disabled={!hasChanges}
          >
            {isRTL ? 'تطبيق' : 'Apply'}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
