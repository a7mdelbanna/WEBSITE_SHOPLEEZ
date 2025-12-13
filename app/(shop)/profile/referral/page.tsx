'use client';

/**
 * Referral Page (Refer & Earn)
 *
 * Displays user's referral code and sharing options.
 * Features:
 * - Referral code display
 * - Copy to clipboard
 * - Share via Web Share API
 * - How it works section
 * - Referral terms from store settings
 * - RTL support
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Share2,
  Check,
  Gift,
  Users,
  Wallet,
  Loader2,
} from 'lucide-react';
import { AppShell } from '@/components/layout';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useAuth } from '@/lib/contexts/auth-context';
import { useProfile } from '@/lib/services/auth';
import { useStoreSettings, useActivateReferral } from '@/lib/services/profile';
import { cn } from '@/lib/utils';

// How it works steps
const STEPS = [
  {
    icon: Share2,
    titleEn: 'Share Your Code',
    titleAr: 'شارك الكود الخاص بك',
    descEn: 'Share your unique referral code with friends',
    descAr: 'شارك كود الإحالة الفريد الخاص بك مع أصدقائك',
  },
  {
    icon: Users,
    titleEn: 'Friends Sign Up',
    titleAr: 'أصدقاؤك يسجلون',
    descEn: 'They use your code when registering',
    descAr: 'يستخدمون الكود الخاص بك عند التسجيل',
  },
  {
    icon: Gift,
    titleEn: 'Both Get Rewards',
    titleAr: 'كلاكما يحصل على مكافآت',
    descEn: 'You and your friend earn rewards',
    descAr: 'أنت وصديقك تحصلان على مكافآت',
  },
];

export default function ReferralPage() {
  const router = useRouter();
  const { isRTL } = useTranslations();
  const { isAuthenticated, openLoginModal } = useAuth();

  const [copied, setCopied] = useState(false);

  // Fetch profile and store settings
  const { data: profile, isLoading: profileLoading } = useProfile(isAuthenticated);
  const { data: settingsData, isLoading: settingsLoading } = useStoreSettings();
  const activateReferral = useActivateReferral();

  const referralCode = profile?.myReferrerCode;
  const isCodeActive = profile?.isMyReferralCodeActive || false;
  const settings = settingsData?.data;

  const isLoading = profileLoading || settingsLoading;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal();
      router.push('/profile');
    }
  }, [isAuthenticated, openLoginModal, router]);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  // Handle copy to clipboard
  const handleCopy = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  // Handle share
  const handleShare = async () => {
    if (!referralCode) return;

    const shareData = {
      title: isRTL ? 'انضم إلي على Shopleez' : 'Join me on Shopleez',
      text: isRTL
        ? `استخدم كود الإحالة الخاص بي ${referralCode} للحصول على خصم على أول طلب!`
        : `Use my referral code ${referralCode} to get a discount on your first order!`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        handleCopy();
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error);
      }
    }
  };

  // Handle activate referral code
  const handleActivate = async () => {
    try {
      await activateReferral.mutateAsync();
    } catch (error) {
      console.error('Activate failed:', error);
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
            {isRTL ? 'دعوة صديق' : 'Refer & Earn'}
          </h1>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
          </div>
        )}

        {!isLoading && (
          <>
            {/* Referral Code Card */}
            <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary)] rounded-[20px] p-6 mb-6 text-white">
              <div className="text-center mb-4">
                <Gift className="w-12 h-12 mx-auto mb-3 opacity-90" />
                <h2 className="text-[16px] opacity-90 mb-1">
                  {isRTL ? 'كود الإحالة الخاص بك' : 'Your Referral Code'}
                </h2>
              </div>

              {/* Code Display */}
              {referralCode && isCodeActive ? (
                <>
                  <div className="bg-white/20 rounded-[12px] p-4 mb-4">
                    <p className="text-[28px] font-bold text-center tracking-widest">
                      {referralCode}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleCopy}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[12px] bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-5 h-5" />
                          <span className="font-medium">
                            {isRTL ? 'تم النسخ!' : 'Copied!'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          <span className="font-medium">
                            {isRTL ? 'نسخ' : 'Copy'}
                          </span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[12px] bg-white text-[var(--color-primary)] hover:bg-white/90 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                      <span className="font-semibold">
                        {isRTL ? 'مشاركة' : 'Share'}
                      </span>
                    </button>
                  </div>
                </>
              ) : (
                /* Activate Code Button */
                <button
                  onClick={handleActivate}
                  disabled={activateReferral.isPending}
                  className="w-full py-4 rounded-[12px] bg-white text-[var(--color-primary)] font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {activateReferral.isPending ? (
                    <Loader2 className="w-5 h-5 mx-auto animate-spin" />
                  ) : (
                    isRTL ? 'تفعيل كود الإحالة' : 'Activate Referral Code'
                  )}
                </button>
              )}
            </div>

            {/* Rewards Info */}
            {settings && (
              <div className="bg-white rounded-[20px] p-6 mb-6">
                <h2 className={cn(
                  "text-[16px] font-bold text-[#1A1A1A] mb-4",
                  isRTL && "text-right"
                )}>
                  {isRTL ? 'المكافآت' : 'Rewards'}
                </h2>

                <div className="space-y-3">
                  {/* Referrer Reward */}
                  <div className={cn(
                    "flex items-center gap-4 p-4 bg-[#F9FAFB] rounded-[12px]",
                    isRTL && "flex-row-reverse"
                  )}>
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-green-600" />
                    </div>
                    <div className={cn("flex-1", isRTL && "text-right")}>
                      <p className="text-[14px] font-semibold text-[#1A1A1A]">
                        {isRTL ? 'أنت تحصل على' : 'You Get'}
                      </p>
                      <p className="text-[12px] text-[#6B7280]">
                        {settings.referralCashbackPercent}% {isRTL ? 'كاش باك' : 'cashback'}
                        {settings.referralCashbackMaxEGP && (
                          <span> ({isRTL ? 'حتى' : 'up to'} {settings.referralCashbackMaxEGP} {isRTL ? 'ج.م' : 'EGP'})</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Invitee Reward */}
                  <div className={cn(
                    "flex items-center gap-4 p-4 bg-[#F9FAFB] rounded-[12px]",
                    isRTL && "flex-row-reverse"
                  )}>
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Gift className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className={cn("flex-1", isRTL && "text-right")}>
                      <p className="text-[14px] font-semibold text-[#1A1A1A]">
                        {isRTL ? 'صديقك يحصل على' : 'Your Friend Gets'}
                      </p>
                      <p className="text-[12px] text-[#6B7280]">
                        {settings.inviteeDiscountPercent}% {isRTL ? 'خصم' : 'discount'}
                        {settings.inviteeDiscountMaxOrders && settings.inviteeDiscountMaxOrders > 0 && (
                          <span> ({isRTL ? 'على أول' : 'on first'} {settings.inviteeDiscountMaxOrders} {isRTL ? 'طلبات' : 'orders'})</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* How It Works */}
            <div className="bg-white rounded-[20px] p-6">
              <h2 className={cn(
                "text-[16px] font-bold text-[#1A1A1A] mb-4",
                isRTL && "text-right"
              )}>
                {isRTL ? 'كيف يعمل' : 'How It Works'}
              </h2>

              <div className="space-y-4">
                {STEPS.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-4",
                        isRTL && "flex-row-reverse"
                      )}
                    >
                      {/* Step Number */}
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] bg-opacity-10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-[var(--color-primary)]" />
                        </div>
                        {/* Connector line */}
                        {index < STEPS.length - 1 && (
                          <div className="absolute left-1/2 top-10 w-0.5 h-8 bg-[#E5E7EB] -translate-x-1/2" />
                        )}
                      </div>

                      {/* Content */}
                      <div className={cn("flex-1 pb-4", isRTL && "text-right")}>
                        <h3 className="text-[14px] font-semibold text-[#1A1A1A]">
                          {isRTL ? step.titleAr : step.titleEn}
                        </h3>
                        <p className="text-[12px] text-[#6B7280] mt-1">
                          {isRTL ? step.descAr : step.descEn}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
