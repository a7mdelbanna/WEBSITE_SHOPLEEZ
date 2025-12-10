'use client';

/**
 * Header Component - Search focus with proper highlighting
 *
 * When search is focused:
 * - Search breaks out of header and floats above overlay
 * - Everything else (including header) gets dimmed
 */

import { useState } from 'react';
import Link from 'next/link';
import { Search, User, Menu, X, MessageCircle, Globe, LogOut } from 'lucide-react';
import { useTenant } from '@/lib/hooks/use-tenant';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useAuth } from '@/lib/contexts/auth-context';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuClick?: () => void;
  cartCount?: number;
}

export function Header({ onMenuClick, cartCount = 0 }: HeaderProps) {
  const { tenant, locale, setLocale } = useTenant();
  const { t, isRTL, localize } = useTranslations();
  const { isAuthenticated, user, openLoginModal, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Search:', searchQuery);
    }
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setSearchFocused(false);
    }, 150);
  };

  const toggleLocale = () => {
    setLocale(locale === 'ar' ? 'en' : 'ar');
  };

  // Get store name based on locale
  const storeName = localize(tenant.name);

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
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center pt-[14px] px-[12px]">
          <form onSubmit={handleSearch} className="w-full max-w-[640px]">
            <div className="flex h-[48px] items-center rounded-full bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] px-[20px]">
              <Search className="h-[20px] w-[20px] shrink-0 text-[#9E9E9E]" />
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
                  onClick={() => setSearchQuery('')}
                  className="flex h-[24px] w-[24px] items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors"
                >
                  <X className="h-[16px] w-[16px] text-[#9E9E9E]" />
                </button>
              )}
            </div>
          </form>
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
            {isAuthenticated && user ? (
              // Logged in - show user name with logout option
              <div className="flex items-center gap-[8px]">
                <div className="flex h-[48px] items-center gap-[10px] rounded-full bg-[#F5F5F7] px-[20px] text-[#1A1A1A]">
                  <div
                    className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-white text-[12px] font-bold"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    {user.firstName?.charAt(0)?.toUpperCase() || <User className="h-[16px] w-[16px]" />}
                  </div>
                  <span className="text-[15px] font-medium leading-none max-w-[100px] truncate">
                    {user.firstName || t('common.login')}
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
