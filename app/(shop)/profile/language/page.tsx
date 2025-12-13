'use client';

/**
 * Language Selection Page
 *
 * Allows user to select app language.
 * Features:
 * - Language options (Arabic/English)
 * - Current selection indicator
 * - Apply button with locale change
 * - RTL support
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Globe,
} from 'lucide-react';
import { AppShell } from '@/components/layout';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useTenant } from '@/lib/hooks/use-tenant';
import { useAuth } from '@/lib/contexts/auth-context';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  {
    code: 'en',
    nameEn: 'English',
    nameAr: 'الإنجليزية',
    nativeName: 'English',
    flag: '🇬🇧',
  },
  {
    code: 'ar',
    nameEn: 'Arabic',
    nameAr: 'العربية',
    nativeName: 'العربية',
    flag: '🇪🇬',
  },
];

export default function LanguagePage() {
  const router = useRouter();
  const { isRTL, locale } = useTranslations();
  const { setLocale } = useTenant();
  const { isAuthenticated } = useAuth();

  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ar'>(locale);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  // Handle apply
  const handleApply = () => {
    if (selectedLanguage !== locale) {
      setLocale(selectedLanguage);
      // Reload page to apply new locale
      window.location.reload();
    } else {
      router.push('/profile');
    }
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
            {isRTL ? 'اللغة' : 'Language'}
          </h1>
        </div>

        {/* Language Options */}
        <div className="bg-white rounded-[20px] overflow-hidden">
          {LANGUAGES.map((lang, index) => {
            const isSelected = selectedLanguage === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code as 'en' | 'ar')}
                className={cn(
                  "w-full flex items-center gap-4 p-4 hover:bg-[#F9FAFB] transition-colors",
                  index !== 0 && "border-t border-[#F0F0F0]",
                  isRTL && "flex-row-reverse"
                )}
              >
                {/* Flag */}
                <span className="text-[28px]">{lang.flag}</span>

                {/* Language Info */}
                <div className={cn("flex-1", isRTL && "text-right")}>
                  <h3 className="text-[16px] font-semibold text-[#1A1A1A]">
                    {lang.nativeName}
                  </h3>
                  <p className="text-[12px] text-[#6B7280]">
                    {isRTL ? lang.nameAr : lang.nameEn}
                  </p>
                </div>

                {/* Selection Indicator */}
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                  isSelected
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                    : "border-[#D1D5DB]"
                )}>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Apply Button */}
        <button
          onClick={handleApply}
          className="w-full mt-6 py-4 rounded-[12px] bg-[var(--color-primary)] text-white text-[16px] font-semibold hover:opacity-90 transition-opacity"
        >
          {isRTL ? 'تطبيق' : 'Apply'}
        </button>
      </div>
    </AppShell>
  );
}
