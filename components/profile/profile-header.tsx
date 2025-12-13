'use client';

/**
 * Profile Header Component
 *
 * Displays user avatar, name, email, and wallet balance.
 * Follows Flutter app design with gradient wallet badge.
 */

import { User } from 'lucide-react';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useCurrency } from '@/lib/hooks/use-tenant';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

interface ProfileHeaderProps {
  fullName?: string;
  email?: string | null;
  walletBalance?: number;
  isLoading?: boolean;
}

export function ProfileHeader({
  fullName,
  email,
  walletBalance = 0,
  isLoading = false,
}: ProfileHeaderProps) {
  const { t, isRTL, locale } = useTranslations();
  const currency = useCurrency();

  if (isLoading) {
    return (
      <div className="bg-white rounded-[20px] p-[24px] mb-[24px]">
        <div className="flex items-center gap-[16px]">
          {/* Avatar skeleton */}
          <div className="w-[64px] h-[64px] rounded-full bg-[#F0F0F0] animate-pulse" />
          <div className="flex-1">
            {/* Name skeleton */}
            <div className="h-[20px] w-[120px] bg-[#F0F0F0] rounded-[4px] animate-pulse mb-[8px]" />
            {/* Email skeleton */}
            <div className="h-[14px] w-[160px] bg-[#F0F0F0] rounded-[4px] animate-pulse" />
          </div>
        </div>
        {/* Wallet skeleton */}
        <div className="mt-[16px] h-[48px] bg-[#F0F0F0] rounded-[12px] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[20px] p-[24px] mb-[24px]">
      <div className={cn("flex items-center gap-[16px]", isRTL && "flex-row-reverse")}>
        {/* Avatar */}
        <div className="w-[64px] h-[64px] rounded-full bg-[var(--color-primary)] bg-opacity-10 flex items-center justify-center">
          <User className="w-[36px] h-[36px] text-[var(--color-primary)]" />
        </div>

        {/* User Info */}
        <div className={cn("flex-1", isRTL && "text-right")}>
          <h2 className="text-[16px] font-bold text-[#1A1A1A]">
            {fullName || t('profile.guest')}
          </h2>
          {email && (
            <p className="text-[12px] text-[#6B7280] mt-[2px]">
              {email}
            </p>
          )}
        </div>
      </div>

      {/* Wallet Balance Badge */}
      <div
        className={cn(
          "mt-[16px] py-[12px] px-[16px] rounded-[12px]",
          "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]",
          "border border-[var(--color-primary)] border-opacity-20",
          "flex items-center justify-between",
          isRTL && "flex-row-reverse"
        )}
      >
        <span className="text-[10px] text-white opacity-80">
          {t('profile.walletBalance')}
        </span>
        <div className={cn("flex items-center gap-[4px]", isRTL && "flex-row-reverse")}>
          <span className="text-[16px] font-bold text-white">
            {formatPrice(walletBalance, currency, locale)}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Login Required State
 *
 * Shown when user is not authenticated.
 */
interface LoginRequiredProps {
  onLogin: () => void;
}

export function ProfileLoginRequired({ onLogin }: LoginRequiredProps) {
  const { t, isRTL } = useTranslations();

  return (
    <div className="bg-white rounded-[20px] p-[48px] text-center">
      <div className="w-[80px] h-[80px] mx-auto rounded-full bg-[#F5F5F7] flex items-center justify-center mb-[24px]">
        <User className="w-[40px] h-[40px] text-[#9CA3AF]" />
      </div>

      <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-[8px]">
        {t('profile.loginRequired')}
      </h2>

      <p className="text-[14px] text-[#6B7280] mb-[24px]">
        {t('profile.loginRequiredDesc')}
      </p>

      <button
        onClick={onLogin}
        className={cn(
          "px-[32px] py-[12px] rounded-[12px]",
          "bg-[var(--color-primary)] text-white",
          "text-[16px] font-semibold",
          "hover:opacity-90 transition-opacity"
        )}
      >
        {t('common.login')}
      </button>
    </div>
  );
}
