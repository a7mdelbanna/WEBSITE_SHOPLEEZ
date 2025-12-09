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
import { Search, User, Menu, X, MessageCircle } from 'lucide-react';
import { useTenant, useLocalization } from '@/lib/hooks/use-tenant';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuClick?: () => void;
  cartCount?: number;
}

export function Header({ onMenuClick, cartCount = 0 }: HeaderProps) {
  const { tenant, locale, setLocale } = useTenant();
  const { t, isRTL } = useLocalization();
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
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center pt-[12px] px-[20px] md:px-[32px]">
          <form onSubmit={handleSearch} className="w-full max-w-[640px]">
            <div className="flex h-[48px] items-center rounded-full bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] px-[20px]">
              <Search className="h-[20px] w-[20px] shrink-0 text-[#9E9E9E]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={handleSearchBlur}
                autoFocus
                placeholder="Искать в Самокате"
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

      <header className="sticky top-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] rounded-b-[20px] z-30">
        <div className="flex h-[64px] items-center justify-between px-[20px] md:px-[24px] lg:px-[32px] max-w-[1904px] mx-auto">
          {/* Left: Logo */}
          <div className="flex items-center shrink-0">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="flex h-[40px] w-[40px] items-center justify-center rounded-full hover:bg-[#F5F5F5] lg:hidden transition-colors mr-[8px]"
              aria-label="Открыть меню"
            >
              <Menu className="h-[24px] w-[24px] text-[#1A1A1A]" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-[12px]">
              <div className="w-[36px] h-[36px] rounded-full bg-[#FF4B12] flex items-center justify-center flex-shrink-0">
                <div className="w-[18px] h-[18px] rounded-full border-[3px] border-white" />
              </div>
              <span className="hidden text-[20px] font-bold text-[#FF4B12] lg:block tracking-[-0.02em] leading-none">
                самокат
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
                placeholder="Искать в Самокате"
                className="flex-1 bg-transparent px-[16px] text-[15px] text-[#1A1A1A] placeholder-[#9E9E9E] outline-none border-none focus:ring-0"
              />
            </div>
          </form>

          {/* Right: Login + Chat */}
          <div className="flex items-center gap-[12px] shrink-0">
            <button className="flex h-[52px] items-center gap-[10px] rounded-full bg-[#F5F5F7] px-[24px] text-[#1A1A1A] transition-colors hover:bg-[#ECECEC]">
              <User className="h-[22px] w-[22px]" strokeWidth={2} />
              <span className="text-[16px] font-medium leading-none">
                Войти
              </span>
            </button>

            <button
              className="flex items-center justify-center w-[52px] h-[52px] bg-[#F5F5F7] rounded-full transition-colors hover:bg-[#ECECEC]"
              aria-label="Чат поддержки"
            >
              <MessageCircle className="h-[22px] w-[22px] text-[#1A1A1A]" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="px-[20px] pb-[16px] md:hidden">
          <form onSubmit={handleSearch}>
            <div className="flex h-[48px] items-center rounded-full bg-[#F7F7F7] px-[20px]">
              <Search className="h-[18px] w-[18px] shrink-0 text-[#9E9E9E]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Искать в Самокате"
                className="flex-1 bg-transparent px-[16px] text-[15px] text-[#1A1A1A] placeholder-[#9E9E9E] outline-none border-none focus:ring-0"
              />
            </div>
          </form>
        </div>
      </header>
    </>
  );
}
