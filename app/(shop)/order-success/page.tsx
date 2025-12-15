'use client';

/**
 * Order Success Page
 *
 * Displayed after successful checkout.
 * Shows order confirmation with order number and next steps.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package, Home, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { AppShell } from '@/components/layout';
import { useTranslations } from '@/lib/hooks/use-translations';
import confetti from 'canvas-confetti';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const { isRTL } = useTranslations();
  const [showConfetti, setShowConfetti] = useState(false);

  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');

  // Trigger confetti on mount
  useEffect(() => {
    if (!showConfetti) {
      setShowConfetti(true);
      // Fire confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#4CAF50', '#8BC34A', '#CDDC39']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#4CAF50', '#8BC34A', '#CDDC39']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [showConfetti]);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <AppShell>
      <div className="flex-1 min-w-0 bg-white rounded-2xl px-6 py-6 mx-2 my-2">
        <div className="max-w-lg mx-auto py-12 text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-primary-light, #E8F5E9)' }}
            >
              <CheckCircle
                className="w-14 h-14"
                style={{ color: 'var(--color-primary)' }}
              />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-[28px] font-bold text-[#1A1A1A] mb-3">
            {isRTL ? 'تم تأكيد طلبك!' : 'Order Confirmed!'}
          </h1>

          <p className="text-[16px] text-[#6B7280] mb-6">
            {isRTL
              ? 'شكراً لطلبك. سيتم تجهيز طلبك قريباً.'
              : 'Thank you for your order. Your order will be prepared soon.'}
          </p>

          {/* Order Number */}
          {orderNumber && (
            <div className="bg-[#F9FAFB] rounded-[16px] p-5 mb-8 inline-block">
              <p className="text-[14px] text-[#6B7280] mb-1">
                {isRTL ? 'رقم الطلب' : 'Order Number'}
              </p>
              <p className="text-[24px] font-bold text-[#1A1A1A]">
                {orderNumber}
              </p>
            </div>
          )}

          {/* Status Card */}
          <div className="bg-[#F9FAFB] rounded-[16px] p-6 mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-primary-light, #E8F5E9)' }}
              >
                <Package className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
              </div>
              <div className="text-left">
                <p className="text-[14px] font-semibold text-[#1A1A1A]">
                  {isRTL ? 'حالة الطلب' : 'Order Status'}
                </p>
                <p className="text-[14px] text-[#6B7280]">
                  {isRTL ? 'قيد الانتظار' : 'Pending'}
                </p>
              </div>
            </div>

            <p className="text-[13px] text-[#6B7280]">
              {isRTL
                ? 'سنرسل لك إشعاراً عند تحديث حالة طلبك'
                : 'We\'ll notify you when your order status changes'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {orderId && (
              <Link
                href={`/orders/${orderId}`}
                className="flex items-center justify-center gap-2 w-full h-[52px] rounded-full text-white text-[16px] font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
              >
                <Package className="w-5 h-5" />
                {isRTL ? 'تتبع الطلب' : 'Track Order'}
              </Link>
            )}

            <Link
              href="/orders"
              className="flex items-center justify-center gap-2 w-full h-[52px] rounded-full border border-[#E5E5E5] text-[#1A1A1A] text-[16px] font-semibold transition-colors hover:bg-[#F5F5F5]"
            >
              <ShoppingBag className="w-5 h-5" />
              {isRTL ? 'طلباتي' : 'My Orders'}
            </Link>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full h-[52px] text-[14px] text-[#6B7280] hover:text-[var(--color-primary)] transition-colors"
            >
              <Home className="w-4 h-4" />
              {isRTL ? 'متابعة التسوق' : 'Continue Shopping'}
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
