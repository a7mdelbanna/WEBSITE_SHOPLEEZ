'use client';

/**
 * Loyalty Points Page
 *
 * Displays user's loyalty points and redemption options.
 * Features:
 * - Points balance display with animated counter
 * - Redeem button to open redemption modal
 * - Points history
 * - How to earn points section
 * - RTL support
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Gift,
  Star,
  ShoppingCart,
  Users,
  ChevronRight,
} from 'lucide-react';
import { AppShell } from '@/components/layout';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useAuth } from '@/lib/contexts/auth-context';
import { useProfile } from '@/lib/services/auth';
import { cn } from '@/lib/utils';

// How to earn points steps
const EARN_STEPS = [
  {
    icon: ShoppingCart,
    titleEn: 'Place Orders',
    titleAr: 'قم بطلب الطلبات',
    descEn: 'Earn 1 point for every 10 EGP spent',
    descAr: 'احصل على نقطة واحدة لكل 10 جنيه مصري',
  },
  {
    icon: Users,
    titleEn: 'Refer Friends',
    titleAr: 'ادعُ أصدقاءك',
    descEn: 'Get bonus points when friends sign up',
    descAr: 'احصل على نقاط إضافية عند تسجيل الأصدقاء',
  },
  {
    icon: Star,
    titleEn: 'Rate Orders',
    titleAr: 'قيّم طلباتك',
    descEn: 'Earn points for rating your orders',
    descAr: 'احصل على نقاط مقابل تقييم طلباتك',
  },
];

export default function LoyaltyPage() {
  const router = useRouter();
  const { isRTL } = useTranslations();
  const { isAuthenticated, isLoading: authLoading, openLoginModal } = useAuth();

  // Fetch profile for points
  const { data: profile, isLoading } = useProfile(isAuthenticated);
  const points = profile?.myPoints || 0;

  // Animation state for points counter
  const [displayPoints, setDisplayPoints] = useState(0);

  // Animate points counter
  useEffect(() => {
    if (points > 0) {
      const duration = 1000; // 1 second
      const steps = 30;
      const increment = points / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= points) {
          setDisplayPoints(points);
          clearInterval(timer);
        } else {
          setDisplayPoints(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [points]);

  // Redirect if not authenticated
  useEffect(() => {
    // Don't redirect while still checking authentication
    if (authLoading) return;

    if (!isAuthenticated) {
      openLoginModal();
      router.push('/profile');
    }
  }, [isAuthenticated, openLoginModal, router]);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

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
            {isRTL ? 'نقاط الولاء' : 'Loyalty Points'}
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
            {/* Points Balance Card */}
            <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary)] rounded-[20px] p-6 mb-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Gift className="w-6 h-6" />
                  </div>
                  <span className="text-[14px] opacity-90">
                    {isRTL ? 'رصيد النقاط' : 'Points Balance'}
                  </span>
                </div>
              </div>

              <div className={cn("text-center", isRTL && "text-center")}>
                <span className="text-[48px] font-bold tabular-nums">
                  {displayPoints.toLocaleString()}
                </span>
                <span className="text-[18px] opacity-80 ml-2">
                  {isRTL ? 'نقطة' : 'points'}
                </span>
              </div>

              {/* Redeem Button */}
              <button
                onClick={() => {
                  // TODO: Open redeem modal
                  console.log('Open redeem modal');
                }}
                className="w-full mt-6 py-3 rounded-[12px] bg-white text-[var(--color-primary)] font-semibold hover:bg-white/90 transition-colors"
              >
                {isRTL ? 'استبدال النقاط' : 'Redeem Points'}
              </button>
            </div>

            {/* How to Earn Section */}
            <div className="bg-white rounded-[20px] p-6">
              <h2 className={cn(
                "text-[16px] font-bold text-[#1A1A1A] mb-4",
                isRTL && "text-right"
              )}>
                {isRTL ? 'كيف تكسب النقاط' : 'How to Earn Points'}
              </h2>

              <div className="space-y-4">
                {EARN_STEPS.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-4 p-4 bg-[#F9FAFB] rounded-[12px]",
                        isRTL && "flex-row-reverse"
                      )}
                    >
                      <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] bg-opacity-10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[var(--color-primary)]" />
                      </div>
                      <div className={cn("flex-1", isRTL && "text-right")}>
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

            {/* Points History Link */}
            <Link
              href="/profile/loyalty/history"
              className={cn(
                "flex items-center justify-between p-4 bg-white rounded-[16px] mt-4 hover:bg-[#F9FAFB] transition-colors",
                isRTL && "flex-row-reverse"
              )}
            >
              <span className="text-[14px] font-medium text-[#1A1A1A]">
                {isRTL ? 'سجل النقاط' : 'Points History'}
              </span>
              <ChevronRight className={cn("w-5 h-5 text-[#9CA3AF]", isRTL && "rotate-180")} />
            </Link>
          </>
        )}
      </div>
    </AppShell>
  );
}
